
import { poolPromise } from "../config/db.js";

export const getMonthlySales = async (filters, request) => {
  const query = `
    SELECT
      DATENAME(MONTH, VOCDATE) AS month,
      MONTH(VOCDATE) AS month_order,
      SUM(SALES) AS rawSales,
      SUM(COGS) AS rawCost
    FROM MIS_DASHBOARD_TBL
    WHERE 1=1 AND (${filters})
    GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
    ORDER BY MONTH(VOCDATE);
  `;

  const rawResult = await request.query(query);

  const totalSales = rawResult.recordset.reduce((sum, row) => sum + row.rawSales, 0);
  const divisor = totalSales < 1000000 ? 1000 : 1000000;
  const unit = divisor === 1000 ? "K" : "M";

  const data = rawResult.recordset.map(row => {
    const sales = row.rawSales / divisor;
    const cost = row.rawCost / divisor;
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
