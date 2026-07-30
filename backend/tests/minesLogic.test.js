import { fairMultiplier, payoutMultiplier, validateMineConfig, validateTileIndex } from "../services/minesLogic.js";

describe("fairMultiplier", () => {
  test("returns 1 for k=0", () => {
    expect(fairMultiplier(25, 3, 0)).toBe(1);
  });

  test("matches known probability for first pick", () => {
    // 25 tiles, 3 mines -> 22/25 chance of a safe first pick
    expect(fairMultiplier(25, 3, 1)).toBeCloseTo(22 / 25, 10);
  });

  test("compounds correctly over multiple picks", () => {
    const expected = (22 / 25) * (21 / 24);
    expect(fairMultiplier(25, 3, 2)).toBeCloseTo(expected, 10);
  });
});

describe("payoutMultiplier", () => {
  test("returns 1x with zero reveals", () => {
    expect(payoutMultiplier(25, 3, 0)).toBe(1);
  });

  test("is always greater than the fair multiplier's inverse minus house edge", () => {
    const k = 5;
    const fair = fairMultiplier(25, 3, k);
    const payout = payoutMultiplier(25, 3, k);
    expect(payout).toBeCloseTo((1 / fair) * (1 - 0.02), 6);
  });

  test("increases monotonically as more tiles are revealed", () => {
    const m1 = payoutMultiplier(25, 3, 1);
    const m2 = payoutMultiplier(25, 3, 2);
    const m3 = payoutMultiplier(25, 3, 3);
    expect(m2).toBeGreaterThan(m1);
    expect(m3).toBeGreaterThan(m2);
  });
});

describe("validateMineConfig", () => {
  test("throws for mineCount >= gridSize", () => {
    expect(() => validateMineConfig(25, 25)).toThrow();
  });
  test("throws for non-integer gridSize", () => {
    expect(() => validateMineConfig(25.5, 3)).toThrow();
  });
  test("passes for valid config", () => {
    expect(() => validateMineConfig(25, 3)).not.toThrow();
  });
});

describe("validateTileIndex", () => {
  test("throws for out-of-range index", () => {
    expect(() => validateTileIndex(25, 25)).toThrow();
    expect(() => validateTileIndex(25, -1)).toThrow();
  });
  test("passes for valid index", () => {
    expect(() => validateTileIndex(25, 0)).not.toThrow();
    expect(() => validateTileIndex(25, 24)).not.toThrow();
  });
});
