// src/routes/index.js
import { Router } from 'express';
import salesRoutes from './sales.routes.js';

const router = Router();

router.use('/api', salesRoutes);

// Later: router.use('/api/inventory', inventoryRoutes) etc.

export default router;
