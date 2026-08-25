const GROWTH_PER_SECOND = 0.08;

export function multiplierAtElapsed(elapsedMs) {
  const seconds = elapsedMs / 1000;
  const raw = Math.exp(GROWTH_PER_SECOND * seconds);
  return Math.max(1, Math.floor(raw * 100) / 100);
}