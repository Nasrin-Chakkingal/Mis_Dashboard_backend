// src/services/sales.service.js
import { poolPromise } from '../config/db.js';

import sql from 'mssql'; // Needed for input()
import { buildFilters } from '../utils/filters.js';

// 📊 Monthly Sales
export const monthlySales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);

  const query = `
    SELECT 
      DATENAME(MONTH, VOCDATE) AS month,
      MONTH(VOCDATE) AS month_order,
      SUM(SALES) AS rawSales,
      SUM(COGS) AS rawCost
    FROM MIS_DASHBOARD_TBL
    WHERE (${whereClause})
    GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
    ORDER BY MONTH(VOCDATE);
  `;

  const { recordset } = await request.query(query);

  const totalSales = recordset.reduce((s, r) => s + (r.rawSales || 0), 0);
  const divisor = totalSales < 1_000_000 ? 1000 : 1_000_000;
  const unit = divisor === 1000 ? 'K' : 'M';

  const data = recordset.map(r => {
    const sales = r.rawSales / divisor;
    const cost = r.rawCost / divisor;
    const grossMargin = sales - cost;
    const profitPct = r.rawSales > 0
      ? Number(((r.rawSales - r.rawCost) * 100 / r.rawSales).toFixed(2))
      : 0;

    return { month: r.month, sales, grossMargin, profitPct };
  });

  return { unit, data };
};

// 📊 Top Brands
export const topBrands = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 6 BRAND_CODE AS brand, SUM(SALES) AS total_sale
    FROM MIS_DASHBOARD_TBL
    WHERE BRAND_CODE IS NOT NULL AND BRAND_CODE <> '' AND (${whereClause})
    GROUP BY BRAND_CODE
    ORDER BY total_sale DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 📦 Pieces by AgeBucket
export const Pieces = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT AgeBucket, SUM(PIECES) AS total_pieces
    FROM MIS_DASHBOARD_TBL
    WHERE AgeBucket IS NOT NULL AND AgeBucket != 'NA' AND (${whereClause})
    GROUP BY AgeBucket
    ORDER BY AgeBucket;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 👨‍💼 Top Salespersons
export const topsalesPerson = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 6 
      SALESPERSON AS salesperson, 
      SUM(SALES) AS total_sales
    FROM MIS_DASHBOARD_TBL
    WHERE SALESPERSON IS NOT NULL AND SALESPERSON <> '' AND (${whereClause})
    GROUP BY SALESPERSON
    ORDER BY total_sales DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 🏭 Supplier Sales
export const supplierSales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 6 
      SUPPLIER, 
      SUM(SALES) AS total_sales
    FROM MIS_DASHBOARD_TBL
    WHERE SUPPLIER IS NOT NULL AND SUPPLIER <> '' AND (${whereClause})
    GROUP BY SUPPLIER
    ORDER BY total_sales DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 📊 Age Bucket Wise Sales
export const agebucketWiseSales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 6 AgeBucket, SUM(SALES) AS total_sale
    FROM MIS_DASHBOARD_TBL
    WHERE AgeBucket IS NOT NULL AND SALES IS NOT NULL AND (${whereClause})
    GROUP BY AgeBucket
    ORDER BY SUM(SALES) DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 💰 Capital Report
export const capitalReport = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT 
      FORMAT(VOCDATE, 'yyyy-MM') AS month,
      SUM(MKG_STOCKVALUE) AS totalStockValue
    FROM MIS_DASHBOARD_TBL
    WHERE (${whereClause})
    GROUP BY FORMAT(VOCDATE, 'yyyy-MM')
    ORDER BY month DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 📦 Supplier Profitability
export const supplier = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 6
      SUPPLIER,
      SUM(SALES) AS totalSales,
      SUM(SALES - COGS) AS totalProfit
    FROM MIS_DASHBOARD_TBL
    WHERE SUPPLIER IS NOT NULL
      AND LTRIM(RTRIM(SUPPLIER)) <> '' AND (${whereClause})
    GROUP BY SUPPLIER
    ORDER BY totalSales DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 💲 Avg Selling Price
