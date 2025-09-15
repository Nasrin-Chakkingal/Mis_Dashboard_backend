import { getPool } from "../config/db.js";

export async function getFilterOptions(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const result = await request.query(`
      SELECT DISTINCT SUPPLIER, BRAND_CODE, DIVISION_CODE, TYPE_CODE, BRANCH_CODE
      FROM MIS_DASHBOARD_TBL
      WHERE SUPPLIER IS NOT NULL 
         OR BRAND_CODE IS NOT NULL
         OR DIVISION_CODE IS NOT NULL 
         OR TYPE_CODE IS NOT NULL
         OR BRANCH_CODE IS NOT NULL
    `);

    const raw = result.recordset;

    // Deduplicate values & remove nulls/empty
    const unique = {
      supplier: [...new Set(raw.map(r => r.SUPPLIER))].filter(Boolean),
      brand_code: [...new Set(raw.map(r => r.BRAND_CODE))].filter(Boolean),
      division_code: [...new Set(raw.map(r => r.DIVISION_CODE))].filter(Boolean),
      type_code: [...new Set(raw.map(r => r.TYPE_CODE))].filter(Boolean),
      branch_code: [...new Set(raw.map(r => r.BRANCH_CODE))].filter(Boolean),
    };

    res.json(unique);
  } catch (err) {
    console.error("❌ Filter options fetch error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
