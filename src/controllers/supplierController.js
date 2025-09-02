import { getSupplierSalesService } from "../services/supplierService.js";

export const getSupplierSales = async (req, res) => {
  try {
    const data = await getSupplierSalesService(req.query);
    res.json(data);
  } catch (err) {
    console.error("❌ Supplier Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
