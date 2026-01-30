import express from "express";
import { getPOValueBySupplier, getPOValueTrend, getProcurementKPIs, getProcurementThreshold, 
    getPurchaseOrderAnalysis, 
    getSalesVsCostTrend, 
    getSPkpi, 
    getSupplierContribution, 
    getSupplierGrossProfit, 
    getSupplierPerformance, 
    getSupplierPerformanceTable, 
    getSupplierSalesCost, 
    getSupplierThresholdAnalysis,
    getVendorPriceComparison, 
    } from "../controllers/PH.controller.js";

const router = express.Router();

router.get("/supplier-performance", getSupplierPerformance);
router.get("/threshold", getProcurementThreshold);
router.get("/PO-analysis", getPurchaseOrderAnalysis);
router.get("/spkpi", getSPkpi);
router.get("/supplier-sales-cost", getSupplierSalesCost);
router.get("/supplier-gross-profit", getSupplierGrossProfit);
router.get("/supplier-contribution", getSupplierContribution);
router.get("/sptable", getSupplierPerformanceTable);
router.get("/threshold-analysis", getSupplierThresholdAnalysis);
router.get("/povalue-trend", getPOValueTrend);
router.get("/povalue-supplier", getPOValueBySupplier);
router.get("/vendor", getVendorPriceComparison);
router.get("/prkpis", getProcurementKPIs);
router.get("/salesvscost", getSalesVsCostTrend);

export default router;