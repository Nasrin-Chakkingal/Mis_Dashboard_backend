import express from "express";
import { getCustomerTrend } from "../controllers/customer.controller.js";

const router = express.Router();

router.get("/customer-trend", getCustomerTrend);

export default router;