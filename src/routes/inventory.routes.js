import express from "express";
import { getCapitalReport, getMovementCategoryComparison, getPieces } from "../controllers/inventory.controller.js";

const router = express.Router();
router.get("/capital-report", getCapitalReport);
router.get("/pieces", getPieces);
router.get("/movement-category-comparison", getMovementCategoryComparison);


export default router;