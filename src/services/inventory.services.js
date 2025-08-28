import { poolPromise } from '../config/db.js';
import { bindParams } from '../utils/filters.js';


// 🚩 INVENTORY MONTHLY SUMMARY
export const monthlySummary = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT
      CAST(YEAR(PURDATE) AS VARCHAR(4)) + '-' + RIGHT('0' + CAST(MONTH(PURDATE) AS VARCHAR(2)), 2) AS Month,
      SUM(COGS) AS TotalStockValue,
      SUM(PIECES) AS TotalQuantity,
      SUM([GROSS WEIGHT]) AS TotalGrossWeight,
      SUM([PURE WEIGHT]) AS TotalPureWeight
    FROM MIS_DASHBOARD_TBL
    WHERE PURDATE IS NOT NULL AND (${whereClause})
    GROUP BY YEAR(PURDATE), MONTH(PURDATE)
    ORDER BY YEAR(PURDATE), MONTH(PURDATE);
  `;

  const { recordset } = await request.query(query);
  return recordset;
};


// 🚩 SCRAP ANALYSIS
export const scrap_Analysis = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT 
        ISNULL(AgeBucket, 'Unknown') AS AgeBucket,
        SUM(PIECES) AS ScrapQty,
        SUM(MKG_STOCKVALUE) AS ScrapValue
    FROM MIS_DASHBOARD_TBL
    WHERE UPPER(LTRIM(RTRIM(VOCTYPE))) = 'SCRAP' AND (${whereClause})
    GROUP BY ISNULL(AgeBucket, 'Unknown')
    ORDER BY AgeBucket;
  `;

  const { recordset } = await request.query(query);
  return recordset;
};


// 🚩 INVENTORY MOVEMENT
export const Inventory_Movement = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT 
        YEAR(VOCDATE) AS [Year],
        MONTH(VOCDATE) AS [Month],
        SUM(CASE WHEN VOCTYPE = 'PURCHASE' THEN PIECES ELSE 0 END) AS StockIn,
        SUM(CASE WHEN VOCTYPE = 'SALE' THEN PIECES ELSE 0 END) AS StockOut
    FROM MIS_DASHBOARD_TBL
    WHERE VOCDATE IS NOT NULL AND (${whereClause})
    GROUP BY YEAR(VOCDATE), MONTH(VOCDATE)
    ORDER BY [Year], [Month];
  `;

  const { recordset } = await request.query(query);
  return recordset;
};


// 🚩 STOCK REPORT
export const Stock_Report = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT 
        BRAND_CODE,
        DIVISION_CODE,
        SUPPLIER,
        SUM(PIECES) AS TotalQty,
        SUM(MKG_STOCKVALUE) AS TotalStockValue,
        SUM([GROSS WEIGHT]) AS TotalGrossWeight,
        SUM([PURE WEIGHT]) AS TotalPureWeight
    FROM MIS_DASHBOARD_TBL
    WHERE VOCTYPE = 'PURCHASE' AND (${whereClause})
    GROUP BY BRAND_CODE, DIVISION_CODE, SUPPLIER
    ORDER BY TotalStockValue DESC;
  `;

  const { recordset } = await request.query(query);
  return recordset;
};


// 🚩 DEAD STOCK
export const Dead_Stock = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT 
        ISNULL(AgeBucket, 'Unknown') AS AgeBucket,
        COUNT([STOCK CODE]) AS DeadStockItems,
        SUM(PIECES) AS DeadStockQty,
        SUM(MKG_STOCKVALUE) AS DeadStockValue
    FROM MIS_DASHBOARD_TBL
    WHERE SALES = 0 AND (${whereClause})
    GROUP BY ISNULL(AgeBucket, 'Unknown')
    ORDER BY AgeBucket;
  `;

  const { recordset } = await request.query(query);
  return recordset;
};

export const Inventory_SummaryCards = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

  const query = `
    SELECT
      SUM(MKG_STOCKVALUE) AS TotalStockValue,
      SUM(PIECES) AS TotalQuantity,
      SUM([GROSS WEIGHT]) AS TotalGrossWeight,
      SUM([PURE WEIGHT]) AS TotalPureWeight
    FROM MIS_DASHBOARD_TBL
    WHERE (${whereClause})
  `;

  const { recordset } = await request.query(query);
  return recordset[0]; // return single summary row
};
