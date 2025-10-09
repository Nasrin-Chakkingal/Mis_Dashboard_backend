import express from "express";
import { getAvgSpend, 
    getAvgSpendPerVocno,
    getBranchCustomer, 
    getCampaign, 
    getCustomerQnty, 
    getCustomerSales, 
    getCustomerSegmentation, 
    getCustomerTrend } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/customer-trend", getCustomerTrend);
router.get("/customer-sales", getCustomerSales);
router.get("/customer-qnty", getCustomerQnty);
router.get("/branch-customer", getBranchCustomer);
router.get("/customer-segmentation", getCustomerSegmentation);
router.get("/avg-spend", getAvgSpendPerVocno);
router.get("/totalavg-spend", getAvgSpend);
router.get("/campaigns", getCampaign);
export default router;