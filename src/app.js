import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

import notFound from "./middleware/notfound.js";
import errorHandler from "./middleware/errorhandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Point to React build (same as notFound.js)
const distPath = path.join(__dirname, "../MIS_Dashboard/dist");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api", salesRoutes);
app.use("/api", customerRoutes);
app.use("/api", filterRoutes);
app.use("/api", summaryRoutes);
app.use("/api", inventoryRoutes);

// ✅ Serve React build
app.use(express.static(distPath));

// ✅ Fallback handler (API 404 → JSON, UI → React index.html)
app.use(notFound);

// ✅ Global error handler
app.use(errorHandler);

export default app;
