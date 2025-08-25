import { buildFilters } from '../utils/filters.js';
import { 
  customerTrend,
  customerSales,
  customerQuantity,
  customerSummary
} from '../services/customer.service.js';

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
