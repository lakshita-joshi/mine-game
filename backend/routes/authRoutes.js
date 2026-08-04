import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existing) {
      return res.status(409).json({ error: 'username or email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const startingBalance = Number(process.env.STARTING_BALANCE || 1000);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      coinBalance: startingBalance,
    });

    const token = signToken({ userId: user._id.toString() });
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions);
    res.status(201).json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = await User.findOne({
        $or: [{ username }, { email: username.toLowerCase() }],
        }).select('+passwordHash');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = signToken({ userId: user._id.toString() });
    res.cookie(process.env.COOKIE_NAME || 'token', token, cookieOptions);
    res.status(200).json({ user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'token');
  res.status(200).json({ message: 'Logged out' });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ user: user.toJSON() });
});

export default router;