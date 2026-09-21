import { z } from "zod";
import GameSession from "../models/GameSession.js";
import { deductStake, creditPayout, getBalance } from "../services/walletService.js";
import { generateSeedPair, pickIndices } from "../utils/provablyFair.js";
import { createDeck } from "../utils/cards.js";
import { resolveDragonTiger, computePayout } from "../services/dragonTigerLogic.js";

const playSchema = z
  .object({
    dragon: z.number().int().min(0).default(0),
    tiger: z.number().int().min(0).default(0),
    tie: z.number().int().min(0).default(0),
    clientSeed: z.string().min(1).max(128),
  })
  .refine((data) => data.dragon + data.tiger + data.tie > 0, {
    message: "Place at least one bet",
  });

export async function play(req, res) {
  const parsed = playSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { dragon, tiger, tie, clientSeed } = parsed.data;

  const totalStake = dragon + tiger + tie;

  try {
    await deductStake(req.user.id, totalStake);
  } catch (err) {
    return res.status(err.statusCode ?? 400).json({ error: err.message });
  }

  const { serverSeed, serverSeedHash } = generateSeedPair();
  const nonce = 0;

  // Full 52-card shuffle, take the first 2 shuffled positions as the
  // dealt cards — same primitive Mines uses for mine positions, just
  // with count=2 instead of the mine count.
  const [dragonIndex, tigerIndex] = pickIndices({
    serverSeed,
    clientSeed,
    nonce,
    size: 52,
    count: 2,
  });
  const deck = createDeck();
  const dragonCard = deck[dragonIndex];
  const tigerCard = deck[tigerIndex];

  const outcome = resolveDragonTiger(dragonCard, tigerCard);
  const { totalPayout, breakdown } = computePayout({ dragon, tiger, tie }, outcome);

  const newBalance = totalPayout > 0
    ? await creditPayout(req.user.id, totalPayout)
    : await getBalance(req.user.id);

  await GameSession.create({
    user: req.user.id,
    gameType: "dragontiger",
    stake: totalStake,
    status: totalPayout > 0 ? "cashed_out" : "busted",
    payout: totalPayout,
    currentMultiplier: totalStake > 0 ? totalPayout / totalStake : 0,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce,
    gameData: { dragonCard, tigerCard, outcome, bets: { dragon, tiger, tie }, breakdown },
  });

  // Fully resolved in one request — the seed is disclosed immediately,
  // same as Mines discloses it at bust/cashout, just with no
  // intermediate "hidden" phase since there's nothing left to hide
  // once this response is sent.
  res.status(201).json({
    dragonCard,
    tigerCard,
    outcome,
    totalPayout,
    breakdown,
    newBalance,
    serverSeed,
    serverSeedHash,
  });
}