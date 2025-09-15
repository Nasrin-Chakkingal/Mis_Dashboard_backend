import express from "express";
import { getAvgSellingPrice, getMonthlySales, getQntySold } from "../controllers/sales.controller.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySales);
router.get("/avg-selling-price", getAvgSellingPrice);
router.get("/qty-sold", getQntySold);


export default router;
