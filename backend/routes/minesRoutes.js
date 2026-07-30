import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";
import { startGame, revealTile, cashOut, getSession } from "../controllers/minesController.js";

const router = Router();

const revealLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 20, // 20 reveals per 10s per IP — generous for a human, blocks scripted probing
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

router.post("/start", startGame);
router.post("/reveal", revealLimiter, revealTile);
router.post("/cashout", cashOut);
router.get("/:id", getSession);

export default router;
