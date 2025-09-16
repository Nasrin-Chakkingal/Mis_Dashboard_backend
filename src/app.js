import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';


import salesRoutes from "./routes/sales.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";

import notFound from "./middleware/notfound.js";
import errorHandler from "./middleware/errorhandler.js";


const app = express();

app.use(cors());
app.use(express.json());

// ✅ API routes
app.use("/api", salesRoutes);
app.use("/api", customerRoutes);
app.use("/api", filterRoutes);
app.use("/api", summaryRoutes);
app.use("/api", inventoryRoutes);



app.use(notFound);
app.use(errorHandler);

app.get("/healthz", (_, res) => res.send("ok"));



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../MIS_Dashboard/dist');
  app.use(express.static(frontendPath));
  app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendPath, '/index.html'));
});
}



export default app;
