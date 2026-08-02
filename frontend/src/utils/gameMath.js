export const GRID_SIZE = 25;
export const GRID_COLS = 5;
export const HOUSE_EDGE = 0.02;
export const START_BALANCE = 1000;

/**
 * Fair multiplier for revealing `k` safe tiles, before house edge.
 * Mirrors the backend's services/minesLogic.js exactly, so the UI
 * can preview a multiplier locally before the server responds.
 * The server's calculation remains the source of truth for payouts.
 */
export function fairMultiplier(gridSize, mineCount, k) {
  let product = 1;
  for (let i = 0; i < k; i++) {
    product *= (gridSize - mineCount - i) / (gridSize - i);
  }
  return product;
}

export function payoutMultiplier(gridSize, mineCount, k) {
  if (k === 0) return 1;
  const fair = fairMultiplier(gridSize, mineCount, k);
  return (1 / fair) * (1 - HOUSE_EDGE);
}
