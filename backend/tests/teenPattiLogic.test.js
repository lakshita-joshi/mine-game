import { evaluateHand, compareHands, HAND_RANKS } from "../utils/teenPattiLogic.js";

const card = (rank, suit) => ({ rank, suit });

describe("evaluateHand", () => {
  test("detects a trail (three of a kind)", () => {
    const hand = evaluateHand([card("K", "S"), card("K", "H"), card("K", "D")]);
    expect(hand.category).toBe(HAND_RANKS.TRAIL);
  });

  test("detects a pure sequence (straight flush)", () => {
    const hand = evaluateHand([card("4", "S"), card("5", "S"), card("6", "S")]);
    expect(hand.category).toBe(HAND_RANKS.PURE_SEQUENCE);
  });

  test("detects a sequence across suits", () => {
    const hand = evaluateHand([card("4", "S"), card("5", "H"), card("6", "D")]);
    expect(hand.category).toBe(HAND_RANKS.SEQUENCE);
  });

  test("treats A-2-3 as a valid low sequence", () => {
    const hand = evaluateHand([card("A", "S"), card("2", "H"), card("3", "D")]);
    expect(hand.category).toBe(HAND_RANKS.SEQUENCE);
  });

  test("detects a color (flush)", () => {
    const hand = evaluateHand([card("2", "S"), card("7", "S"), card("K", "S")]);
    expect(hand.category).toBe(HAND_RANKS.COLOR);
  });

  test("detects a pair", () => {
    const hand = evaluateHand([card("9", "S"), card("9", "H"), card("2", "D")]);
    expect(hand.category).toBe(HAND_RANKS.PAIR);
  });

  test("falls back to high card", () => {
    const hand = evaluateHand([card("2", "S"), card("7", "H"), card("K", "D")]);
    expect(hand.category).toBe(HAND_RANKS.HIGH_CARD);
  });
});

describe("compareHands", () => {
  test("trail beats pure sequence", () => {
    const trail = evaluateHand([card("2", "S"), card("2", "H"), card("2", "D")]);
    const pureSeq = evaluateHand([card("K", "S"), card("Q", "S"), card("J", "S")]);
    expect(compareHands(trail, pureSeq)).toBe(1);
  });

  test("higher trail beats lower trail", () => {
    const kings = evaluateHand([card("K", "S"), card("K", "H"), card("K", "D")]);
    const twos = evaluateHand([card("2", "S"), card("2", "H"), card("2", "D")]);
    expect(compareHands(kings, twos)).toBe(1);
  });

  test("A-2-3 sequence loses to 4-5-6 sequence", () => {
    const aceLow = evaluateHand([card("A", "S"), card("2", "H"), card("3", "D")]);
    const fourFiveSix = evaluateHand([card("4", "S"), card("5", "H"), card("6", "D")]);
    expect(compareHands(fourFiveSix, aceLow)).toBe(1);
  });

  test("pair with higher kicker wins over identical pair", () => {
    const pairKingHighKicker = evaluateHand([card("9", "S"), card("9", "H"), card("K", "D")]);
    const pairKingLowKicker = evaluateHand([card("9", "C"), card("9", "D"), card("3", "S")]);
    expect(compareHands(pairKingHighKicker, pairKingLowKicker)).toBe(1);
  });
});