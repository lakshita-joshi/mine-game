import GameSession from "../models/GameSession.js";
import { generateSeedPair } from "../utils/provablyFair.js";
import { computeCrashPoint, multiplierAtElapsed } from "../utils/crashMath.js";
import { deductStake, creditPayout } from "./walletService.js";

const BETTING_DURATION_MS = 5000;
const CRASH_PAUSE_MS = 3000;
const TICK_INTERVAL_MS = 100;

let io = null;
let roundNumber = 0;
let current = null; // { status, roundId, serverSeed, serverSeedHash, clientSeed, nonce, crashPoint, startedAt, bets: Map<userId, {sessionId, stake, cashedOut}> }
let tickTimer = null;

export function initCrashEngine(socketIoInstance) {
  io = socketIoInstance;
  startBettingPhase();
}

function startBettingPhase() {
  roundNumber += 1;
  const { serverSeed, serverSeedHash } = generateSeedPair();
  const clientSeed = "public-crash-seed"; // fixed, public — see note in Step 3 write-up
  const crashPoint = computeCrashPoint(serverSeed, clientSeed, roundNumber);

  current = {
    status: "betting",
    roundId: roundNumber,
    serverSeed,
    serverSeedHash,
    clientSeed,
    nonce: roundNumber,
    crashPoint,
    startedAt: null,
    bets: new Map(),
  };

  io.emit("round:betting", {
    roundId: current.roundId,
    serverSeedHash: current.serverSeedHash,
    bettingEndsInMs: BETTING_DURATION_MS,
  });

  setTimeout(startRunningPhase, BETTING_DURATION_MS);
}

function startRunningPhase() {
  current.status = "running";
  current.startedAt = Date.now();

  io.emit("round:started", { roundId: current.roundId, startedAt: current.startedAt });

  tickTimer = setInterval(checkForCrash, TICK_INTERVAL_MS);
}

async function checkForCrash() {
  const elapsed = Date.now() - current.startedAt;
  const liveMultiplier = multiplierAtElapsed(elapsed);

  if (liveMultiplier >= current.crashPoint) {
    clearInterval(tickTimer);
    await resolveCrash();
  }
}

async function resolveCrash() {
  current.status = "crashed";

  // Anyone still holding an uncashed bet loses their stake — mark busted.
  for (const [, bet] of current.bets) {
    if (!bet.cashedOut) {
      await GameSession.findByIdAndUpdate(bet.sessionId, { status: "busted", payout: 0 });
    }
  }

  io.emit("round:crashed", {
    roundId: current.roundId,
    crashPoint: current.crashPoint,
    serverSeed: current.serverSeed, // disclosed now — provably-fair reveal
  });

  setTimeout(startBettingPhase, CRASH_PAUSE_MS);
}

export async function placeBet(userId, stake) {
  if (current.status !== "betting") throw new Error("Betting is closed for this round");
  if (current.bets.has(userId)) throw new Error("You already placed a bet this round");

  await deductStake(userId, stake); // throws InsufficientFundsError if not enough

  const session = await GameSession.create({
    user: userId,
    gameType: "crash",
    stake,
    status: "active",
    serverSeedHash: current.serverSeedHash,
    clientSeed: current.clientSeed,
    nonce: current.nonce,
    gameData: { roundId: current.roundId },
  });

  current.bets.set(userId, { sessionId: session._id, stake, cashedOut: false });
  return { sessionId: session._id, roundId: current.roundId };
}

export async function cashOut(userId) {
  if (current.status !== "running") throw new Error("Round is not currently running");

  const bet = current.bets.get(userId);
  if (!bet || bet.cashedOut) throw new Error("No active bet to cash out");

  const elapsed = Date.now() - current.startedAt;
  const multiplier = multiplierAtElapsed(elapsed);

  if (multiplier >= current.crashPoint) throw new Error("Too late — round already crashed");

  const payout = Math.round(bet.stake * multiplier);
  bet.cashedOut = true;

  await GameSession.findByIdAndUpdate(bet.sessionId, {
    status: "cashed_out",
    payout,
    currentMultiplier: multiplier,
  });
  const newBalance = await creditPayout(userId, payout);

  io.emit("round:cashout", { username: null, multiplier, payout }); // username filled in by the socket handler (Step 3)
  return { multiplier, payout, newBalance };
}

export function getCurrentRoundSnapshot() {
  if (!current) return null;
  return { status: current.status, roundId: current.roundId, serverSeedHash: current.serverSeedHash, startedAt: current.startedAt };
}