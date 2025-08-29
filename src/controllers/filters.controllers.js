import { poolPromise } from "../config/db.js";

export const getFilters = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT DISTINCT SUPPLIER, BRAND_CODE, DIVISION_CODE, TYPE_CODE, BRANCH_CODE
      FROM MIS_DASHBOARD_TBL
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching filter options:", err);
    res.status(500).json({ error: "Failed to fetch filters" });
  }
};
