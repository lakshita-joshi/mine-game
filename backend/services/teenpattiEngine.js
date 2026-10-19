import Table from "../models/Table.js";
import { generateSeedPair } from "../utils/provablyFair.js";
import { dealHands } from "../utils/dealCards.js";
import { evaluateHand, compareHands } from "../utils/teenPattiLogic.js";
import { deductStake, creditPayout, getBalance } from "./walletService.js";

export async function joinTable(tableId, userId) {
  const table = await Table.findById(tableId);
  if (!table) throw new Error("Table not found");
  if (table.seats.length >= table.maxSeats) throw new Error("Table is full");
  if (table.seats.some((s) => s.user.equals(userId))) throw new Error("Already seated");

  table.seats.push({ user: userId, seatIndex: table.seats.length });
  await table.save();
  return table;
}

export async function startRound(tableId, userId) {
  const table = await Table.findById(tableId).select("+seats.hand +serverSeed");
  if (!table) throw new Error("Table not found");
  if (table.status === "betting") throw new Error("A round is already in progress");
  if (userId && !table.seats[0]?.user.equals(userId)) {
    throw new Error("Only the host can start the round");
  }
  if (table.seats.length < 2) throw new Error("Need at least 2 players to start");

  const { serverSeed, serverSeedHash } = generateSeedPair();
  const clientSeed = `table-${table._id}`;
  const nonce = table.roundNumber + 1;

  const { hands } = dealHands({ serverSeed, clientSeed, nonce, playerCount: table.seats.length });

  let pot = 0;
  for (let i = 0; i < table.seats.length; i++) {
    const seat = table.seats[i];
    await deductStake(seat.user, table.minStake); // boot amount, forced
    seat.hand = hands[i];
    seat.isPlaying = true;
    seat.hasSeenHand = false;
    seat.currentStake = table.minStake;
    pot += table.minStake;
  }

  table.status = "betting";
  table.pot = pot;
  table.roundNumber = nonce;
  table.currentTurnSeatIndex = 0;
  table.serverSeed = serverSeed;
  table.serverSeedHash = serverSeedHash;
  table.clientSeed = clientSeed;
  table.nonce = nonce;

  await table.save();
  return table;
}

/**
 * NEW: marks the player's hand as seen so the server charges the
 * seen (2x) stake and allows side-show requests.
 */
export async function seeHand(tableId, userId) {
  const table = await Table.findById(tableId);
  if (!table) throw new Error("Table not found");
  const seat = table.seats.find((s) => s.user.equals(userId));
  if (!seat) throw new Error("You are not seated at this table");
  if (table.status !== "betting") throw new Error("No round in progress");
  if (!seat.isPlaying) throw new Error("You have already folded");
  seat.hasSeenHand = true;
  await table.save();
  return table;
}

/**
 * Valid actions: "bet" (Chaal) and "fold".
 * Blind bets cost minStake, seen bets cost minStake * 2.
 */
export async function placeBet(tableId, userId, { action, seesHand }) {
  const table = await Table.findById(tableId).select("+seats.hand +serverSeed");
  const seatIndex = table.seats.findIndex((s) => s.user.equals(userId));
  if (seatIndex === -1) throw new Error("You are not seated at this table");
  if (table.status !== "betting") throw new Error("Betting is not open");
  if (table.currentTurnSeatIndex !== seatIndex) throw new Error("Not your turn");

  const seat = table.seats[seatIndex];
  if (!seat.isPlaying) throw new Error("You have already folded");

  if (action === "fold") {
    seat.isPlaying = false;
  } else if (action === "bet") {
    const stakeMultiplier = seesHand || seat.hasSeenHand ? 2 : 1;
    const amount = table.minStake * stakeMultiplier;

    const balance = await getBalance(userId);
    if (balance < amount) throw new Error(`Insufficient balance — need ${amount}, have ${balance}`);

    if (seesHand) seat.hasSeenHand = true;
    await deductStake(userId, amount);
    seat.currentStake += amount;
    table.pot += amount;
  } else {
    throw new Error("Invalid action");
  }

  advanceTurn(table);

  const stillIn = table.seats.filter((s) => s.isPlaying);
  if (stillIn.length === 1) {
    await resolveRoundByFold(table, stillIn[0]);
  }

  await table.save();
  return table;
}

function findPreviousActiveSeat(table, seatIndex) {
  const seatCount = table.seats.length;
  let prev = (seatIndex - 1 + seatCount) % seatCount;
  let loops = 0;
  while (!table.seats[prev].isPlaying && loops < seatCount) {
    prev = (prev - 1 + seatCount) % seatCount;
    loops += 1;
  }
  return table.seats[prev];
}

export async function requestSideShow(tableId, requesterId) {
  const table = await Table.findById(tableId);
  const requesterIndex = table.seats.findIndex((s) => s.user.equals(requesterId));
  if (requesterIndex === -1) throw new Error("You are not seated at this table");
  if (table.status !== "betting") throw new Error("Side-show is only available during betting");
  if (table.currentTurnSeatIndex !== requesterIndex) throw new Error("Not your turn");

  const requester = table.seats[requesterIndex];
  if (!requester.hasSeenHand) throw new Error("You must see your hand before requesting a side-show");

  const target = findPreviousActiveSeat(table, requesterIndex);
  if (target.user.equals(requesterId)) throw new Error("No other active player to side-show with");
  if (!target.hasSeenHand) throw new Error("The other player hasn't seen their hand yet");

  return {
    requesterId: requester.user,
    targetId: target.user,
  };
}

