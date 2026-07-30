import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || 'token';
    const token = req.cookies?.[cookieName];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('_id username');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = { userId: user._id.toString(), username: user.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}