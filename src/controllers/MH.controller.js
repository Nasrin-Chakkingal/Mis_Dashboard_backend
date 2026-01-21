import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";

//1
export async function getCustomerKpi(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        COUNT(DISTINCT CUSTOMER) AS Total_Customers,
        SUM(CASE WHEN BTC_Flag = 'BTC' THEN 1 ELSE 0 END) AS BTC_Customers,
        AVG(Avg_Ticket) AS Avg_Spend,
        SUM(CASE WHEN RFM_Segment = 'At Risk' THEN 1 ELSE 0 END) AS At_Risk_Customers
      FROM CUSTOMER_SEGMENTATION_TBL
      WHERE (${filters})
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset[0] });
  } catch (err) {
    console.error("❌ Customer KPI Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//2
export async function getCustomerRfm(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `SELECT
    RFM_Segment,
    COUNT(*) AS Customer_Count
FROM CUSTOMER_SEGMENTATION_TBL
WHERE (${filters})
GROUP BY RFM_Segment
ORDER BY Customer_Count DESC`;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer RFM Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//3

export async function getCustomerBtc(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `SELECT
    BTC_Flag,
    COUNT(*) AS Customer_Count
FROM CUSTOMER_SEGMENTATION_TBL
WHERE (${filters})
GROUP BY BTC_Flag;
    `;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer Btc-distribution Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//4

export async function getCustomerAvgSpendTrend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
    SELECT
    FORMAT(PURDATE, 'yyyy-MM') AS Month,
    AVG(SALES) AS Avg_Spend
FROM MIS_DASHBOARD_TBL
WHERE (${filters})
GROUP BY FORMAT(PURDATE, 'yyyy-MM')
ORDER BY Month;

    `;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer avg-spend-trend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//5

export async function getCustomerAvgspendSegment(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
    SELECT
    RFM_Segment,
    AVG(Avg_Ticket) AS Avg_Spend
FROM CUSTOMER_SEGMENTATION_TBL
WHERE (${filters})
GROUP BY RFM_Segment;

    `;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer avg-spend-by-segment Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//6
export async function getCustomerNeedtoSpend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
    SELECT
    RFM_Segment,
    SUM(Need_To_Spend) AS Total_Need_To_Spend
FROM CUSTOMER_SEGMENTATION_TBL
WHERE (${filters})
GROUP BY RFM_Segment;

    `;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer need-to-spend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//7

export async function getCustomerSegmentation(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
    SELECT TOP 10
    CUSTOMER,
    RFM_Segment,
    BTC_Flag,
    Avg_Ticket,
    Monetary,
    Need_To_Spend,
    Growth_Gap
FROM CUSTOMER_SEGMENTATION_TBL
WHERE (${filters})

    `;

 const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Customer segmentation-table Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//8

export async function getTopCustomers(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 10
        CUSTOMER,
        Monetary,
        Avg_Ticket,
        Growth_Gap
      FROM CUSTOMER_SEGMENTATION_TBL
      WHERE RFM_Segment = 'Champion'
        AND (${filters})
      ORDER BY Monetary DESC
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Top Customers Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//9 campaigns
export async function getCampaignKPI(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        SUM(SALES) AS TotalSales,
        COUNT(DISTINCT VOCNO) AS Transactions,
        COUNT(DISTINCT CUSTOMER) AS Footfall,
        SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgSpend,
        CAST(
          COUNT(DISTINCT VOCNO) * 100.0 /
          NULLIF(COUNT(DISTINCT CUSTOMER), 0)
          AS DECIMAL(10,2)
        ) AS ConversionRate
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters});
    `;

    const result = await request.query(query);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Campaign KPI Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//10
export async function getCampaignPerformance(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 10
        ISNULL(BRAND_CODE, 'Unknown') AS Campaign,
        SUM(SALES) AS TotalSales,
        COUNT(DISTINCT CUSTOMER) AS Footfall
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters})
      GROUP BY BRAND_CODE
      ORDER BY TotalSales DESC
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Campaign Performance Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//11
export async function getCampaignAvgSpendTrend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        CONVERT(char(7), VOCDATE, 120) AS Month,
        SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgSpend
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters})
      GROUP BY CONVERT(char(7), VOCDATE, 120)
      ORDER BY Month
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Campaign Avg Spend Trend Error:", err);
    res.status(500).json({ error: err.message });
  }
}

//12
export async function getCampaignEffectiveness(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 10
        ISNULL(BRAND_CODE, 'Unknown') AS Campaign,
        SUM(SALES) AS TotalSales,
        COUNT(DISTINCT CUSTOMER) AS Footfall,
        SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgSpend
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters})
      GROUP BY BRAND_CODE
      ORDER BY TotalSales DESC
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Campaign Effectiveness Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//13 Loyalty
export async function getLoyaltyKPIs(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        COUNT(DISTINCT CUSTOMER) AS LoyaltyCustomers,
        COUNT(DISTINCT VOCNO) AS LoyaltyTransactions,
        SUM(SALES) AS LoyaltySales,
        SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgLoyaltySpend,
        CAST(
          COUNT(DISTINCT VOCNO) * 1.0 /
          NULLIF(COUNT(DISTINCT CUSTOMER), 0)
          AS DECIMAL(10,2)
        ) AS PurchaseFrequency
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters});
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset[0] });
  } catch (err) {
    console.error("❌ Loyalty KPI Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//14
export async function getLoyaltySalesVsCustomers(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    const filters = buildFilters(req.query, request);

    const query = `
      SELECT TOP 6
        ISNULL(BRAND_CODE, 'Unknown') AS Brand,
        COUNT(DISTINCT CUSTOMER) AS LoyaltyCustomers,
        SUM(SALES) AS LoyaltySales
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters})
      GROUP BY BRAND_CODE
      ORDER BY LoyaltySales DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Loyalty Sales vs Customers Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//15
export async function getLoyaltySpendComparison(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      WITH PurchaseOrder AS (
        SELECT
          CUSTOMER,
          SALES,
          ROW_NUMBER() OVER (PARTITION BY CUSTOMER ORDER BY VOCDATE) AS rn
        FROM MIS_DASHBOARD_TBL
        WHERE VOCTYPE = 'POS'
          AND (${filters})
      )
      SELECT
        AVG(CASE WHEN rn = 1 THEN SALES END) AS FirstPurchaseSpend,
        AVG(CASE WHEN rn > 1 THEN SALES END) AS RepeatPurchaseSpend
      FROM PurchaseOrder;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset[0] });
  } catch (err) {
    console.error("❌ Loyalty Spend Comparison Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//16 Overview
export async function getMarketingOverviewKPIs(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        SUM(SALES) AS TotalSales,
        COUNT(DISTINCT CUSTOMER) AS TotalFootfall,
        SUM(SALES) / NULLIF(COUNT(DISTINCT CUSTOMER), 0) AS AvgSpend,
        COUNT(DISTINCT VOCNO) AS Transactions
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters});

      SELECT
        COUNT(DISTINCT CUSTOMER) AS LoyaltyCustomers,
        SUM(SALES) AS LoyaltySales,
        CAST(
          COUNT(DISTINCT VOCNO) * 1.0 /
          NULLIF(COUNT(DISTINCT CUSTOMER), 0)
          AS DECIMAL(10,2)
        ) AS PurchaseFrequency
      FROM MIS_DASHBOARD_TBL
      WHERE VOCTYPE = 'POS'
        AND (${filters});
    `;

    const result = await request.query(query);

    res.json({
      sales: result.recordsets[0][0],
      loyalty: result.recordsets[1][0],
    });
  } catch (err) {
    console.error("❌ Overview KPI Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

