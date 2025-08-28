import express from 'express';
import {
  getMonthlySummaryController,
  getScrapAnalysisController,
  getInventoryMovementController,
  getStockReportController,
  getDeadStockController,
  getInventorySummaryCardsController,
} from '../controllers/inventory.controller.js';   // ✅ removed extra /src

const router = express.Router();

router.get('/monthly-summary', getMonthlySummaryController);
router.get('/scrap-analysis', getScrapAnalysisController);
router.get('/movement', getInventoryMovementController);
router.get('/stock-report', getStockReportController);
router.get('/dead-stock', getDeadStockController);
router.get('/summary-cards', getInventorySummaryCardsController);

export default router;
