import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";

export async function getMonthlySales(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        DATENAME(MONTH, VOCDATE) AS month,
        MONTH(VOCDATE) AS month_order,
        SUM(SALES) AS rawSales,
        SUM(COGS) AS rawCost
      FROM MIS_DASHBOARD_TBL
      WHERE (${filters})
      GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
      ORDER BY MONTH(VOCDATE);
    `;

    const rawResult = await request.query(query);

    const totalSales = rawResult.recordset.reduce((sum, row) => sum + row.rawSales, 0);
    const divisor = totalSales < 1_000_000 ? 1000 : 1_000_000;
    const unit = divisor === 1000 ? "K" : "M";

    const data = rawResult.recordset.map(row => {
      const sales = row.rawSales / divisor;
      const cost = row.rawCost / divisor;
      const grossMargin = sales - cost;
      const profitPct = row.rawSales > 0
        ? Number(((row.rawSales - row.rawCost) * 100 / row.rawSales).toFixed(2))
        : 0;

      return { month: row.month, sales, grossMargin, profitPct };
    });

    res.json({ unit, data });
  } catch (err) {
    console.error("❌ Monthly Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
