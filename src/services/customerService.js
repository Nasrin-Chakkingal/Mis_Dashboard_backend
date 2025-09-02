import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/filters.js";

export const getCustomerAveragesService = async (queryParams) => {
  const pool = getPool();
  const request = pool.request();
  const filters = buildFilters(queryParams, request);

  const query = `
    SELECT
      COUNT(DISTINCT CUSTOMER) AS totalCustomers,
      SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS avgSalesPerCustomer,
      SUM(PIECES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS avgQtyPerCustomer,
      SUM(SALES - COGS) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS avgProfitPerCustomer
    FROM MIS_DASHBOARD_TBL
    WHERE (${filters});
  `;

  const result = await request.query(query);
  return result.recordset[0];
};