export const avgSellingPrice = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT 
      DATENAME(MONTH, VOCDATE) AS label,
      MONTH(VOCDATE) AS sort_order,
      SUM(SALES) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_selling_price
    FROM MIS_DASHBOARD_TBL
    WHERE SALES IS NOT NULL AND PIECES IS NOT NULL AND (${whereClause})
    GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
    ORDER BY MONTH(VOCDATE);
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 🏢 Branch Sales
export const branchSales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT TOP 7 [BRANCH NAME] AS branch, SUM(SALES) AS total_sales
    FROM MIS_DASHBOARD_TBL
    WHERE [BRANCH NAME] IS NOT NULL AND (${whereClause})
    GROUP BY [BRANCH NAME]
    ORDER BY total_sales DESC;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 🏃 Movement Category Comparison
export const movementCategoryCopmarison = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT 
      CASE 
        WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
        WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
        ELSE 'Slow-Moving'
      END AS MovementCategory,
      SUM(SALES) AS total_sales
    FROM MIS_DASHBOARD_TBL
    WHERE (${whereClause})
    GROUP BY 
      CASE 
        WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
        WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
        ELSE 'Slow-Moving'
      END;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 📦 Quantity Sold
export const qntySold = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);
  const query = `
    SELECT 
      DATENAME(MONTH, VOCDATE) AS month,
      MONTH(VOCDATE) AS month_order,
      SUM(PIECES) AS qty_sold
    FROM MIS_DASHBOARD_TBL
    WHERE PIECES IS NOT NULL AND (${whereClause})
    GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
    ORDER BY month_order;
  `;
  const { recordset } = await request.query(query);
  return recordset;
};

// 📊 Dashboard Summary
export const Summary = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = buildFilters(pool.request(), params);

  // 1️⃣ Total Summary
  const totalResult = await request.query(`
    SELECT 
      SUM(SALES) AS totalSales,
      SUM(COGS) AS totalCost,
      SUM(PIECES) AS totalQty,
      COUNT(DISTINCT CUSTOMER) AS totalCustomers
    FROM MIS_DASHBOARD_TBL
    WHERE (${whereClause})
  `);

  const total = totalResult.recordset[0];
  const sales = total.totalSales || 0;
  const cost = total.totalCost || 0;
  const profit = sales - cost;
  const profitPct = sales > 0 ? ((profit / sales) * 100).toFixed(2) : 0;
  const divisor = sales < 1000000 ? 1000 : 1000000;

  // 2️⃣ Supplier Summary
  const supplierResult = await request.query(`
    SELECT TOP 5 
      SUPPLIER,
      SUM(SALES) AS total_sales
    FROM MIS_DASHBOARD_TBL
    WHERE SUPPLIER IS NOT NULL
    GROUP BY SUPPLIER
    ORDER BY total_sales DESC;
  `);

  // 3️⃣ Brand Summary
  const brandResult = await request.query(`
    SELECT TOP 5 
      BRAND_CODE AS brand,
      SUM(SALES) AS total_sale
    FROM MIS_DASHBOARD_TBL
    WHERE BRAND_CODE IS NOT NULL
    GROUP BY BRAND_CODE
    ORDER BY total_sale DESC;
  `);

  // 4️⃣ Pieces Summary
  const piecesResult = await request.query(`
    SELECT 
      AgeBucket,
      SUM(PIECES) AS total_pieces
    FROM MIS_DASHBOARD_TBL
    WHERE AgeBucket IS NOT NULL
    GROUP BY AgeBucket
    ORDER BY AgeBucket;
  `);

  return {
    totalSales: parseFloat((sales / divisor).toFixed(2)),
    totalCost: parseFloat((cost / divisor).toFixed(2)),
    totalQty: total.totalQty || 0,
    totalCustomers: total.totalCustomers || 0,
    profit: parseFloat((profit / divisor).toFixed(2)),
    profitPct,
    supplierSummary: supplierResult.recordset,
    brandSummary: brandResult.recordset,
    piecesSummary: piecesResult.recordset,
  };
};
