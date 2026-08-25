import { claimDailyBonus } from "../services/bonusService.js";
import { getBalance } from "../services/walletService.js";

export async function claimDaily(req, res) {
  try {
    const result = await claimDailyBonus(req.user.id);
    res.json(result);
  } catch (err) {
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
}

export async function balance(req, res) {
  const coins = await getBalance(req.user.id);
  res.json({ coins });
}