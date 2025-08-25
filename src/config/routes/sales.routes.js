// src/routes/sales.routes.js
import { Router } from 'express';
import {
  getMonthlySales,
  getAvgSellingPrice,
  getTopBrands,
  getAgebucketWiseSales,
  // add the rest
} from '../src/config/controllers/sales.controller.js';

const router = Router();

router.get('/monthly-sales', getMonthlySales);
router.get('/avg-selling-price', getAvgSellingPrice);
router.get('/top-brands', getTopBrands);
router.get('/agebucket-wise-sales', getAgebucketWiseSales);

// 👉 Add the rest here with their paths.

export default router;
