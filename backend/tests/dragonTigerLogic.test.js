import { dragonTigerRankValue, resolveDragonTiger, computePayout } from "../services/dragonTigerLogic.js";

describe("dragonTigerRankValue", () => {
  test("Ace is the lowest rank (1), not 14", () => {
    expect(dragonTigerRankValue("A")).toBe(1);
  });
  test("King is the highest rank (13)", () => {
    expect(dragonTigerRankValue("K")).toBe(13);
  });
  test("orders numerically for number ranks", () => {
    expect(dragonTigerRankValue("2")).toBeLessThan(dragonTigerRankValue("10"));
  });
});

describe("resolveDragonTiger", () => {
  test("dragon wins with a higher card", () => {
    expect(resolveDragonTiger({ rank: "K", suit: "S" }, { rank: "5", suit: "H" })).toBe("dragon");
  });
  test("tiger wins with a higher card", () => {
    expect(resolveDragonTiger({ rank: "3", suit: "S" }, { rank: "9", suit: "H" })).toBe("tiger");
  });
  test("Ace loses to a 2, since Ace is low here", () => {
    expect(resolveDragonTiger({ rank: "A", suit: "S" }, { rank: "2", suit: "H" })).toBe("tiger");
  });
  test("same rank is a tie regardless of suit", () => {
    expect(resolveDragonTiger({ rank: "7", suit: "S" }, { rank: "7", suit: "D" })).toBe("tie");
  });
});

describe("computePayout", () => {
  test("dragon win pays only the dragon bet, others are 0", () => {
    const { totalPayout, breakdown } = computePayout({ dragon: 100, tiger: 50, tie: 20 }, "dragon");
    expect(breakdown).toEqual({ dragon: 200, tiger: 0, tie: 0 });
    expect(totalPayout).toBe(200);
  });

  test("tiger win pays only the tiger bet", () => {
    const { breakdown } = computePayout({ dragon: 100, tiger: 50, tie: 20 }, "tiger");
    expect(breakdown).toEqual({ dragon: 0, tiger: 100, tie: 0 });
  });

  test("tie pays only the tie bet at 8:1 profit; dragon/tiger bets lose fully", () => {
    const { breakdown, totalPayout } = computePayout({ dragon: 100, tiger: 50, tie: 20 }, "tie");
    expect(breakdown).toEqual({ dragon: 0, tiger: 0, tie: 180 }); // 20 * (1+8)
    expect(totalPayout).toBe(180);
  });

  test("a bet placed on a losing outcome pays 0, not undefined", () => {
    const { breakdown } = computePayout({ dragon: 0, tiger: 100, tie: 0 }, "dragon");
    expect(breakdown.tiger).toBe(0);
  });

  test("no bets placed on the winning outcome means zero total payout", () => {
    const { totalPayout } = computePayout({ dragon: 0, tiger: 0, tie: 50 }, "dragon");
    expect(totalPayout).toBe(0);
  });
});