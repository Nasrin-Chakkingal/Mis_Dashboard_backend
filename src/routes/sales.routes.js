import express from 'express';
import {
  getMonthlySales,
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
  getSummary
} from '../services/controllers/sales.controller.js';

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

export default router;
