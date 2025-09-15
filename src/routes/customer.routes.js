import express from "express";
import { getBranchCustomer, getCustomerQnty, getCustomerSales, getCustomerTrend } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/customer-trend", getCustomerTrend);
router.get("/customer-sales", getCustomerSales);
router.get("/customer-qnty", getCustomerQnty);
router.get("/branch-customer", getBranchCustomer);

export default router;