import express from "express";
import mongoose from "mongoose";
import GameSession from "../models/GameSession.js";

const router = express.Router();

const BADGES = ["👑", "🥈", "🥉"];

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const results = await GameSession.aggregate([
      {
        $group: {
          _id: "$user",
          score: { $sum: { $subtract: ["$payout", "$stake"] } },
        },
      },
      { $match: { score: { $gt: 0 } }},
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.isBanned": { $ne: true } } },
      {
        $project: {
          _id: 0,
          name: "$user.username",
          score: 1,
        },
      },
    ]);

    const players = results.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      score: p.score,
      badge: BADGES[i] || null,
    }));

    res.status(200).json(players);
  } catch (err) {
    res.status(500).json({ error: "Failed to load leaderboard", details: err.message });
  }
});

export default router;