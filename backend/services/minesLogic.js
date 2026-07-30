const HOUSE_EDGE = Number(process.env.HOUSE_EDGE ?? 0.02);

/**
 * Fair multiplier for revealing `k` safe tiles out of `gridSize` tiles
 * with `mineCount` mines, before the house edge is applied.
 */
export function fairMultiplier(gridSize, mineCount, k) {
  let product = 1;
  for (let i = 0; i < k; i++) {
    product *= (gridSize - mineCount - i) / (gridSize - i);
  }
  return product;
}

/**
 * Actual payout multiplier shown to the player, after house edge.
 */
export function payoutMultiplier(gridSize, mineCount, k) {
  if (k === 0) return 1;
  const fair = fairMultiplier(gridSize, mineCount, k);
  return (1 / fair) * (1 - HOUSE_EDGE);
}

export function validateMineConfig(gridSize, mineCount) {
  if (!Number.isInteger(gridSize) || gridSize < 4 || gridSize > 100) {
    throw new Error("Invalid grid size");
  }
  if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount >= gridSize) {
    throw new Error("Mine count must be between 1 and gridSize - 1");
  }
}

export function validateTileIndex(gridSize, tileIndex) {
  if (!Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= gridSize) {
    throw new Error("Invalid tile index");
  }
}
