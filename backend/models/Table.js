import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatIndex: { type: Number, required: true },
    hand: { type: [{ rank: String, suit: String }], select: false }, // hidden until showdown/fold
    isPlaying: { type: Boolean, default: true }, // false once folded
    hasSeenHand: { type: Boolean, default: false },
    leftTable: { type: Boolean, default: false }, // blind vs. seen betting
    currentStake: { type: Number, default: 0 },
     // total chips this player has put in, this round
  },
  { _id: false }
);

const tableSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true },
    minStake: { type: Number, required: true, default: 10 },
    maxSeats: { type: Number, default: 6, min: 2, max: 6 },
    status: {
      type: String,
      enum: ["waiting", "dealing", "betting", "showdown", "finished"],
      default: "waiting",
    },
    seats: { type: [seatSchema], default: [] },
    pot: { type: Number, default: 0 },
    currentTurnSeatIndex: { type: Number, default: 0 },
    roundNumber: { type: Number, default: 0 },

    // Provably-fair fields — same pattern as Mines/Crash
    serverSeed: { type: String, select: false },
    serverSeedHash: { type: String },
    clientSeed: { type: String },
    nonce: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    optimisticConcurrency: true, // makes concurrent saves on the same table fail loudly instead of silently overwriting each other
  }
);

export default mongoose.model("Table", tableSchema);