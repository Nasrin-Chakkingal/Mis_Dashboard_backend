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
    console.log("✅ Connected to SQL Server");

function getDateGrouping(filter) {
  switch (filter) {
    case "weekly":
      return {
        groupBy: "DATEPART(ISO_WEEK, VOCDATE)",
        label: "'Week ' + CAST(DATEPART(ISO_WEEK, VOCDATE) AS VARCHAR)",
        sort: "DATEPART(ISO_WEEK, VOCDATE)"
      };
     case "yearly":
      return {
        groupBy: "YEAR(VOCDATE)",
        label: "CAST(YEAR(VOCDATE) AS VARCHAR)",
        sort: "YEAR(VOCDATE)"
      };
     case "monthly":
     default:
      return {
        groupBy: "MONTH(VOCDATE)",
        label: "FORMAT(VOCDATE, 'MMMM')",
        sort: "MONTH(VOCDATE)"
      };
  }
}


    app.get('/api/monthly-sales', async (req, res) => {
  try {
    const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

    const request = pool.request();
    if (supplier) request.input('supplier', sql.VarChar, supplier);
    if (brand_code) request.input('brand_code', sql.VarChar, brand_code);
    if (division_code) request.input('division_code', sql.VarChar, division_code);
    if (type_code) request.input('type_code', sql.VarChar, type_code);
    if (fromDate) request.input('fromDate', sql.Date, fromDate);
    if (toDate) request.input('toDate', sql.Date, toDate);

    const query = `
      SELECT 
        FORMAT(VOCDATE, 'MMMM') AS month,
        MONTH(VOCDATE) AS month_order,
        SUM(SALES) AS rawSales,
        SUM(COGS) AS rawCost
      FROM MIS_DASHBOARD_TBL
      WHERE VOCDATE IS NOT NULL
        ${supplier ? "AND SUPPLIER = @supplier" : ""}
        ${brand_code ? "AND BRAND_CODE = @brand_code" : ""}
        ${division_code ? "AND DIVISION_CODE = @division_code" : ""}
        ${type_code ? "AND TYPE_CODE = @type_code" : ""}
        ${fromDate ? "AND VOCDATE >= @fromDate" : ""}
        ${toDate ? "AND VOCDATE <= @toDate" : ""}
      GROUP BY FORMAT(VOCDATE, 'MMMM'), MONTH(VOCDATE)
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
  const filter = req.query.filter || "monthly";
  const { groupBy, label, sort } = getDateGrouping(filter);
  const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

  let filters = "";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";

  const query = `
    SELECT ${label} AS label,
           ${sort} AS sort_order,
           SUM(SALES) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_selling_price
    FROM MIS_DASHBOARD_TBL
    WHERE SALES IS NOT NULL AND PIECES IS NOT NULL
    ${filters}
    GROUP BY ${label}, ${groupBy}
    ORDER BY ${sort};
  `;

  try {
    const request = pool.request();
    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Avg Selling Price Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/api/customer-trend", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const request = pool.request();
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const query = `
      WITH FirstPurchase AS (
        SELECT 
          CUSTOMER, 
          MIN(VOCDATE) AS FirstPurchaseDate
        FROM MIS_DASHBOARD_TBL
        WHERE CUSTOMER IS NOT NULL
        ${fromDate ? "AND VOCDATE >= @fromDate" : ""}
        ${toDate ? "AND VOCDATE <= @toDate" : ""}
        GROUP BY CUSTOMER
      )
      SELECT 
        FORMAT(m.VOCDATE, 'yyyy-MM') AS Month,
        COUNT(DISTINCT CASE WHEN m.VOCDATE = f.FirstPurchaseDate THEN m.CUSTOMER END) AS NewCustomers,
        COUNT(DISTINCT CASE WHEN m.VOCDATE > f.FirstPurchaseDate THEN m.CUSTOMER END) AS ReturningCustomers
      FROM MIS_DASHBOARD_TBL m
      INNER JOIN FirstPurchase f ON m.CUSTOMER = f.CUSTOMER
      WHERE m.CUSTOMER IS NOT NULL
        ${fromDate ? "AND m.VOCDATE >= @fromDate" : ""}
        ${toDate ? "AND m.VOCDATE <= @toDate" : ""}
      GROUP BY FORMAT(m.VOCDATE, 'yyyy-MM')
      ORDER BY Month;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer trend error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/api/qty-sold", async (req, res) => {
  const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

  // Dynamically build WHERE conditions
  let filters = "WHERE PIECES IS NOT NULL";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";

  const query = `
    SELECT 
      FORMAT(VOCDATE, 'MMMM') AS month,
      MONTH(VOCDATE) AS month_order,
      SUM(PIECES) AS qty_sold
    FROM MIS_DASHBOARD_TBL
    ${filters}
    GROUP BY FORMAT(VOCDATE, 'MMMM'), MONTH(VOCDATE)
    ORDER BY MONTH(VOCDATE);
  `;

  try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Qty Sold API Error:", err);
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
      SELECT DISTINCT SUPPLIER, BRAND_CODE, DIVISION_CODE, TYPE_CODE
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
    };

    res.json(unique);
  } catch (err) {
    console.error("❌ Filter options fetch error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
 

app.get("/api/pieces", async (req, res) => {
  const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

   let filters = "WHERE AgeBucket IS NOT NULL AND AgeBucket != 'NA'";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";

  const query = `SELECT AgeBucket, SUM(PIECES) AS total_pieces
      FROM MIS_DASHBOARD_TBL
      ${filters}
       GROUP BY AgeBucket
      ORDER BY AgeBucket;`;

try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/pieces:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

    
    

app.get("/api/top-brands", async (req, res) => {
  const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

   let filters = "WHERE BRAND_CODE IS NOT NULL AND BRAND_CODE != ''";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";

  const query = `SELECT TOP 6 BRAND_CODE AS brand, SUM(SALES) AS total_sale
                 FROM MIS_DASHBOARD_TBL
                 ${filters}
                 GROUP BY BRAND_CODE
                 ORDER BY total_sale DESC;`;

try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error fetching top brands", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
 
    
      

  app.get('/api/supplier-sales', async (req, res) => {
    const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;
    
    let filters = "WHERE supplier IS NOT NULL AND supplier != '' ";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";

  const query = `
      SELECT TOP 6 supplier, SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
      ${filters}
      GROUP BY supplier
      ORDER BY total_sales DESC;
    `;

    try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error fetching top brands", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/api/branch-sales', async (req, res) => {

    const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

    let filters = "WHERE [BRANCH NAME] IS NOT NULL ";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";
    const query = `
      SELECT TOP 7 [BRANCH NAME] AS branch, SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
      ${filters}
      GROUP BY [BRANCH NAME]
      ORDER BY total_sales DESC
    `;
try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Branch-wise sales error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/top-salespersons", async (req, res) => {
  const { supplier, brand_code, division_code, type_code, fromDate, toDate } = req.query;

 let filters = "WHERE SALESPERSON IS NOT NULL AND SALESPERSON <> '' ";
  if (supplier) filters += " AND SUPPLIER = @supplier";
  if (brand_code) filters += " AND BRAND_CODE = @brand_code";
  if (division_code) filters += " AND DIVISION_CODE = @division_code";
  if (type_code) filters += " AND TYPE_CODE = @type_code";
  if (fromDate) filters += " AND VOCDATE >= @fromDate";
  if (toDate) filters += " AND VOCDATE <= @toDate";
    const query = `
      SELECT TOP 6 
        SALESPERSON AS salesperson, 
        SUM(SALES) AS total_sales
      FROM MIS_DASHBOARD_TBL
      ${filters}
      GROUP BY SALESPERSON
      ORDER BY total_sales DESC
    `;

    try {
    const request = pool.request();

    if (supplier) request.input("supplier", sql.VarChar, supplier);
    if (brand_code) request.input("brand_code", sql.VarChar, brand_code);
    if (division_code) request.input("division_code", sql.VarChar, division_code);
    if (type_code) request.input("type_code", sql.VarChar, type_code);
    if (fromDate) request.input("fromDate", sql.Date, fromDate);
    if (toDate) request.input("toDate", sql.Date, toDate);

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ salespersoN error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



     app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

}).catch((err) => {
  console.error("❌ SQL Connection Error:", err);
});