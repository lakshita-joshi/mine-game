import User from "../models/User.js";

export class InsufficientFundsError extends Error {
  constructor() {
    super("Insufficient coin balance");
    this.name = "InsufficientFundsError";
    this.statusCode = 400;
  }
}

/**
 * Atomically deducts a stake IF the user has enough balance.
 * Uses a single conditional update instead of read-then-write,
 * so two simultaneous requests can't both pass a balance check
 * and double-spend the same coins.
 */
export async function deductStake(userId, amount) {
  const user = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  );

  if (!user) throw new InsufficientFundsError();
  return user.coins;
}

export async function creditPayout(userId, amount) {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $inc: { coins: amount } },
    { new: true }
  );
  return user.coins;
}

export async function getBalance(userId) {
  const user = await User.findById(userId).select("coins");
  return user?.coins ?? 0;
}
