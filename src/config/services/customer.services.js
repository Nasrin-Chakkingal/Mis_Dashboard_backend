import { poolPromise } from '../src/config/db.js';
import { bindParams } from '../controllers/utils/filters.js';

export const customerTrend = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `  WITH FirstPurchase AS (
  SELECT 
    CUSTOMER, 
    MIN(CONCAT(YEAR(VOCDATE), '-', RIGHT('0' + CAST(MONTH(VOCDATE) AS VARCHAR), 2))) AS FirstPurchaseMonth
  FROM MIS_DASHBOARD_TBL
  WHERE CUSTOMER IS NOT NULL AND VOCDATE IS NOT NULL AND (${whereClause})
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
WHERE m.CUSTOMER IS NOT NULL AND m.VOCDATE IS NOT NULL AND (${whereClause})
      GROUP BY CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2))
ORDER BY Month; `;

      const { recordset } = await request.query(query);
  return recordset;
};


export const customerSales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);


  const query = `    SELECT
     YEAR(VOCDATE) AS [Year],
     MONTH(VOCDATE) AS [Month],
     SUM(SALES) AS TotalSales,
     SUM(COGS) AS TotalCOGS,
     COUNT(DISTINCT CUSTOMER) AS CustomerCount,
    CAST(1.0 * SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS DECIMAL(10, 2)) AS AvgSalesPerCustomer,
    CAST(1.0 * (SUM(SALES) - SUM(COGS)) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS DECIMAL(10, 2)) AS AvgProfitPerCustomer
FROM
  MIS_DASHBOARD_TBL
WHERE
  SALES > 0 AND (${whereClause})
GROUP BY
  YEAR(VOCDATE), MONTH(VOCDATE)
ORDER BY
  YEAR(VOCDATE), MONTH(VOCDATE);
      
    `;

      const { recordset } = await request.query(query);
  return recordset;
};


export const customerQuantity = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);
const query = `  
      SELECT
  YEAR(VOCDATE) AS [Year],
  MONTH(VOCDATE) AS [Month],
  SUM(PIECES) AS TotalQty,
  COUNT(DISTINCT CUSTOMER) AS CustomerCount,
  CAST(1.0 * SUM(PIECES) / COUNT(DISTINCT CUSTOMER) AS DECIMAL(10, 2)) AS AvgQtyPerCustomer
FROM
  MIS_DASHBOARD_TBL
WHERE
  SALES > 0 AND (${whereClause})
GROUP BY
  YEAR(VOCDATE), MONTH(VOCDATE)
ORDER BY
  YEAR(VOCDATE), MONTH(VOCDATE);
    `;

      const { recordset } = await request.query(query);
  return recordset;
};

// ✅ Route: Avg per Customer Summary
export const customerSummary = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);
const query = `  
      SELECT COUNT(DISTINCT CUSTOMER) AS TotalCustomers
      FROM MIS_DASHBOARD_TBL
      WHERE SALES > 0
    `;
  const { recordset } = await request.query(query);
  return recordset;
};
