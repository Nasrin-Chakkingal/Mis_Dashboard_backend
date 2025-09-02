export const getMonthlySales = async (req, res) => {
  try {
    const data = await getMonthlySalesService(req.query);
    res.json(data);
  } catch (err) {
    console.error("❌ Monthly Sales Error:", err.message); // log error message
    console.error(err.stack); // log full stack trace
    res.status(500).json({ error: err.message }); // return actual error instead of generic
  }
};
