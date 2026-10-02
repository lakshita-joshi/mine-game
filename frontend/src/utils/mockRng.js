/**
 * Mock mine placement for local/offline demo purposes.
 */
export function mockMinePositions(gridSize, mineCount) {
  const pool = Array.from({ length: gridSize }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, mineCount));
}
