import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import cron from "node-cron";
import app from "./src/app.js";        // ✅ make sure path is correct
import { getPool } from "./src/config/db.js";

console.log("DEBUG: Loaded env variables:", {
  LOCAL_DB_SERVER: process.env.LOCAL_DB_SERVER,
  LOCAL_DB_USER: process.env.LOCAL_DB_USER,
  LOCAL_DB_DATABASE: process.env.LOCAL_DB_DATABASE,
  LOCAL_DB_PORT: process.env.LOCAL_DB_PORT,
});

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
cron.schedule("0 1 * * *", refreshDashboardTable);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
