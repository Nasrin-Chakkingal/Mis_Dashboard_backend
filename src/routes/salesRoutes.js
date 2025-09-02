import express from "express";
import { getMonthlySalesController } from "../controllers/salesController.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySalesController);

export default router;
