import express from "express";
import cors from "cors";

import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js"
import filterRoutes from "./routes/filter.routes.js"
import summaryRoutes from "./routes/summary.routes.js"
import inventoryRoutes from "./routes/inventory.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", salesRoutes);
app.use("/api", customerRoutes);
app.use("/api", filterRoutes);
app.use("/api", summaryRoutes);
app.use("/api", inventoryRoutes);

export default app;
