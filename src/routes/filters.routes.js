import express from "express";
import { getFilters } from "../controllers/filters.controllers.js";


const router = express.Router();

// GET /api/filters
router.get("/", getFilters);

export default router;
