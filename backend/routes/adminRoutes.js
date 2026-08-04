import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { listUsers, getUser, updateUser, getStats, listSessions } from "../controllers/adminController.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id", updateUser);
router.get("/sessions", listSessions);

export default router;