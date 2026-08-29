import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { createTable, listTables, getTable } from "../controllers/tableController.js";

const router = Router();
router.use(requireAuth);

router.post("/", createTable);
router.get("/", listTables);
router.get("/:id", getTable);

export default router;