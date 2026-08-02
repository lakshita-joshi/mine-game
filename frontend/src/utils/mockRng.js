/**
 * Mock mine placement for local/offline demo purposes ONLY.
 *
 * In production this entire function is unused — the server decides
 * mine positions via the provably-fair scheme (see the backend's
 * utils/provablyFair.js) and never sends them to the client until
 * the round ends. Delete this file once api/minesApi.js is wired to
 * the real endpoints.
 */
export function mockMinePositions(gridSize, mineCount) {
  const pool = Array.from({ length: gridSize }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, mineCount));
}
