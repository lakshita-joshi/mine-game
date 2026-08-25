import { z } from "zod";
import User from "../models/User.js";
import GameSession from "../models/GameSession.js";

const listUsersSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listUsers(req, res) {
  const parsed = listUsersSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { search, page, limit } = parsed.data;

  const filter = search
    ? { $or: [{ username: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, limit });
}

export async function getUser(req, res) {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const recentSessions = await GameSession.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("-gameData -serverSeed");

  res.json({ user, recentSessions });
}

const updateUserSchema = z
  .object({
    setCoins: z.number().int().min(0).optional(),
    coinsDelta: z.number().int().optional(),
    isBanned: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "No changes provided" });

export async function updateUser(req, res) {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { setCoins, coinsDelta, isBanned } = parsed.data;

  if (req.params.id === req.user.id && isBanned === true) {
    return res.status(400).json({ error: "You cannot ban your own account" });
  }

  const update = {};
  if (typeof isBanned === "boolean") update.isBanned = isBanned;

  let user;
  if (typeof setCoins === "number") {
    user = await User.findByIdAndUpdate(req.params.id, { ...update, coins: setCoins }, { new: true });
  } else if (typeof coinsDelta === "number") {
    user = await User.findOneAndUpdate(
      { _id: req.params.id, coins: { $gte: -coinsDelta } },
      { ...update, $inc: { coins: coinsDelta } },
      { new: true }
    );
  } else {
    user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  }

  if (!user) return res.status(404).json({ error: "User not found or update would go negative" });
  res.json({ user });
}

export async function getStats(req, res) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, newUsersLast7d, totalSessions, activeSessions, wagerAgg] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    GameSession.countDocuments(),
    GameSession.countDocuments({ status: "active" }),
    GameSession.aggregate([
      { $group: { _id: null, totalStaked: { $sum: "$stake" }, totalPayout: { $sum: "$payout" } } },
    ]),
  ]);

  const totalStaked = wagerAgg[0]?.totalStaked ?? 0;
  const totalPayout = wagerAgg[0]?.totalPayout ?? 0;

  res.json({
    totalUsers,
    newUsersLast7d,
    totalSessions,
    activeSessions,
    totalStaked,
    totalPayout,
    houseProfit: totalStaked - totalPayout,
  });
}

const listSessionsSchema = z.object({
  status: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["active", "cashed_out", "busted"]).optional()
  ),
  gameType: z.preprocess((val) => (val === "" ? undefined : val), z.string().optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listSessions(req, res) {
  const parsed = listSessionsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { status, gameType, page, limit } = parsed.data;

  const filter = {};
  if (status) filter.status = status;
  if (gameType) filter.gameType = gameType;

  const [sessions, total] = await Promise.all([
    GameSession.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "username email")
      .select("-gameData -serverSeed"),
    GameSession.countDocuments(filter),
  ]);

  res.json({ sessions, total, page, limit });
}