import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { claimDaily, balance } from "../controllers/walletController.js";

const router = Router();
router.use(requireAuth);

router.post("/claim-daily", claimDaily);
router.get("/balance", balance);

export default router;