import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { play } from "../controllers/dragonTigerController.js";

const router = Router();
router.post("/play", requireAuth, play);

export default router;