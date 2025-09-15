import express from "express";
import cors from "cors";

import salesRoutes from "./routes/sales.routes.js";
// import other routes here...

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", salesRoutes);
// app.use("/api", customerRoutes);
// app.use("/api", supplierRoutes);

export default app;
