import { buildFilters } from '../utils/filters.js';
import { monthlySummary,
  scrap_Analysis,
  Inventory_Movement,
  Stock_Report,
  Dead_Stock,
} from '../services/inventory.service.js';


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