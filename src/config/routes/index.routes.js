import { Router } from "express";
import salesRoutes from "./sales.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import customerRoutes from "./customer.routes.js";

const router = Router();

// these get mounted under `/api/...` by server.js
router.use("/sales", salesRoutes);
router.use("/customer", customerRoutes);
router.use("/inventory", inventoryRoutes);

export default router;
