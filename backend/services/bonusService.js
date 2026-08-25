import User from "../models/User.js";

const BASE_BONUS = 50;
const STREAK_BONUS_PER_DAY = 10;
const MAX_STREAK_BONUS_DAYS = 7;

export class AlreadyClaimedError extends Error {
  constructor() {
    super("Daily bonus already claimed");
    this.statusCode = 400;
  }
}

export async function claimDailyBonus(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = Date.now();
  const last = user.lastDailyClaim ? user.lastDailyClaim.getTime() : 0;
  const hoursSinceLast = (now - last) / (1000 * 60 * 60);

  if (hoursSinceLast < 24) throw new AlreadyClaimedError();

  const newStreak = hoursSinceLast <= 48 ? user.dailyStreak + 1 : 1;
  const streakDays = Math.min(newStreak, MAX_STREAK_BONUS_DAYS);
  const bonus = BASE_BONUS + streakDays * STREAK_BONUS_PER_DAY;

  user.coins += bonus;
  user.dailyStreak = newStreak;
  user.lastDailyClaim = new Date();
  await user.save();

  return { bonus, newStreak, coins: user.coins };
}