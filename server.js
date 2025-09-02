import dotenv from "dotenv";
import express from "express";
import cors from "cors";


// Routes
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import supplierRoutes from "./src/routes/supplierRoutes.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DB Connection
connectDB;

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
