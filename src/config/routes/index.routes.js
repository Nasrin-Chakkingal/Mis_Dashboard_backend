import { Router } from "express";
import salesRoutes from "./sales.routes.js";

 import inventoryRoutes from "./inventory.routes.js";
 import customerRoutes from "./customer.routes.js";

const router = Router();

// group all routes under `/api`
router.use("/api/sales", salesRoutes);

router.use("/api/customer", customerRoutes);
router.use("/api/inventory", inventoryRoutes);



export default router;
