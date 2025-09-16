import dotenv from "dotenv";
import cron from "node-cron";
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
