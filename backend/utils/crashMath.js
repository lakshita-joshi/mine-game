import { generateFloats } from "./provablyFair.js";

// Tuning constant — controls how fast the multiplier climbs.
// At this rate: ~2x around 9s, ~10x around 29s.
const GROWTH_PER_SECOND = 0.08;

export function multiplierAtElapsed(elapsedMs) {
  const seconds = elapsedMs / 1000;
  const raw = Math.exp(GROWTH_PER_SECOND * seconds);
  return Math.max(1, Math.floor(raw * 100) / 100);
}

export function elapsedMsForMultiplier(multiplier) {
  if (multiplier <= 1) return 0;
  return (Math.log(multiplier) / GROWTH_PER_SECOND) * 1000;
}

/**
 * Same provably-fair primitive as Mines (generateFloats from
 * provablyFair.js) — reused rather than reinvented. Produces a
 * heavy-tailed distribution appropriate for crash games: low
 * crash points are common, high ones are rare but possible.
 */
export function computeCrashPoint(serverSeed, clientSeed, nonce, houseEdge = 0.02) {
  const [float] = generateFloats(serverSeed, clientSeed, nonce, 1);
  const raw = (1 - houseEdge) / (1 - float);
  return Math.max(1, Math.floor(raw * 100) / 100);
}