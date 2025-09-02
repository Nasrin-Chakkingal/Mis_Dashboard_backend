import express from "express";
import salesRoutes from "./salesRoutes.js";
// import other routes here

const router = express.Router();

router.use("/sales", salesRoutes);
// router.use("/customers", customerRoutes);
// router.use("/inventory", inventoryRoutes);

export default router;
