import "dotenv/config";
import mongoose from "mongoose";
import Table from "../models/Table.js";

const hours = Number(process.argv[2] || 24);

await mongoose.connect(process.env.MONGO_URI);

const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
const result = await Table.deleteMany({
  status: { $in: ["waiting", "finished"] },
  updatedAt: { $lt: cutoff },
});

console.log(`Deleted ${result.deletedCount} stale tables older than ${hours}h.`);
process.exit(0);