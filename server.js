// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import routes from "./src/routes/index.routes.js";
import notFound from "./src/middleware/notfound.js";


import "./src/config/db.js"; // initializes pool
import errorHandler from "./src/middleware/errorHandler.js";


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Healthcheck (for Render monitoring)
app.get("/healthz", (_, res) => res.send("ok"));

// ✅ Mount all routes under /api
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
