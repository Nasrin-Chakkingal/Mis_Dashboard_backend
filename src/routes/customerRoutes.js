import express from "express";
import { getCustomerAverages } from "../controllers/customerController.js";

const router = express.Router();
router.get("/averages", getCustomerAverages);
export default router;
