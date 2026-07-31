import User from "../models/User.js";

export class InsufficientFundsError extends Error {
  constructor() {
    super("Insufficient coin balance");
    this.name = "InsufficientFundsError";
    this.statusCode = 400;
  }
}

export async function deductStake(userId, amount) {
  console.log("deductStake called with:", { userId, typeofUserId: typeof userId, amount, typeofAmount: typeof amount });

  const user = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  );

  console.log("findOneAndUpdate result:", user);

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