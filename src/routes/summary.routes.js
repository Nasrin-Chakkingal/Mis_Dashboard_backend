import express from "express";
import { getCustomerSummary, getInventoryMonthlySummary, getSummary } from "../controllers/summary.controller.js";

const router = express.Router();

router.get("/summary", getSummary);
router.get("/customer-summary", getCustomerSummary);
router.get("/inventory/monthly-summary", getInventoryMonthlySummary);


export default router;
