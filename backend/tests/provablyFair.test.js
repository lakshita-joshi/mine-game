import crypto from "crypto";
import { generateSeedPair, pickIndices, verifyRound } from "../utils/provablyFair.js";

describe("generateSeedPair", () => {
  test("hash correctly corresponds to the seed", () => {
    const { serverSeed, serverSeedHash } = generateSeedPair();
    const recomputed = crypto.createHash("sha256").update(serverSeed).digest("hex");
    expect(recomputed).toBe(serverSeedHash);
  });

  test("produces a different seed each call", () => {
    const a = generateSeedPair();
    const b = generateSeedPair();
    expect(a.serverSeed).not.toBe(b.serverSeed);
  });
});

describe("pickIndices", () => {
  const params = { serverSeed: "fixed-seed-for-test", clientSeed: "player123", nonce: 0, size: 25, count: 3 };

  test("is deterministic for identical inputs", () => {
    const first = pickIndices(params);
    const second = pickIndices(params);
    expect(first).toEqual(second);
  });

  test("returns the requested count of unique indices within range", () => {
    const result = pickIndices(params);
    expect(result).toHaveLength(3);
    expect(new Set(result).size).toBe(3);
    result.forEach((i) => {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(25);
    });
  });

  test("changes output when clientSeed changes", () => {
    const a = pickIndices(params);
    const b = pickIndices({ ...params, clientSeed: "different-player" });
    expect(a).not.toEqual(b);
  });

  test("changes output when nonce changes", () => {
    const a = pickIndices(params);
    const b = pickIndices({ ...params, nonce: 1 });
    expect(a).not.toEqual(b);
  });
});

describe("verifyRound", () => {
  test("confirms hash match and reproduces original indices", () => {
    const { serverSeed, serverSeedHash } = generateSeedPair();
    const clientSeed = "player123";
    const nonce = 0;
    const original = pickIndices({ serverSeed, clientSeed, nonce, size: 25, count: 3 });

    const result = verifyRound({ serverSeed, serverSeedHash, clientSeed, nonce, size: 25, count: 3 });

    expect(result.hashMatches).toBe(true);
    expect(result.indices).toEqual(original);
  });

  test("detects a tampered seed", () => {
    const { serverSeed, serverSeedHash } = generateSeedPair();
    const result = verifyRound({
      serverSeed: serverSeed + "tampered",
      serverSeedHash,
      clientSeed: "x",
      nonce: 0,
      size: 25,
      count: 3,
    });
    expect(result.hashMatches).toBe(false);
  });
});
