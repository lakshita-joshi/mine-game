import { multiplierAtElapsed, elapsedMsForMultiplier, computeCrashPoint } from "../utils/crashMath.js";

describe("multiplierAtElapsed", () => {
  test("starts at 1x", () => {
    expect(multiplierAtElapsed(0)).toBe(1);
  });
  test("increases over time", () => {
    expect(multiplierAtElapsed(5000)).toBeGreaterThan(multiplierAtElapsed(1000));
  });
});

describe("elapsedMsForMultiplier", () => {
  test("is the inverse of multiplierAtElapsed", () => {
    const target = 3.5;
    const elapsed = elapsedMsForMultiplier(target);
    expect(multiplierAtElapsed(elapsed)).toBeCloseTo(target, 1);
  });
});

describe("computeCrashPoint", () => {
  test("is deterministic for identical inputs", () => {
    const a = computeCrashPoint("seed1", "client1", 0);
    const b = computeCrashPoint("seed1", "client1", 0);
    expect(a).toBe(b);
  });
  test("never returns below 1x", () => {
    for (let i = 0; i < 50; i++) {
      expect(computeCrashPoint(`seed${i}`, "client", i)).toBeGreaterThanOrEqual(1);
    }
  });
});