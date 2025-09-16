import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import app from "./src/app.js";
import { getPool } from "./src/config/db.js";

async function refreshDashboardTable() {
  try {
    const pool = await getPool();   // ✅ use your helper
    await pool.request().execute("sp_Load_MIS_Dashboard");
    console.log("✅ MIS_DASHBOARD_TBL refreshed successfully");
  } catch (err) {
    console.error("❌ Error refreshing dashboard:", err);
  }
}

// Run every day at 1 AM
cron.schedule("0 1 * * *", () => {
  refreshDashboardTable();
});

const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  // ✅ Correct frontend path
  const frontendPath = path.join(__dirname, "MIS_Dashboard", "dist");

  // ✅ Serve static assets
  app.use(express.static(frontendPath));

  // ✅ React Router fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
