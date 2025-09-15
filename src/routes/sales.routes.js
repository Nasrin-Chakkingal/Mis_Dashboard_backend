import express from "express";
import { getAvgSellingPrice, 
    getBranchSales, 
    getMonthlySales, 
    getQntySold,
    getSupplier,
    getSupplierSales,
    getTopBrands,
    getTopSalespersons, 
     } from "../controllers/sales.controller.js";

const router = express.Router();

router.get("/monthly-sales", getMonthlySales);
router.get("/avg-selling-price", getAvgSellingPrice);
router.get("/qty-sold", getQntySold);
router.get("/top-brands", getTopBrands);
router.get("/supplier-sales", getSupplierSales);
router.get("/branch-sales", getBranchSales);
router.get("/top-salespersons", getTopSalespersons);
router.get("/supplier", getSupplier);




export default router;
