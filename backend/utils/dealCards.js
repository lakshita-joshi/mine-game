import { createDeck } from "./cards.js";
import { shuffleDeck } from "./provablyFair.js";

/**
 * Deals 3 cards to each of `playerCount` seats from a provably-fair
 * shuffle. Returns { hands: [[card,card,card], ...], remainingDeckOrder }
 * — remainingDeckOrder isn't used by Teen Patti (no draws), but keeping
 * it makes this function reusable for a future draw-based game like Rummy.
 */
export function dealHands({ serverSeed, clientSeed, nonce, playerCount }) {
  const deck = createDeck(); // 52 cards, fixed order
  const shuffledOrder = shuffleDeck({ serverSeed, clientSeed, nonce, deckSize: deck.length });
  const shuffledDeck = shuffledOrder.map((i) => deck[i]);

  const hands = [];
  for (let p = 0; p < playerCount; p++) {
    hands.push(shuffledDeck.slice(p * 3, p * 3 + 3));
  }

  return { hands, remainingDeckOrder: shuffledDeck.slice(playerCount * 3) };
}