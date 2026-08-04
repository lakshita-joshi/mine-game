import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const identifier = process.argv[2];
if (!identifier) {
  console.error("Usage: node scripts/makeAdmin.js <username-or-email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const user = await User.findOneAndUpdate(
  { $or: [{ username: identifier }, { email: identifier.toLowerCase() }] },
  { role: "admin" },
  { new: true }
);

if (!user) {
  console.error(`No user found matching "${identifier}"`);
  process.exit(1);
}

console.log(`${user.username} (${user.email}) is now an admin.`);
process.exit(0);