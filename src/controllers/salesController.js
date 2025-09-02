import { poolPromise } from "../config/db.js";
import { buildFilters } from "../utils/buildFilters.js";
import { getMonthlySales } from "../services/salesService.js";

export const getMonthlySalesController = async (req, res) => {
  try {
    const pool =  poolPromise;
    const request = pool.request();
    const filters = buildFilters(req.query, request);

    const result = await getMonthlySales(filters, request);
    res.json(result);
  } catch (err) {
    console.error("❌ Monthly Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
