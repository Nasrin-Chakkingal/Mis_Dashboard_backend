import express from "express";
import { getSupplierSales } from "../controllers/supplierController.js";

const router = express.Router();
router.get("/sales", getSupplierSales);
export default router;
