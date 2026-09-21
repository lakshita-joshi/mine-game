// Deliberately NOT reusing cards.js's rankValue() — that function
// treats Ace as high (14), correct for Mines/Teen Patti. Dragon Tiger
// uses Ace LOW. Reusing the wrong function here would silently mis-rank
// every hand involving an Ace, so this gets its own explicit mapping.
const DT_RANK_ORDER = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function dragonTigerRankValue(rank) {
  return DT_RANK_ORDER.indexOf(rank) + 1; // A=1, 2=2, ..., K=13
}

export function resolveDragonTiger(dragonCard, tigerCard) {
  const d = dragonTigerRankValue(dragonCard.rank);
  const t = dragonTigerRankValue(tigerCard.rank);
  if (d > t) return "dragon";
  if (t > d) return "tiger";
  return "tie";
}

// Profit multipliers (NOT total return — total return = stake * (1 + multiplier)).
// Standard Dragon Tiger table odds; tie payout varies by casino, 8:1 used here.
export const WIN_PROFIT_MULTIPLIER = 1;
export const TIE_PROFIT_MULTIPLIER = 8;

/**
 * Always returns a breakdown with all three keys present (0 for any
 * losing bet) so the frontend never has to guess whether a missing
 * key means "lost" or "wasn't computed yet".
 *
 * SIMPLIFICATION: on a tie, dragon/tiger bets fully lose. Some real
 * casinos return half the stake on a tie for dragon/tiger bets —
 * that rule is NOT implemented here.
 */
export function computePayout(bets, outcome) {
  const breakdown = { dragon: 0, tiger: 0, tie: 0 };

  if (outcome === "dragon" && bets.dragon > 0) {
    breakdown.dragon = bets.dragon * (1 + WIN_PROFIT_MULTIPLIER);
  }
  if (outcome === "tiger" && bets.tiger > 0) {
    breakdown.tiger = bets.tiger * (1 + WIN_PROFIT_MULTIPLIER);
  }
  if (outcome === "tie" && bets.tie > 0) {
    breakdown.tie = bets.tie * (1 + TIE_PROFIT_MULTIPLIER);
  }

  const totalPayout = breakdown.dragon + breakdown.tiger + breakdown.tie;
  return { totalPayout, breakdown };
}