import Table from "../models/Table.js";

export async function cleanupStaleTables(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const result = await Table.deleteMany({
    status: { $in: ["waiting", "finished"] },
    updatedAt: { $lt: cutoff },
  });
  return result.deletedCount;
}

// Still runnable directly via `node scripts/cleanupTables.js 24`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { default: mongoose } = await import("mongoose");
  await import("dotenv/config");
  const hours = Number(process.argv[2] || 24);
  await mongoose.connect(process.env.MONGO_URI);
  const count = await cleanupStaleTables(hours);
  console.log(`Deleted ${count} stale tables older than ${hours}h.`);
  process.exit(0);
}