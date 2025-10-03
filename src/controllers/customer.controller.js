import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";

// 📈 Customer Trend
export async function getCustomerTrend(req, res) {
  try {
    const pool = await getPool();
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
          THEN m.CUSTOMER END) AS NewCustomers
      FROM MIS_DASHBOARD_TBL m
      JOIN FirstPurchase fp ON m.CUSTOMER = fp.CUSTOMER
      WHERE m.CUSTOMER IS NOT NULL AND m.VOCDATE IS NOT NULL AND (${filters})
      GROUP BY CONCAT(YEAR(m.VOCDATE), '-', RIGHT('0' + CAST(MONTH(m.VOCDATE) AS VARCHAR), 2))
      ORDER BY Month;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer Trend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 💰 Customer Sales
export async function getCustomerSales(req, res) {
  try {
    const pool = await getPool();
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
    console.error("❌ Customer Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 📦 Customer Quantity
export async function getCustomerQnty(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        CAST(YEAR(VOCDATE) AS VARCHAR(4)) + '-' +
        RIGHT('0' + CAST(MONTH(VOCDATE) AS VARCHAR(2)), 2) AS YearMonth,
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
    console.error("❌ Customer Quantity Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// 🏢 Branch Customers
export async function getBranchCustomer(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);
    const limit = parseInt(req.query.limit) || 6;

    const query = `
      SELECT TOP (${limit})
        [BRANCH NAME] AS Branch,
        COUNT(DISTINCT CUSTOMER) AS UniqueCustomers
      FROM MIS_DASHBOARD_TBL
      WHERE 1=1 AND (${filters})
      GROUP BY [BRANCH NAME]
      ORDER BY UniqueCustomers DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Branch Customer Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getCustomerSegmentation(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      WITH CustomerBase AS (
          SELECT
              CUSTOMER,
              MAX(VOCDATE) AS LastPurchase,
              COUNT(*) AS Frequency,
              SUM(SALES) AS Monetary
          FROM MIS_DASHBOARD_TBL
          WHERE CUSTOMER IS NOT NULL AND (${filters})
          GROUP BY CUSTOMER
      ),
      Segmented AS (
          SELECT
              CUSTOMER,
              CASE 
                  WHEN DATEDIFF(DAY, LastPurchase, GETDATE()) <= 30 THEN 'Recent'
                  WHEN DATEDIFF(DAY, LastPurchase, GETDATE()) <= 90 THEN 'Warm'
                  ELSE 'Inactive'
              END AS R_Segment,
              CASE 
                  WHEN Frequency >= 10 THEN 'Frequent'
                  WHEN Frequency >= 5 THEN 'Moderate'
                  ELSE 'Rare'
              END AS F_Segment,
              CASE 
                  WHEN Monetary >= 10000 THEN 'High'
                  WHEN Monetary >= 5000 THEN 'Medium'
                  ELSE 'Low'
              END AS M_Segment,
              CASE 
                  WHEN Monetary < 2000 THEN 'Need to Spend'
                  ELSE 'Healthy'
              END AS SpendFlag
          FROM CustomerBase
      )
      SELECT 
          R_Segment,
          F_Segment,
          M_Segment,
          SpendFlag,
          COUNT(*) AS CustomerCount
      FROM Segmented
      GROUP BY R_Segment, F_Segment, M_Segment, SpendFlag
      ORDER BY CustomerCount DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer Segmentation Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getAvgSpendPerVocno(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT 
        VOCNO,
        SUM(SALES) AS TotalSales,
        COUNT(DISTINCT CUSTOMER) AS UniqueCustomers,
        SUM(SALES) * 1.0 / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgSpendPerCustomer
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS' AND (${filters})
      GROUP BY VOCNO
      ORDER BY VOCNO DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Avg Spend VOCNO Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
