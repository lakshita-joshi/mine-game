import jwt from "jsonwebtoken";
import User from "../models/User.js";

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    cookieHeader.split(";").filter(Boolean).map((pair) => {
      const [key, ...rest] = pair.trim().split("=");
      return [key, decodeURIComponent(rest.join("="))];
    })
  );
}

export async function authenticateSocket(socket, next) {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const cookieName = process.env.COOKIE_NAME || "token";
    const token = cookies[cookieName];
    if (!token) return next(new Error("Not authenticated"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("role isBanned username");
    if (!user || user.isBanned) return next(new Error("Not authenticated"));

    socket.userId = payload.userId;
    socket.username = user.username;
    next();
  } catch {
    next(new Error("Not authenticated"));
  }
}