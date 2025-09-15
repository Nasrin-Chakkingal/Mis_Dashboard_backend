
import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";

export async function getSummary(req, res) {
  try {
    const pool = await getPool();
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
    const divisor = sales < 1_000_000 ? 1000 : 1_000_000;

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
      totalSales: parseFloat((sales / divisor).toFixed(2)),
      totalCost: parseFloat((cost / divisor).toFixed(2)),
      totalQty: total.totalQty || 0,
      totalCustomers: total.totalCustomers || 0,
      profit: parseFloat((profit / divisor).toFixed(2)),
      profitPct,
      supplierSummary: supplierResult.recordset,
      brandSummary: brandResult.recordset,
      piecesSummary: piecesResult.recordset,
    });

  } catch (err) {
    console.error("❌ Summary API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



// 🚩 CUSTOMER SUMMARY
export async function getCustomerSummary(req, res) {
  try {
    const pool = await getPool();
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
}

// 🚩 INVENTORY MONTHLY SUMMARY
export async function getInventoryMonthlySummary(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        CAST(YEAR(PURDATE) AS VARCHAR(4)) + '-' 
          + RIGHT('0' + CAST(MONTH(PURDATE) AS VARCHAR(2)), 2) AS Month,
        SUM(COGS) AS TotalStockValue,
        SUM(PIECES) AS TotalQuantity,
        SUM([GROSS WEIGHT]) AS TotalGrossWeight,
        SUM([PURE WEIGHT]) AS TotalPureWeight
      FROM MIS_DASHBOARD_TBL
      WHERE YEAR(PURDATE) = 2022 AND (${filters})
      GROUP BY YEAR(PURDATE), MONTH(PURDATE)
      ORDER BY YEAR(PURDATE), MONTH(PURDATE);
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Error fetching inventory summary:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}