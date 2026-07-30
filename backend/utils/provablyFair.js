import crypto from "crypto";

/**
 * Generates a fresh server seed + its SHA-256 hash (the "commitment").
 * The hash is what you show the client BEFORE the round starts.
 * The raw seed is only revealed AFTER the round ends.
 */
export function generateSeedPair() {
  const serverSeed = crypto.randomBytes(32).toString("hex");
  const serverSeedHash = crypto
    .createHash("sha256")
    .update(serverSeed)
    .digest("hex");
  return { serverSeed, serverSeedHash };
}

/**
 * Produces a deterministic stream of "random" floats in [0, 1) from
 * HMAC(serverSeed, clientSeed:nonce:cursor). Game-agnostic — Mines uses
 * this to shuffle tile indices, Wheel Spin would use it to pick a segment.
 *
 * @param {string} serverSeed
 * @param {string} clientSeed
 * @param {number} nonce
 * @param {number} count - how many floats to produce
 * @returns {number[]}
 */
export function generateFloats(serverSeed, clientSeed, nonce, count) {
  const floats = [];
  let cursor = 0;

  while (floats.length < count) {
    const hmac = crypto
      .createHmac("sha256", serverSeed)
      .update(`${clientSeed}:${nonce}:${cursor}`)
      .digest("hex");

    // Take 8 hex chars (32 bits) at a time, normalize to [0, 1)
    for (let i = 0; i + 8 <= hmac.length && floats.length < count; i += 8) {
      const chunk = hmac.slice(i, i + 8);
      const int = parseInt(chunk, 16);
      floats.push(int / 0xffffffff);
    }
    cursor += 1;
  }

  return floats;
}

/**
 * Fisher-Yates shuffle of [0..size-1] driven by the seeded floats,
 * then returns the first `count` indices as the "selected" set
 * (e.g. mine positions, or a winning wheel segment pool of size 1).
 */
export function pickIndices({ serverSeed, clientSeed, nonce, size, count }) {
  const floats = generateFloats(serverSeed, clientSeed, nonce, size);
  const indices = Array.from({ length: size }, (_, i) => i);

  // Fisher-Yates using our deterministic floats instead of Math.random
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(floats[i] * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, count);
}

/**
 * Re-derives the same indices from a REVEALED server seed, so a player
 * (or a test) can independently verify a past round.
 */
export function verifyRound({ serverSeed, serverSeedHash, clientSeed, nonce, size, count }) {
  const recomputedHash = crypto.createHash("sha256").update(serverSeed).digest("hex");
  const hashMatches = recomputedHash === serverSeedHash;
  const indices = pickIndices({ serverSeed, clientSeed, nonce, size, count });
  return { hashMatches, indices };
}