export async function resolveSideShow(tableId, requesterId, targetId, accepted) {
  const table = await Table.findById(tableId).select("+seats.hand +serverSeed");
  const requesterIndex = table.seats.findIndex((s) => s.user.equals(requesterId));
  const targetSeat = table.seats.find((s) => s.user.equals(targetId));

  if (!accepted) {
    return { accepted: false, table };
  }

  const requesterSeat = table.seats[requesterIndex];
  const requesterHand = evaluateHand(requesterSeat.hand);
  const targetHand = evaluateHand(targetSeat.hand);
  const result = compareHands(requesterHand, targetHand);

  // Tie is a loss for the requester
  const loserSeat = result > 0 ? targetSeat : requesterSeat;
  loserSeat.isPlaying = false;

  advanceTurn(table);

  const stillIn = table.seats.filter((s) => s.isPlaying);
  if (stillIn.length === 1) {
    await resolveRoundByFold(table, stillIn[0]);
  }

  await table.save();
  return { accepted: true, loserId: loserSeat.user, table };
}

export async function autoFoldCurrentPlayer(tableId) {
  const table = await Table.findById(tableId).select("+seats.hand +serverSeed");
  if (!table || table.status !== "betting") return null;

  const seat = table.seats[table.currentTurnSeatIndex];
  if (!seat || !seat.isPlaying) return null;

  seat.isPlaying = false;
  advanceTurn(table);

  const stillIn = table.seats.filter((s) => s.isPlaying);
  if (stillIn.length === 1) {
    await resolveRoundByFold(table, stillIn[0]);
  }

  await table.save();
  return table;
}

function advanceTurn(table) {
  const seatCount = table.seats.length;
  let next = (table.currentTurnSeatIndex + 1) % seatCount;
  let loops = 0;
  while (!table.seats[next].isPlaying && loops < seatCount) {
    next = (next + 1) % seatCount;
    loops += 1;
  }
  table.currentTurnSeatIndex = next;
}

async function resolveRoundByFold(table, winnerSeat) {
  table.status = "finished";
  const payout = table.pot;
  await creditPayout(winnerSeat.user, payout);
  table.pot = 0;
}

/**
 * userId is optional so existing callers keep working. When passed,
 * only a seated, active player whose turn it is can call a showdown.
 */
export async function requestShowdown(tableId, userId) {
  const table = await Table.findById(tableId).select("+seats.hand +serverSeed");
  if (!table) throw new Error("Table not found");
  if (table.status !== "betting") throw new Error("Betting is not open");

  if (userId) {
    const seatIndex = table.seats.findIndex((s) => s.user.equals(userId));
    if (seatIndex === -1) throw new Error("You are not seated at this table");
    if (!table.seats[seatIndex].isPlaying) throw new Error("You have already folded");
    if (table.currentTurnSeatIndex !== seatIndex) throw new Error("Not your turn");
  }

  const activeSeats = table.seats.filter((s) => s.isPlaying);
  if (activeSeats.length < 2) throw new Error("Showdown requires at least 2 active players");

  let winner = activeSeats[0];
  let winnerHand = evaluateHand(winner.hand);
  for (const seat of activeSeats.slice(1)) {
    const hand = evaluateHand(seat.hand);
    if (compareHands(hand, winnerHand) > 0) {
      winner = seat;
      winnerHand = hand;
    }
  }

  table.status = "finished";
  const payout = table.pot;
  await creditPayout(winner.user, payout);
  table.pot = 0;
  await table.save();

  return {
    winnerId: winner.user,
    serverSeed: table.serverSeed,
    hands: table.seats.map((s) => ({ userId: s.user, hand: s.isPlaying ? s.hand : null })),
    table,
  };
}

export async function leaveTable(tableId, userId) {
  const table = await Table.findById(tableId);
  if (!table) return null;

  const seatIndex = table.seats.findIndex((s) => s.user.equals(userId));
  if (seatIndex === -1) return null;

  const seat = table.seats[seatIndex];
  seat.leftTable = true;

  if (table.status === "betting" && seat.isPlaying) {
    seat.isPlaying = false;
    if (table.currentTurnSeatIndex === seatIndex) advanceTurn(table);

    const stillIn = table.seats.filter((s) => s.isPlaying);
    if (stillIn.length === 1) {
      await resolveRoundByFold(table, stillIn[0]);
    }
  }

  if (table.status !== "betting") {
    table.seats = table.seats.filter((s) => !s.leftTable);
    table.seats.forEach((s, i) => (s.seatIndex = i));
  }

  try {
    await table.save();
  } catch (err) {
    if (err.name === "VersionError") {
      return null;
    }
    throw err;
  }

  if (table.seats.length === 0) {
    await Table.findByIdAndDelete(tableId);
    return null;
  }

  return table;
}