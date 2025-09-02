import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/filters.js";

export const getMonthlySalesService = async (queryParams) => {
  const pool = getPool();
  if (!pool) throw new Error("Database not connected");
  
  const request = pool.request();
  const filters = buildFilters(queryParams, request) || "1=1";

  const query = `
    SELECT
      DATENAME(MONTH, VOCDATE) AS month,
      MONTH(VOCDATE) AS month_order,
      SUM(ISNULL(SALES,0)) AS rawSales,
      SUM(ISNULL(COGS,0)) AS rawCost
    FROM MIS_DASHBOARD_TBL
    WHERE ${filters}
    GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
    ORDER BY MONTH(VOCDATE);
  `;

  const rawResult = await request.query(query);

  const totalSales = rawResult.recordset.reduce(
    (sum, row) => sum + (row.rawSales || 0),
    0
  );

  const divisor = totalSales < 1000000 ? 1000 : 1000000;
  const unit = divisor === 1000 ? "K" : "M";

  const data = rawResult.recordset.map(row => {
    const sales = (row.rawSales || 0) / divisor;
    const cost = (row.rawCost || 0) / divisor;
    const grossMargin = sales - cost;
    const profitPct = row.rawSales > 0
      ? Number(((row.rawSales - row.rawCost) * 100 / row.rawSales).toFixed(2))
      : 0;

    return {
      month: row.month,
      sales,
      grossMargin,
      profitPct,
    };
  });

  return { unit, data };
};
