import express from "express";
import {
  getStockReportAnalysis,
  getInventoryMovementAnalysis,
  getScrapAnalysis,
  getDeadStockAnalysis,
} from "../controllers/inventory.controller.js";

const router = express.Router();

// stock report
router.get("/stock-report-analysis", getStockReportAnalysis);

// movement
router.get("/inventory-movement-analysis", getInventoryMovementAnalysis);

// scrap
router.get("/scrap-analysis", getScrapAnalysis);

// dead stock
router.get("/dead-stock-analysis", getDeadStockAnalysis);

export default router;
