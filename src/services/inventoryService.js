import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/filters.js";

export const getStockSummaryService = async (queryParams) => {
  const pool = getPool();
  const request = pool.request();
  const filters = buildFilters(queryParams, request);

  const query = `
    SELECT 
      DIVISION_CODE,
      SUM(PIECES) AS totalPieces,
      SUM(CASE WHEN SALES > 0 THEN PIECES ELSE 0 END) AS soldPieces,
      SUM(CASE WHEN SALES = 0 THEN PIECES ELSE 0 END) AS unsoldPieces
    FROM MIS_DASHBOARD_TBL
    WHERE (${filters})
    GROUP BY DIVISION_CODE
    ORDER BY DIVISION_CODE;
  `;

  const result = await request.query(query);
  return result.recordset;
};
