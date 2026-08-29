import { z } from "zod";
import Table from "../models/Table.js";

const createTableSchema = z.object({
  tableName: z.string().min(1).max(40),
  minStake: z.number().int().min(1).max(10000).default(10),
  maxSeats: z.number().int().min(2).max(6).default(6),
});

export async function createTable(req, res) {
  const parsed = createTableSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const table = await Table.create(parsed.data);
  res.status(201).json({ table });
}

export async function listTables(req, res) {
  // Only show tables that aren't full and aren't mid-round — a
  // simple "open for joining" filter, not full lobby matchmaking.
  const tables = await Table.find({ status: { $in: ["waiting", "finished"] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("tableName minStake maxSeats status seats createdAt");

  const withCounts = tables.map((t) => ({
    _id: t._id,
    tableName: t.tableName,
    minStake: t.minStake,
    maxSeats: t.maxSeats,
    status: t.status,
    seatedCount: t.seats.filter((s) => !s.leftTable).length,
  }));

  res.json({ tables: withCounts });
}

export async function getTable(req, res) {
  const table = await Table.findById(req.params.id).select("tableName minStake maxSeats status seats pot currentTurnSeatIndex");
  if (!table) return res.status(404).json({ error: "Table not found" });
  res.json({ table });
}