import express from "express";
import salesRoutes from "./sales.routes.js";
import customerRoutes from "./customer.routes.js";
import inventoryRoutes from "./inventory.routes.js";
import filterRoutes from "./filter.routes.js";

const router = express.Router();

// Mount all route modules here
router.use("/sales", salesRoutes);
 router.use("/customers", customerRoutes);
 router.use("/inventory", inventoryRoutes);
  router.use("/filter", filterRoutes);

export default router;
