import { dealHands } from "../utils/dealCards.js";

describe("dealHands", () => {
  const params = { serverSeed: "fixed-seed", clientSeed: "table-1", nonce: 0, playerCount: 4 };

  test("deals exactly 3 cards per player", () => {
    const { hands } = dealHands(params);
    expect(hands).toHaveLength(4);
    hands.forEach((hand) => expect(hand).toHaveLength(3));
  });

  test("deals no duplicate cards across all hands", () => {
    const { hands } = dealHands(params);
    const allCards = hands.flat().map((c) => `${c.rank}${c.suit}`);
    expect(new Set(allCards).size).toBe(allCards.length);
  });

  test("is deterministic for identical inputs", () => {
    const a = dealHands(params);
    const b = dealHands(params);
    expect(a.hands).toEqual(b.hands);
  });

  test("produces different hands for a different clientSeed", () => {
    const a = dealHands(params);
    const b = dealHands({ ...params, clientSeed: "table-2" });
    expect(a.hands).not.toEqual(b.hands);
  });
});