import express from "express";
import { getAvgSpendPerVocno,
    getBranchCustomer, 
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


export default router;