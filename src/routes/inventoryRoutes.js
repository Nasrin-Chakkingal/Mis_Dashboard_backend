import express from "express";
import { getStockSummary } from "../controllers/inventoryController.js";

const router = express.Router();
router.get("/stock-summary", getStockSummary);
export default router;
