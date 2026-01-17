import express from "express";
import { getCampaignAvgSpendTrend,
     getCampaignEffectiveness,
     getCampaignKPI, 
     getCampaignPerformance, 
     getCustomerAvgspendSegment, 
     getCustomerAvgSpendTrend, 
    getCustomerBtc, 
    getCustomerKpi, 
    getCustomerNeedtoSpend, 
    getCustomerRfm, 
    getCustomerSegmentation, 
    getLoyaltyKPIs, 
    getLoyaltySalesVsCustomers, 
    getLoyaltySpendComparison, 
    getMarketingOverviewKPIs, 
    getTopCustomers} from "../controllers/MH.controller.js";


const router = express.Router();
router.get("/customer-kpi", getCustomerKpi);
router.get("/customer-rfm", getCustomerRfm); 
router.get("/customer-btc", getCustomerBtc);
router.get("/customer-avgspendtrend", getCustomerAvgSpendTrend);
router.get("/customer-needtospend", getCustomerNeedtoSpend);
router.get("/customer-seg", getCustomerSegmentation);
router.get("/customer-top", getTopCustomers);
router.get("/customer-avgseg", getCustomerAvgspendSegment);

router.get("/campaign-kpi", getCampaignKPI);
router.get("/campaign-performance", getCampaignPerformance);
router.get("/campaign-avgspendtrend", getCampaignAvgSpendTrend);
router.get("/campaign-effectiveness", getCampaignEffectiveness);

router.get("/loyalty-kpi", getLoyaltyKPIs);
router.get("/loyalty-sales-customers", getLoyaltySalesVsCustomers);
router.get("/loyalty-spend-comparison", getLoyaltySpendComparison);
router.get("/overview-kpi", getMarketingOverviewKPIs);

export default router;