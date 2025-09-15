import express from "express";
import { getAvgSellingPrice, getMonthlySales } from "../controllers/sales.controller.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySales);
router.get("/avg-selling-price", getAvgSellingPrice);

export default router;
