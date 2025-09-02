import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./src/routes/indexRoutes.js";
import { poolPromise } from "./src/config/db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Attach all routes
app.use("/api", routes);

poolPromise.then(pool => {
  if (pool.connected) {
    console.log("✅ Connected to SQL Server");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  }
}).catch(err => {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
});
