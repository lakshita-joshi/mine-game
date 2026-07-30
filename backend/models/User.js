import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    coins: { type: Number, default: 1000 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
