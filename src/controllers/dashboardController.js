import { getMonthlySalesService } from "../services/dashboardService.js";

export const getMonthlySales = async (req, res) => {
  try {
    const data = await getMonthlySalesService(req.query);
    res.json(data);
  } catch (err) {
    console.error("❌ Monthly Sales Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
