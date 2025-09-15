import express from "express";
import { getMonthlySales } from "../controllers/salesController.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySales);

export default router;
