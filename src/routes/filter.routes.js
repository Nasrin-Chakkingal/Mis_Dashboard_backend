import express from "express";
import { getFilterOptionsController } from "../controllers/filter.controller.js";

const router = express.Router();

router.get("/filter-options", getFilterOptionsController);

export default router;
