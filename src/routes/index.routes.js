import express from "express";
import salesRoutes from "./sales.routes.js";

const router = express.Router();

// Mount all route modules here
router.use("/sales", salesRoutes);

export default router;
