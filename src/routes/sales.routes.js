import express from 'express';

import { getMonthlySales,
  getTopBrands,
  getPieces,
  getTopSalesPerson,
  getSupplierSales,
  getAgebucketWiseSales,
  getCapitalReport,
  getSupplier,
  getAvgSellingPrice,
  getBranchSales,
  getMovementCategoryComparison,
  getQntySold,
  getSummary,
  getCustomerTrendController,
  getCustomerSalesController,
  getCustomerQuantityController,
  getCustomerSummaryController,
   getMonthlySummaryController,
  getScrapAnalysisController,
  getInventoryMovementController,
  getStockReportController,
  getDeadStockController,
  getInventorySummaryCardsController
 } from '../controllers/sales.controller.js';

const router = express.Router();

// ✅ Sales Endpoints
router.get('/monthly-sales', getMonthlySales);
router.get('/top-brands', getTopBrands);
router.get('/pieces', getPieces);
router.get('/top-salesperson', getTopSalesPerson);
router.get('/supplier-sales', getSupplierSales);
router.get('/agebucket-sales', getAgebucketWiseSales);
router.get('/capital-report', getCapitalReport);
router.get('/supplier-profitability', getSupplier);
router.get('/avg-selling-price', getAvgSellingPrice);
router.get('/branch-sales', getBranchSales);
router.get('/movement-category', getMovementCategoryComparison);
router.get('/quantity-sold', getQntySold);
router.get('/summary', getSummary);

router.get('/trend', getCustomerTrendController);
router.get('/sales', getCustomerSalesController);
router.get('/quantity', getCustomerQuantityController);
router.get('/summary', getCustomerSummaryController);


router.get('/monthly-summary', getMonthlySummaryController);
router.get('/scrap-analysis', getScrapAnalysisController);
router.get('/movement', getInventoryMovementController);
router.get('/stock-report', getStockReportController);
router.get('/dead-stock', getDeadStockController);
router.get('/summary-cards', getInventorySummaryCardsController);


export default router;
