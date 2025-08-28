import express from 'express';
import {
  getCustomerTrendController,
  getCustomerSalesController,
  getCustomerQuantityController,
  getCustomerSummaryController
} from '../services/controllers/customer.controller.js';

const router = express.Router();

router.get('/trend', getCustomerTrendController);
router.get('/sales', getCustomerSalesController);
router.get('/quantity', getCustomerQuantityController);
router.get('/summary', getCustomerSummaryController);

export default router;
