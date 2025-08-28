


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
  Summary 
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
