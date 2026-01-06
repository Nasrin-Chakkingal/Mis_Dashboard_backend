import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";

//1
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

//2
  export async function getAvgSellingPrice(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        DATENAME(MONTH, VOCDATE) AS label,
        MONTH(VOCDATE) AS sort_order,
        SUM(SALES) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_selling_price
      FROM MIS_DASHBOARD_TBL
      WHERE SALES IS NOT NULL AND PIECES IS NOT NULL AND (${filters})
      GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
      ORDER BY sort_order;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset, // ✅ frontend expects "data"
    });
  } catch (err) {
    console.error("❌ Avg Selling Price Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//3
export async function getQntySold(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        DATENAME(MONTH, VOCDATE) AS month,
        MONTH(VOCDATE) AS month_order,
        SUM(PIECES) AS qty_sold
      FROM MIS_DASHBOARD_TBL
      WHERE PIECES IS NOT NULL AND (${filters})
      GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
      ORDER BY month_order;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Qounatity Sold Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//4
export async function getTopBrands(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
        BRAND_CODE AS brand,
        SUM(SALES) AS total_sale
      FROM MIS_DASHBOARD_TBL
      WHERE BRAND_CODE IS NOT NULL
        AND BRAND_CODE != ''
        AND (${filters})
      GROUP BY BRAND_CODE
      ORDER BY total_sale DESC;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ brands Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//5
  export async function getSupplierSales(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
        SUPPLIER,
        SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
     WHERE SUPPLIER IS NOT NULL AND SUPPLIER != '' AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY total_sales DESC;
    `;

   const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Suppliersales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//6
export async function getBranchSales(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 7 [BRANCH NAME] AS branch, SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
      WHERE [BRANCH NAME] IS NOT NULL AND (${filters})
      GROUP BY [BRANCH NAME]
      ORDER BY total_sales DESC
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ branchSales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//7
export async function getTopSalespersons(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
        SALESPERSON AS salesperson,
        SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
     WHERE SALESPERSON IS NOT NULL AND SALESPERSON <> '' AND (${filters})
      GROUP BY SALESPERSON
      ORDER BY total_sales DESC
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Salesperson Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//8
export async function getSupplier(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
        SUPPLIER,
        SUM(SALES) AS totalSales,
        SUM(SALES - COGS) AS totalProfit
      FROM MIS_DASHBOARD_TBL
      WHERE SUPPLIER IS NOT NULL
        AND LTRIM(RTRIM(SUPPLIER)) <> '' AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY totalSales DESC
    `;

    const result = await request.query(query);


    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Supplier Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


