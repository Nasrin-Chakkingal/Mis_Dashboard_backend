import { poolPromise, sql } from "../config/db.js";

export const getFilterOptionsController = async (req, res) => {
  try {
    const pool = await poolPromise; // <-- resolve the promise

    const suppliers  = await pool.request().query("SELECT DISTINCT SUPPLIER FROM SALES ORDER BY SUPPLIER");
    const brands     = await pool.request().query("SELECT DISTINCT BRAND_CODE FROM SALES ORDER BY BRAND_CODE");
    const divisions  = await pool.request().query("SELECT DISTINCT DIVISION_CODE FROM SALES ORDER BY DIVISION_CODE");
    const types      = await pool.request().query("SELECT DISTINCT TYPE_CODE FROM SALES ORDER BY TYPE_CODE");
    const branches   = await pool.request().query("SELECT DISTINCT BRANCH_CODE FROM SALES ORDER BY BRANCH_CODE");

    res.json({
      suppliers: suppliers.recordset,
      brands: brands.recordset,
      divisions: divisions.recordset,
      types: types.recordset,
      branches: branches.recordset,
    });
  } catch (err) {
    console.error("❌ Error fetching filter options:", err);
    res.status(500).json({ error: "Failed to fetch filter options" });
  }
};
