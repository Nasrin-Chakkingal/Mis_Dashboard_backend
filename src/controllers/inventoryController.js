import { getStockSummaryService } from "../services/inventoryService.js";

export const getStockSummary = async (req, res) => {
  try {
    const data = await getStockSummaryService(req.query);
    res.json(data);
  } catch (err) {
    console.error("❌ Inventory Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
