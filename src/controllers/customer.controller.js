import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";


export async function getCustomerTrend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
  WITH FirstPurchase AS (
  SELECT
    CUSTOMER,
    MIN(CONCAT(YEAR(VOCDATE), '-', RIGHT('0' + CAST(MONTH(VOCDATE) AS VARCHAR), 2))) AS FirstPurchaseMonth
  FROM MIS_DASHBOARD_TBL
  WHERE CUSTOMER IS NOT NULL AND VOCDATE IS NOT NULL AND (${filters})
        GROUP BY CUSTOMER
      )
      SELECT
  CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2)) AS Month,
  COUNT(DISTINCT m.CUSTOMER) AS TotalCustomers,
  COUNT(DISTINCT CASE
    WHEN CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2)) = fp.FirstPurchaseMonth
    THEN m.CUSTOMER
  END) AS NewCustomers
FROM MIS_DASHBOARD_TBL m
JOIN FirstPurchase fp ON m.CUSTOMER = fp.CUSTOMER
WHERE m.CUSTOMER IS NOT NULL AND m.VOCDATE IS NOT NULL AND (${filters})
      GROUP BY CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2))
ORDER BY Month; `;

    const result = await request.query(query);

    res.json({
      data: result.recordset, // ✅ frontend expects "data"
    });
  } catch (err) {
    console.error("❌ Customer Trend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}