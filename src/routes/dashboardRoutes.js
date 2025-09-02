import express from "express";
import { getMonthlySales } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySales);

export default router;
