import mongoose from "mongoose";

const gameSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    gameType: { type: String, required: true, enum: ["mines"] }, // extend enum as games are added

    stake: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "cashed_out", "busted"],
      default: "active",
    },
    payout: { type: Number, default: 0 },
    currentMultiplier: { type: Number, default: 1 },

    // Provably-fair fields
    serverSeed: { type: String, select: false },
    serverSeedHash: { type: String, required: true },
    clientSeed: { type: String, required: true },
    nonce: { type: Number, required: true },

    // Game-specific payload. For Mines: { gridSize, mineCount, minePositions, revealedTiles }
    gameData: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.model("GameSession", gameSessionSchema);
