// src/services/sales.service.js
import { poolPromise } from '../src/config/db.js';
import { bindParams } from '../controllers/utils/filters.js';

export const monthlySales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);

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

export const avgSellingPrice = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);
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

export const topBrands = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);
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

export const agebucketWiseSales = async (whereClause, params) => {
  const pool = await poolPromise;
  const request = bindParams(pool.request(), params);
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

// 👉 Add the rest of your queries from server.js here the same way:
// - qty sold
// - customer trend
// - summary
// - supplier sales
// - branch sales
// - top salespersons
// - customer sales / qty
// - inventory monthly summary
// - supplier, capital-report, etc.
