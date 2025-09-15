import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

import notFound from "./middleware/notfound.js"; 
import errorHandler from "./middleware/errorhandler.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api", salesRoutes);
app.use("/api", customerRoutes);
app.use("/api", filterRoutes);
app.use("/api", summaryRoutes);
app.use("/api", inventoryRoutes);

// ✅ Serve React build
const distPath = path.join(__dirname, "../dist");  // adjust if needed
app.use(express.static(distPath));

// ✅ Catch-all for React Router
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
// ✅ Error handling should always be last
app.use(notFound);
app.use(errorHandler);

export default app;
