import { getPool } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";


//1
export async function getSupplierPerformance(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 🌍 Global filters
    const filters = buildFilters(req.query, request);

    const query = `
      WITH Supplier_Agg AS (
        SELECT
          SUPPLIER,

          SUM(COGS) AS total_purchase_cost,
          SUM(SALES) AS total_sales,
          SUM(SALES) - SUM(COGS) AS gross_profit,
          SUM(PIECES) AS quantity_purchased,

          SUM(COGS) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_cost_per_unit,
          SUM(SALES) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_selling_price
        FROM MIS_DASHBOARD_TBL
        WHERE
          COGS IS NOT NULL
          AND SALES IS NOT NULL
          AND PIECES IS NOT NULL
          AND (${filters})
        GROUP BY SUPPLIER
      )
      SELECT
        SUPPLIER,
        total_purchase_cost,
        total_sales,
        gross_profit,
        quantity_purchased,

        ROUND(avg_cost_per_unit, 2) AS avg_cost_per_unit,
        ROUND(avg_selling_price, 2) AS avg_selling_price,

        ROUND(
          total_sales * 100.0 /
          NULLIF(SUM(total_sales) OVER (), 0), 2
        ) AS supplier_contribution_percent,

        ROUND(
          gross_profit * 100.0 /
          NULLIF(total_sales, 0), 2
        ) AS profit_percent
      FROM Supplier_Agg
      ORDER BY total_sales DESC;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset, // ✅ same response structure as your other APIs
    });
  } catch (err) {
    console.error("❌ Supplier Performance Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
//2
export async function getProcurementThreshold(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 🌍 Global filters
    const filters = buildFilters(req.query, request);

    // 🎚️ Threshold percentage (configurable)
    const thresholdPct = Number(req.query.threshold_pct || 10);
    request.input("threshold_pct", sql.Float, thresholdPct);

    const query = `
      WITH Cost_Agg AS (
        SELECT
          BRAND_CODE,
          TYPE_CODE,
          SUPPLIER,
          AVG(COGS) AS avg_cost,
          MIN(COGS) AS min_cost,
          MAX(COGS) AS max_cost
        FROM MIS_DASHBOARD_TBL
        WHERE
          COGS IS NOT NULL
          AND (${filters})
        GROUP BY
          BRAND_CODE,
          TYPE_CODE,
          SUPPLIER
      )
      SELECT
        BRAND_CODE,
        TYPE_CODE,
        SUPPLIER,

        ROUND(avg_cost, 2) AS avg_cost,
        ROUND(min_cost, 2) AS min_cost,
        ROUND(max_cost, 2) AS max_cost,

        ROUND(
          (avg_cost - min_cost) * 100.0 / NULLIF(min_cost, 0), 2
        ) AS price_deviation_percent,

        CASE
          WHEN avg_cost > (min_cost * (1 + @threshold_pct / 100.0))
          THEN 1 ELSE 0
        END AS is_above_threshold
      FROM Cost_Agg
      ORDER BY avg_cost DESC;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
      meta: {
        threshold_pct: thresholdPct
      }
    });
  } catch (err) {
    console.error("❌ Procurement Threshold Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


//3

export async function getPurchaseOrderAnalysis(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 🌍 Global filters
    const filters = buildFilters(req.query, request);

    const query = `
      WITH Purchase_Agg AS (
        SELECT
          BRAND_CODE,
          TYPE_CODE,

          SUM(PIECES) AS po_quantity,
          SUM(COGS) AS po_value
        FROM MIS_DASHBOARD_TBL
        WHERE
          PURDATE IS NOT NULL
          AND COGS IS NOT NULL
          AND PIECES IS NOT NULL
          AND (${filters})
        GROUP BY BRAND_CODE, TYPE_CODE
      ),
      Sales_Agg AS (
        SELECT
          BRAND_CODE,
          TYPE_CODE,

          SUM(PIECES) AS sold_quantity,
          SUM(SALES) AS sales_value
        FROM MIS_DASHBOARD_TBL
        WHERE
          VOCDATE IS NOT NULL
          AND SALES IS NOT NULL
          AND PIECES IS NOT NULL
          AND (${filters})
        GROUP BY BRAND_CODE, TYPE_CODE
      )
      SELECT
        p.BRAND_CODE,
        p.TYPE_CODE,

        p.po_quantity,
        s.sold_quantity,

        p.po_value,
        s.sales_value,

        (p.po_quantity - ISNULL(s.sold_quantity, 0)) AS quantity_gap,

        CASE
          WHEN p.po_quantity > ISNULL(s.sold_quantity, 0) * 1.2 THEN 'OVERSTOCK'
          WHEN p.po_quantity < ISNULL(s.sold_quantity, 0) * 0.8 THEN 'UNDERSTOCK'
          ELSE 'OPTIMAL'
        END AS risk_flag
      FROM Purchase_Agg p
      LEFT JOIN Sales_Agg s
        ON p.BRAND_CODE = s.BRAND_CODE
       AND p.TYPE_CODE = s.TYPE_CODE
      ORDER BY quantity_gap DESC;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset
    });
  } catch (err) {
    console.error("❌ PO Analysis Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//4
//5
export async function getSPkpi(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 🌍 Global filters
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
  SUM(COGS) AS total_purchase_cost,
  SUM(SALES) AS total_sales,
  SUM(SALES) - SUM(COGS) AS gross_profit,
  SUM(PIECES) AS quantity_purchased,

  ROUND(
          SUM(COGS) * 1.0 / NULLIF(SUM(PIECES), 0), 2
        ) AS avg_cost_per_piece
      FROM MIS_DASHBOARD_TBL
      WHERE
        COGS IS NOT NULL
        AND SALES IS NOT NULL
        AND PIECES IS NOT NULL
        AND (${filters});
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset
    });
  } catch (err) {
    console.error("❌ Supplier Performance kpi Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//6

export async function getSupplierSalesCost(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 7
        SUPPLIER,
        SUM(SALES) AS total_sales,
        SUM(COGS) AS total_purchase_cost
      FROM MIS_DASHBOARD_TBL
      WHERE
        SUPPLIER IS NOT NULL
  AND LTRIM(RTRIM(SUPPLIER)) <> ''
        AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY total_sales DESC;
    `;

    const result = await request.query(query);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Supplier Sales vs Cost Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//7

export async function getSupplierGrossProfit(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 7
        SUPPLIER,
        SUM(SALES) - SUM(COGS) AS gross_profit
      FROM MIS_DASHBOARD_TBL
      WHERE
        SUPPLIER IS NOT NULL
        AND LTRIM(RTRIM(SUPPLIER)) <> ''
        AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY gross_profit DESC;
    `;

    const result = await request.query(query);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Supplier Gross Profit Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//8

export async function getSupplierContribution(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      WITH SupplierSales AS (
        SELECT
          SUPPLIER,
          SUM(SALES) AS supplier_sales
        FROM MIS_DASHBOARD_TBL
        WHERE
          SUPPLIER IS NOT NULL
          AND LTRIM(RTRIM(SUPPLIER)) <> ''
          AND (${filters})
        GROUP BY SUPPLIER
      )
      SELECT top 7
        SUPPLIER,
        supplier_sales,
        supplier_sales * 100.0 /
          NULLIF(SUM(supplier_sales) OVER (), 0) AS contribution_percent
      FROM SupplierSales
      ORDER BY contribution_percent DESC;
    `;

    const result = await request.query(query);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Supplier Contribution Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



export async function getSupplierPerformanceTable(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      WITH SupplierAgg AS (
        SELECT
          SUPPLIER,
          SUM(SALES) AS total_sales,
          SUM(COGS) AS total_purchase_cost,
          SUM(SALES) - SUM(COGS) AS gross_profit
        FROM MIS_DASHBOARD_TBL
        WHERE
          SUPPLIER IS NOT NULL
          AND (${filters})
        GROUP BY SUPPLIER
      )
      SELECT top 10
        SUPPLIER,
        total_sales,
        total_purchase_cost,
        gross_profit,
        gross_profit * 100.0 / NULLIF(total_sales, 0) AS profit_percent,
        total_sales * 100.0 /
          NULLIF(SUM(total_sales) OVER (), 0) AS contribution_percent
      FROM SupplierAgg
      ORDER BY total_sales DESC;
    `;

    const result = await request.query(query);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Supplier Performance Table Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getSupplierThresholdAnalysis(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 7
        SUPPLIER,
        SUM(SALES) AS total_sales,
        SUM(COGS) AS total_cost,
        (SUM(SALES) - SUM(COGS)) AS gross_profit,
        CAST(
          (SUM(SALES) - SUM(COGS)) * 100.0 / NULLIF(SUM(SALES), 0)
          AS DECIMAL(10,2)
        ) AS profit_pct,
        CASE
          WHEN (SUM(SALES) - SUM(COGS)) * 100.0 / NULLIF(SUM(SALES), 0) < 10 THEN 'Underperforming'
          WHEN (SUM(SALES) - SUM(COGS)) * 100.0 / NULLIF(SUM(SALES), 0) BETWEEN 10 AND 20 THEN 'Watchlist'
          ELSE 'Preferred'
        END AS threshold_status
      FROM MIS_DASHBOARD_TBL
      WHERE (${filters})
      GROUP BY SUPPLIER
      ORDER BY profit_pct ASC;
    `;

    const result = await request.query(query);

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Supplier Threshold Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getPOValueTrend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 6
        DATENAME(MONTH, PURDATE) AS label,
        MONTH(PURDATE) AS sort_order,
        SUM(COGS) AS po_value
      FROM MIS_DASHBOARD_TBL
      WHERE PURDATE IS NOT NULL
        AND (${filters})
      GROUP BY DATENAME(MONTH, PURDATE), MONTH(PURDATE)
      ORDER BY sort_order;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ PO Value Trend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getPOValueBySupplier(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 6
        SUPPLIER,
        SUM(COGS) AS po_value
      FROM MIS_DASHBOARD_TBL
      WHERE SUPPLIER IS NOT NULL
        AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY po_value DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ PO Value by Supplier Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getVendorPriceComparison(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT top 6
        SUPPLIER,
        SUM(COGS) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_cost_per_unit
      FROM MIS_DASHBOARD_TBL
      WHERE SUPPLIER IS NOT NULL
        AND PIECES > 0
        AND (${filters})
      GROUP BY SUPPLIER
      ORDER BY avg_cost_per_unit DESC;
    `;

    const result = await request.query(query);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("❌ Vendor Price Comparison Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



export async function getProcurementKPIs(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      WITH supplier_profit AS (
  SELECT
    SUPPLIER,
    SUM(SALES) AS total_sales,
    SUM(COGS) AS total_cogs,
    (SUM(SALES) - SUM(COGS)) * 100.0 / NULLIF(SUM(SALES), 0) AS profit_pct
  FROM MIS_DASHBOARD_TBL
  WHERE (${filters})
  GROUP BY SUPPLIER
),
overall AS (
  SELECT
    SUM(COGS) AS total_po_value,
    SUM(SALES) - SUM(COGS) AS total_gross_profit,
    AVG((SALES - COGS) * 100.0 / NULLIF(SALES, 0)) AS avg_profit_pct,
    SUM(COGS) * 1.0 / NULLIF(SUM(PIECES), 0) AS avg_cost_per_unit
  FROM MIS_DASHBOARD_TBL
  WHERE (${filters})
)
SELECT
  MAX(o.total_po_value) AS total_po_value,
  MAX(o.total_gross_profit) AS total_gross_profit,
  MAX(o.avg_profit_pct) AS avg_profit_pct,
  MAX(o.avg_cost_per_unit) AS avg_cost_per_unit,
  COUNT(CASE WHEN s.profit_pct >= 40 THEN 1 END) AS preferred_suppliers
FROM overall o
LEFT JOIN supplier_profit s ON 1 = 1;

    `;

    const result = await request.query(query);
    const row = result.recordset[0] || {};

    res.json({
      data: {
        totalPOValue: row.total_po_value || 0,
        totalGrossProfit: row.total_gross_profit || 0,
        avgProfitPct: row.avg_profit_pct || 0,
        avgCostPerUnit: row.avg_cost_per_unit || 0,
        preferredSuppliers: row.preferred_suppliers || 0,
      },
    });
  } catch (err) {
    console.error("❌ Procurement KPI Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


export async function getSalesVsCostTrend(req, res) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const query = `
      SELECT
        DATENAME(MONTH, VOCDATE) AS label,
        MONTH(VOCDATE) AS sort_order,
        SUM(SALES) AS total_sales,
        SUM(COGS) AS total_purchase_cost
      FROM MIS_DASHBOARD_TBL
      WHERE SALES IS NOT NULL
        AND COGS IS NOT NULL
        AND (${filters})
      GROUP BY DATENAME(MONTH, VOCDATE), MONTH(VOCDATE)
      ORDER BY sort_order;
    `;

    const result = await request.query(query);

    res.json({
      data: result.recordset,
    });
  } catch (err) {
    console.error("❌ Sales vs Cost Trend Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
