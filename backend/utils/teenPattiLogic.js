import { rankValue } from "./cards.js";

// Higher number = better hand category
export const HAND_RANKS = {
  HIGH_CARD: 0,
  PAIR: 1,
  COLOR: 2,      // flush — same suit, not sequential
  SEQUENCE: 3,   // straight — sequential, mixed suits
  PURE_SEQUENCE: 4, // straight flush — sequential, same suit
  TRAIL: 5,      // three of a kind
};

/**
 * Classifies a 3-card hand. Returns { category, tiebreakers }
 * where tiebreakers is a sorted array of rank values used to
 * break ties between two hands of the same category.
 */
export function evaluateHand(cards) {
  const values = cards.map((c) => rankValue(c.rank)).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);
  const isSameSuit = suits.every((s) => s === suits[0]);

  const isSequence = checkSequence(values);

  const rankCounts = {};
  for (const v of values) rankCounts[v] = (rankCounts[v] || 0) + 1;
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (counts[0] === 3) {
    return { category: HAND_RANKS.TRAIL, tiebreakers: values };
  }
  if (isSequence && isSameSuit) {
    return { category: HAND_RANKS.PURE_SEQUENCE, tiebreakers: normalizeAceLow(values) };
  }
  if (isSequence) {
    return { category: HAND_RANKS.SEQUENCE, tiebreakers: normalizeAceLow(values) };
  }
  if (isSameSuit) {
    return { category: HAND_RANKS.COLOR, tiebreakers: values };
  }
  if (counts[0] === 2) {
    // Pair — tiebreakers: pair value first, then the kicker
    const pairValue = Number(Object.keys(rankCounts).find((k) => rankCounts[k] === 2));
    const kicker = values.find((v) => v !== pairValue);
    return { category: HAND_RANKS.PAIR, tiebreakers: [pairValue, kicker] };
  }
  return { category: HAND_RANKS.HIGH_CARD, tiebreakers: values };
}

function checkSequence(sortedDescValues) {
  const [a, b, c] = sortedDescValues;
  if (a - b === 1 && b - c === 1) return true;
  // Special case: A-2-3 counts as a sequence (Ace low)
  if (a === 14 && b === 3 && c === 2) return true;
  return false;
}

// A-2-3 should compare as LOW (3 high), not as Ace-high, when ranking sequences
function normalizeAceLow(values) {
  const [a, b, c] = values;
  if (a === 14 && b === 3 && c === 2) return [3, 2, 1];
  return values;
}

/**
 * Compares two evaluated hands. Returns 1 if handA wins, -1 if
 * handB wins, 0 for a true tie (rare, but possible with identical
 * ranks across suits).
 */
export function compareHands(handA, handB) {
  if (handA.category !== handB.category) {
    return handA.category > handB.category ? 1 : -1;
  }
  for (let i = 0; i < handA.tiebreakers.length; i++) {
    if (handA.tiebreakers[i] !== handB.tiebreakers[i]) {
      return handA.tiebreakers[i] > handB.tiebreakers[i] ? 1 : -1;
    }
  }
  return 0;
}