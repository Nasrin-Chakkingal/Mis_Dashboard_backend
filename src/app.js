import express from "express";
import cors from "cors";
import { getPool } from "./config/db.js";

import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import MHRoutes from "./routes/MH.routes.js";
import PHRoutes from "./routes/PH.routes.js";

import notFound from "./middleware/notfound.js";
import errorHandler from "./middleware/errorhandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api", salesRoutes);
app.use("/api", customerRoutes);
app.use("/api", filterRoutes);
app.use("/api", summaryRoutes);
app.use("/api", inventoryRoutes);
app.use("/api", MHRoutes);
app.use("/api", PHRoutes);


// ✅ Health check
app.get("/healthz", (_, res) => res.send("ok"));

// ✅ Test DB route
app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT CAST(GETDATE() AS time) AS now");
    res.json({ success: true, result: result.recordset });
  } catch (error) {
    console.error("❌ DB test error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Error middleware (always last)
app.use(notFound);
app.use(errorHandler);

export default app;
