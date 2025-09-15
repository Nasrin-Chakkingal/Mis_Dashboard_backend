import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";
import sql from "mssql";

// 📊 Capital Report
export async function getCapitalReport(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        FORMAT(VOCDATE, 'yyyy-MM') AS month,
        SUM(MKG_STOCKVALUE) AS totalStockValue
      FROM MIS_DASHBOARD_TBL
      WHERE (${filters})
      GROUP BY FORMAT(VOCDATE, 'yyyy-MM')
      ORDER BY month DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Capital report Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 📦 Pieces Summary
export async function getPieces(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT AgeBucket, SUM(PIECES) AS total_pieces
      FROM MIS_DASHBOARD_TBL
      WHERE AgeBucket IS NOT NULL AND AgeBucket != 'NA' AND (${filters})
      GROUP BY AgeBucket
      ORDER BY AgeBucket;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Pieces Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 🚀 Movement Category Comparison
export async function getMovementCategoryComparison(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const year = parseInt(req.query.year) || 2022;

    const result = await request
      .input("year", sql.Int, year)
      .query(`
        SELECT
          CASE
            WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
            WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
            ELSE 'Slow-Moving'
          END AS MovementCategory,
          SUM(SALES) AS total_sales
        FROM MIS_DASHBOARD_TBL
        WHERE YEAR(VOCDATE) = @year
        GROUP BY
          CASE
            WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
            WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
            ELSE 'Slow-Moving'
          END;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Movement Category Comparison Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
