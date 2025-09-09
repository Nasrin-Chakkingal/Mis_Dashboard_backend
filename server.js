import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  requestTimeout: 240000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 120000,
  },
};

sql.connect(config)
  .then(pool => {
    if (pool.connected) {
      console.log("✅ Connected to SQL Server");

      // Example test route
      app.get("/api/test", async (req, res) => {
        try {
          const result = await pool.request().query("SELECT GETDATE() as CurrentTime");
          res.json(result.recordset);
        } catch (err) {
          console.error("❌ Query error:", err);
          res.status(500).json({ error: "Database query failed" });
        }
      });

    function buildFilters(queryParams, request) {
  const conditions = ["1=1"];

  if (queryParams.supplier) {
    conditions.push("SUPPLIER = @supplier");
    request.input("supplier", sql.VarChar, queryParams.supplier);
  }
  if (queryParams.brand_code) {
    conditions.push("BRAND_CODE = @brand_code");
    request.input("brand_code", sql.VarChar, queryParams.brand_code);
  }
  if (queryParams.division_code) {
    conditions.push("DIVISION_CODE = @division_code");
    request.input("division_code", sql.VarChar, queryParams.division_code);
  }
  if (queryParams.type_code) {
    conditions.push("TYPE_CODE = @type_code");
    request.input("type_code", sql.VarChar, queryParams.type_code);
  }
  if (queryParams.branch_code) {
    conditions.push("BRANCH_CODE = @branch_code");   // ✅ consistent
    request.input("branch_code", sql.VarChar, queryParams.branch_code);
  }
  if (queryParams.fromDate) {
    conditions.push("VOCDATE >= @fromDate");
    request.input("fromDate", sql.Date, queryParams.fromDate);
  }
  if (queryParams.toDate) {
    conditions.push("VOCDATE <= @toDate");
    request.input("toDate", sql.Date, queryParams.toDate);
  }

  return conditions.join(" AND ");
}

 
  app.get('/api/monthly-sales', async (req, res) => {
  try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

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
    const unit = divisor === 1000 ? 'K' : 'M';

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
        profitPct
      };
    });

    res.json({ unit, data });

  } catch (err) {
    console.error("❌ Monthly Sales Error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get("/api/avg-selling-price", async (req, res) => {
  try {
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
      ORDER BY MONTH(VOCDATE);
  `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Avg Selling Price Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/customer-trend", async (req, res) => {
  try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
  WITH FirstPurchase AS (
  SELECT
    CUSTOMER,
    MIN(CONCAT(YEAR(VOCDATE), '-', RIGHT('0' + CAST(MONTH(VOCDATE) AS VARCHAR), 2))) AS FirstPurchaseMonth
  FROM MIS_DASHBOARD_TBL
  WHERE CUSTOMER IS NOT NULL AND VOCDATE IS NOT NULL AND (${filters})
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
WHERE m.CUSTOMER IS NOT NULL AND m.VOCDATE IS NOT NULL AND (${filters})
      GROUP BY CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2))
ORDER BY Month; `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer trend error:", err.message, err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/qty-sold", async (req, res) => {
  try {
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
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Qty Sold API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// ✅ Route: Dashboard Summary Cards
app.get("/api/summary", async (req, res) => {
  try {
    const request = pool.request();

    // 1️⃣ Total Summary
    const totalResult = await request.query(`
      SELECT
        SUM(SALES) AS totalSales,
        SUM(COGS) AS totalCost,
        SUM(PIECES) AS totalQty,
        COUNT(DISTINCT CUSTOMER) AS totalCustomers
      FROM MIS_DASHBOARD_TBL
      WHERE VOCDATE IS NOT NULL
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
      GROUP BY SUPPLIER
      ORDER BY total_sales DESC
    `);

    // 3️⃣ Brand Summary
    const brandResult = await request.query(`
      SELECT TOP 5
        BRAND_CODE AS brand,
        SUM(SALES) AS total_sale
      FROM MIS_DASHBOARD_TBL
      GROUP BY BRAND_CODE
      ORDER BY total_sale DESC
    `);

    // 4️⃣ Pieces Summary
    const piecesResult = await request.query(`
      SELECT
        AgeBucket,
        SUM(PIECES) AS total_pieces
      FROM MIS_DASHBOARD_TBL
      GROUP BY AgeBucket
      ORDER BY AgeBucket
    `);

    res.json({
      // Total KPIs
      totalSales: parseFloat((sales / divisor).toFixed(2)),
      totalCost: parseFloat((cost / divisor).toFixed(2)),
      totalQty: total.totalQty || 0,
      totalCustomers: total.totalCustomers || 0,
      profit: parseFloat((profit / divisor).toFixed(2)),
      profitPct,

      // Breakdown summaries
      supplierSummary: supplierResult.recordset,
      brandSummary: brandResult.recordset,
      piecesSummary: piecesResult.recordset,
    });

  } catch (err) {
    console.error("❌ Summary API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/api/movement-category-comparison', async (req, res) => {
  try {
    const result = await pool.request()
      .input('year', sql.Int, 2022)
      .query(`
        SELECT
  CASE
    WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
    WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
    ELSE 'Slow-Moving'
  END AS MovementCategory,
  SUM(SALES) AS total_sales
FROM MIS_DASHBOARD_TBL
WHERE YEAR(VOCDATE) = 2022
GROUP BY
  CASE
    WHEN DATEDIFF(DAY, PURDATE, VOCDATE) <= 30 THEN 'Fast-Moving'
    WHEN DATEDIFF(DAY, PURDATE, VOCDATE) BETWEEN 31 AND 90 THEN 'Medium-Moving'
    ELSE 'Slow-Moving'
  END;

      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Basic movement-category query failed:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/api/filter-options", async (req, res) => {
  try {
    const poolRequest = pool.request();

    const result = await poolRequest.query(`
      SELECT DISTINCT SUPPLIER, BRAND_CODE, DIVISION_CODE, TYPE_CODE, BRANCH_CODE
      FROM MIS_DASHBOARD_TBL
      WHERE SUPPLIER IS NOT NULL OR BRAND_CODE IS NOT NULL
         OR DIVISION_CODE IS NOT NULL OR TYPE_CODE IS NOT NULL
    `);

    const raw = result.recordset;

    // Deduplicate values
    const unique = {
      supplier: [...new Set(raw.map(r => r.SUPPLIER))].filter(Boolean),
      brand_code: [...new Set(raw.map(r => r.BRAND_CODE))].filter(Boolean),
      division_code: [...new Set(raw.map(r => r.DIVISION_CODE))].filter(Boolean),
      type_code: [...new Set(raw.map(r => r.TYPE_CODE))].filter(Boolean),
      branch_code: [...new Set(raw.map(r => r.BRANCH_CODE))].filter(Boolean),
    };

    res.json(unique);
  } catch (err) {
    console.error("❌ Filter options fetch error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
 

app.get("/api/pieces", async (req, res) => {
   try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

  const query = `SELECT AgeBucket, SUM(PIECES) AS total_pieces
      FROM MIS_DASHBOARD_TBL
      WHERE AgeBucket IS NOT NULL AND AgeBucket != 'NA' AND (${filters})
       GROUP BY AgeBucket
      ORDER BY AgeBucket;`;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/pieces:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
 

app.get("/api/top-brands", async (req, res) => {
  try {
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
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Error fetching top brands:", err.message, err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 
  app.get('/api/supplier-sales', async (req, res) => {
 try {
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

    console.log("✅ Running Query:", query, req.query); // ✅ Debugging
    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Supplier Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/branch-sales', async (req, res) => {

    try {
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
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Branch-wise sales error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/top-salespersons", async (req, res) => {
  try {
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
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ salespersoN error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/customer-sales', async (req, res) => {
  try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        CAST(YEAR(VOCDATE) AS VARCHAR(4)) + '-' +
        RIGHT('0' + CAST(MONTH(VOCDATE) AS VARCHAR(2)), 2) AS YearMonth,
        SUM(SALES) AS TotalSales,
        SUM(COGS) AS TotalCOGS,
        COUNT(DISTINCT CUSTOMER) AS CustomerCount,
        CAST(1.0 * SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS DECIMAL(10, 2)) AS AvgSalesPerCustomer,
        CAST(1.0 * (SUM(SALES) - SUM(COGS)) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS DECIMAL(10, 2)) AS AvgProfitPerCustomer
      FROM MIS_DASHBOARD_TBL
      WHERE SALES > 0 AND (${filters})
      GROUP BY YEAR(VOCDATE), MONTH(VOCDATE)
      ORDER BY YEAR(VOCDATE), MONTH(VOCDATE);
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer-wise sales error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.get('/api/customer-qnty', async (req, res) => {

    try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
     SELECT
  CAST(YEAR(VOCDATE) AS VARCHAR(4)) + '-' + CAST(MONTH(VOCDATE) AS VARCHAR(2)) AS YearMonth,
  SUM(PIECES) AS TotalQty,
  COUNT(DISTINCT CUSTOMER) AS CustomerCount,
  CAST(1.0 * SUM(PIECES) / COUNT(DISTINCT CUSTOMER) AS DECIMAL(10, 2)) AS AvgQtyPerCustomer
FROM MIS_DASHBOARD_TBL
WHERE SALES > 0 AND (${filters})
GROUP BY YEAR(VOCDATE), MONTH(VOCDATE)
ORDER BY YEAR(VOCDATE), MONTH(VOCDATE);

    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer-wise qnty error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Route: Avg per Customer Summary
app.get('/api/customer-summary', async (req, res) => {
  try {
    const request = pool.request();

    const result = await request.query(`
      SELECT COUNT(DISTINCT CUSTOMER) AS TotalCustomers
      FROM MIS_DASHBOARD_TBL
      WHERE SALES > 0
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Customer summary error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🚩 INVENTORY MONTHLY SUMMARY API
app.get("/api/inventory/monthly-summary", async (req, res) => {
  try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query =`
      SELECT
    CAST(YEAR(PURDATE) AS VARCHAR(4)) + '-' + RIGHT('0' + CAST(MONTH(PURDATE) AS VARCHAR(2)), 2) AS Month,
    SUM(COGS) AS TotalStockValue,
    SUM(PIECES) AS TotalQuantity,
    SUM([GROSS WEIGHT]) AS TotalGrossWeight,
    SUM([PURE WEIGHT]) AS TotalPureWeight
FROM MIS_DASHBOARD_TBL
Where YEAR(PURDATE) = 2022 AND (${filters})
GROUP BY YEAR(PURDATE), MONTH(PURDATE)
ORDER BY YEAR(PURDATE), MONTH(PURDATE);

    `;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/supplier', async (req, res) => {
   try {
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
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Supplier sales error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/capital-report', async (req, res) => {
  try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        FORMAT(VOCDATE, 'yyyy-MM') AS month,
        SUM(MKG_STOCKVALUE) AS totalStockValue
      FROM MIS_DASHBOARD_TBL
      wHERE  (${filters})
      GROUP BY FORMAT(VOCDATE, 'yyyy-MM')
      ORDER BY month DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Capital reporterror:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//branch_wise sales
app.get('/api/branch-sales', async (req, res) => {
 try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
    [BRANCH NAME],
    SUM(SALEs) AS TotalSales
FROM MIS_DASHBOARD_TBL
 wHERE  (${filters})
GROUP BY [BRANCH NAME]
ORDER BY TotalSales DESC; `;

    console.log("✅ Running Query:", query, req.query); // ✅ Debugging
    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ branch Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/branch-customer', async (req, res) => {
 try {
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
    [BRANCH NAME] AS Branch,
    COUNT(DISTINCT CUSTOMER) AS UniqueCustomers
FROM MIS_DASHBOARD_TBL
WHERE 1=1  AND (${filters})
GROUP BY [BRANCH NAME]
ORDER BY UniqueCustomers DESC`;

    console.log("✅ Running Query:", query, req.query); // ✅ Debugging
    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ branch CUTOMER Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // stop app if DB fails
  });

