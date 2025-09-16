import express from "express";
import cors from "cors";


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


export default app;
