// src/controllers/sales.controller.js
import { buildFilters } from './utils/filters.js';
import {
  monthlySales,
  avgSellingPrice,
  topBrands,
  agebucketWiseSales,
  // add additional services you create
} from '../services/sales.service.js';

export const getMonthlySales = async (req, res, next) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const result = await monthlySales(whereClause, params);
    res.json(result);
  } catch (err) { next(err); }
};

export const getAvgSellingPrice = async (req, res, next) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await avgSellingPrice(whereClause, params);
    res.json({ data });
  } catch (err) { next(err); }
};

export const getTopBrands = async (req, res, next) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await topBrands(whereClause, params);
    res.json({ data });
  } catch (err) { next(err); }
};

export const getAgebucketWiseSales = async (req, res, next) => {
  try {
    const { whereClause, params } = buildFilters(req.query);
    const data = await agebucketWiseSales(whereClause, params);
    res.json({ data });
  } catch (err) { next(err); }
};

// 👉 Add the rest: customer trend, qty sold, summary, etc., each calling their service.
