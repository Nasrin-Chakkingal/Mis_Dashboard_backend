import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/filters.js";

export const getSupplierSalesService = async (queryParams) => {
  const pool = getPool();
  const request = pool.request();
  const filters = buildFilters(queryParams, request);

  const query = `
    SELECT 
      SUPPLIER,
      SUM(SALES) AS totalSales,
      SUM(COGS) AS totalCost,
      SUM(SALES - COGS) AS totalProfit
    FROM MIS_DASHBOARD_TBL
    WHERE (${filters})
    GROUP BY SUPPLIER
    ORDER BY totalSales DESC;
  `;

  const result = await request.query(query);
  return result.recordset;
};
