import { z } from "zod";
import GameSession from "../models/GameSession.js";
import { deductStake, creditPayout } from "../services/walletService.js";
import { generateSeedPair, pickIndices } from "../utils/provablyFair.js";
import {
  fairMultiplier,
  payoutMultiplier,
  validateMineConfig,
  validateTileIndex,
} from "../services/minesLogic.js";

const startSchema = z.object({
  stake: z.number().positive(),
  gridSize: z.number().int().min(4).max(100).default(25),
  mineCount: z.number().int().min(1),
  clientSeed: z.string().min(1).max(128),
});

const actionSchema = z.object({
  sessionId: z.string().min(1),
});

const revealSchema = actionSchema.extend({
  tileIndex: z.number().int(),
});

// Strip anything the client shouldn't see before the round ends
function toPublicSession(session) {
  return {
    id: session._id,
    gameType: session.gameType,
    stake: session.stake,
    status: session.status,
    currentMultiplier: session.currentMultiplier,
    payout: session.payout,
    serverSeedHash: session.serverSeedHash,
    revealedTiles: session.gameData?.revealedTiles ?? [],
    gridSize: session.gameData?.gridSize,
    mineCount: session.gameData?.mineCount,
  };
}

export async function startGame(req, res) {
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { stake, gridSize, mineCount, clientSeed } = parsed.data;

  try {
    validateMineConfig(gridSize, mineCount);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  try {
    await deductStake(req.user.id, stake);
  } catch (err) {
    return res.status(err.statusCode ?? 400).json({ error: err.message });
  }

  const { serverSeed, serverSeedHash } = generateSeedPair();
  const nonce = 0;
  const minePositions = pickIndices({
    serverSeed,
    clientSeed,
    nonce,
    size: gridSize,
    count: mineCount,
  });

  const session = await GameSession.create({
    user: req.user.id,
    gameType: "mines",
    stake,
    status: "active",
    currentMultiplier: 1,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce,
    gameData: {
      gridSize,
      mineCount,
      minePositions,
      revealedTiles: [],
    },
  });

  res.status(201).json(toPublicSession(session));
}

export async function revealTile(req, res) {
  const parsed = revealSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { sessionId, tileIndex } = parsed.data;

  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user.id,
    gameType: "mines",
    status: "active",
  }).select("+gameData +serverSeed");

  if (!session) {
    return res.status(404).json({ error: "No active game found" });
  }

  const { gridSize, mineCount, minePositions, revealedTiles } = session.gameData;

  try {
    validateTileIndex(gridSize, tileIndex);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  if (revealedTiles.includes(tileIndex)) {
    return res.status(400).json({ error: "Tile already revealed" });
  }

  const hitMine = minePositions.includes(tileIndex);

  if (hitMine) {
    session.status = "busted";
    session.payout = 0;
    await session.save();
    return res.json({
      safe: false,
      minePositions, // only revealed now that the round is over
      serverSeed: session.serverSeed, // disclosed for verification
    });
  }

  session.gameData.revealedTiles = [...revealedTiles, tileIndex];
  session.currentMultiplier = payoutMultiplier(
    gridSize,
    mineCount,
    session.gameData.revealedTiles.length
  );
  session.markModified("gameData");
  await session.save();

  res.json({
    safe: true,
    multiplier: session.currentMultiplier,
    revealedTiles: session.gameData.revealedTiles,
  });
}

export async function cashOut(req, res) {
  const parsed = actionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { sessionId } = parsed.data;

  const session = await GameSession.findOne({
    _id: sessionId,
    user: req.user.id,
    gameType: "mines",
    status: "active",
  }).select("+gameData +serverSeed");

  if (!session) {
    return res.status(404).json({ error: "No active game found" });
  }

  if (session.gameData.revealedTiles.length === 0) {
    return res.status(400).json({ error: "Reveal at least one tile before cashing out" });
  }

  const payout = Math.round(session.stake * session.currentMultiplier);
  session.status = "cashed_out";
  session.payout = payout;
  await session.save();

  const newBalance = await creditPayout(req.user.id, payout);

  res.json({
    payout,
    newBalance,
    serverSeed: session.serverSeed, // disclosed so the round can be verified
    minePositions: session.gameData.minePositions,
  });
}

export async function getSession(req, res) {
  const session = await GameSession.findOne({
    _id: req.params.id,
    user: req.user.id,
    gameType: "mines",
  }).select("+gameData");

  if (!session) return res.status(404).json({ error: "Session not found" });
  res.json(toPublicSession(session));
}
