// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// ✅ FIXED paths
import routes from "./src/routes/index.js";
import notFound from "./src/middleware/notFound.js";
import errorHandler from "./src/middleware/errorHandler.js";
import "./src/config/db.js"; // initializes pool

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Healthcheck (for Render monitoring)
app.get("/healthz", (_, res) => res.send("ok"));

// ✅ Mount all routes under /api
app.use("/api", routes);

// Middleware
app.use(notFound);     // 404 handler
app.use(errorHandler); // error handler

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
