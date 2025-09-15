import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// ✅ Catch-all and API 404s handled in notFound.js
app.use(notFound);

// ✅ Error handler
app.use(errorHandler);

export default app;
