import express from "express";
import { getFilterOptions } from "../controllers/filter.controller.js";

const router = express.Router();

router.get("/filter-options", getFilterOptions);

export default router;