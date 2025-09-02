import { getCustomerAveragesService } from "../services/customerService.js";

export const getCustomerAverages = async (req, res) => {
  try {
    const data = await getCustomerAveragesService(req.query);
    res.json(data);
  } catch (err) {
    console.error("❌ Customer Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
