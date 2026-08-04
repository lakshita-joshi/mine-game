import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || "token";
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("role isBanned");

    if (!user) return res.status(401).json({ error: "Invalid session" });
    if (user.isBanned) return res.status(403).json({ error: "This account has been suspended" });

    req.user = { id: payload.sub, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}