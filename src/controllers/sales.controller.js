


import { monthlySales,
  topBrands,
  Pieces,
  topsalesPerson,
  supplierSales,
  agebucketWiseSales,
  capitalReport,
  supplier,
  avgSellingPrice,
  branchSales,
  movementCategoryCopmarison,
  qntySold,
  Summary,
  customerTrend,
  customerSales,
  customerQuantity,
  customerSummary,
  monthlySummary,
  scrap_Analysis,
  Inventory_Movement,
  Stock_Report,
  Dead_Stock,
  Inventory_SummaryCards
 } from '../services/sales.services.js';
import { buildFilters } from '../utils/filters.js';

// 🔹 Monthly Sales
export const getMonthlySales = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await monthlySales(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Top Brands
export const getTopBrands = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await topBrands(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Pieces by Age Bucket
export const getPieces = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Pieces(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Top Salespersons
export const getTopSalesPerson = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await topsalesPerson(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Supplier Sales
export const getSupplierSales = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await supplierSales(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 AgeBucket Wise Sales
export const getAgebucketWiseSales = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await agebucketWiseSales(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Capital Report
export const getCapitalReport = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await capitalReport(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Supplier Profitability
export const getSupplier = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await supplier(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Avg Selling Price
export const getAvgSellingPrice = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await avgSellingPrice(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Branch Sales
export const getBranchSales = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await branchSales(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Movement Category Comparison
export const getMovementCategoryComparison = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await movementCategoryCopmarison(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Quantity Sold
export const getQntySold = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await qntySold(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// 🔹 Dashboard Summary
export const getSummary = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Summary(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};


export const getCustomerTrendController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await customerTrend(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCustomerSalesController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await customerSales(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCustomerQuantityController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await customerQuantity(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCustomerSummaryController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await customerSummary(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};




export const getMonthlySummaryController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await monthlySummary(whereClause, params);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getScrapAnalysisController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await scrap_Analysis(whereClause, params);
    res.json(data);
  } catch (err) {
    console.error('Error fetching scrap analysis:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getInventoryMovementController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Inventory_Movement(whereClause, params);
    res.json(data);
  } catch (err) {
    console.error('Error fetching inventory movement:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStockReportController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Stock_Report(whereClause, params);
    res.json(data);
  } catch (err) {
    console.error('Error fetching stock report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDeadStockController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Dead_Stock(whereClause, params);
    res.json(data);
  } catch (err) {
    console.error('Error fetching dead stock:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInventorySummaryCardsController = async (req, res) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await Inventory_SummaryCards(whereClause, params);
    res.json(data);
  } catch (err) {
    console.error('Error fetching inventory summary cards:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};