import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const required = ["AWS_DB_SERVER", "AWS_DB_USER", "AWS_DB_PASSWORD", "AWS_DB_DATABASE"];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }
});
/*console.log("DEBUG DB ENV:", {
  server: process.env.LOCAL_DB_SERVER,
  user: process.env.LOCAL_DB_USER,
  database: process.env.LOCAL_DB_DATABASE,
  port: process.env.LOCAL_DB_PORT
});*/
// Determine environment (local or production)
const isProduction = process.env.NODE_ENV === "production"; 
let config;

// 🌐 AWS (SQL Authentication)
if (isProduction) {
  config = {
    user: process.env.AWS_DB_USER,
    password: process.env.AWS_DB_PASSWORD,
    server: process.env.AWS_DB_SERVER,
    database: process.env.AWS_DB_DATABASE,
    port: parseInt(process.env.AWS_DB_PORT) || 1433,
    options: {
      encrypt: true,                 // ✅ Required for RDS / cloud servers
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 120000,
    },
    requestTimeout: 240000,
  };
} else {
  // 💻 LOCAL (Windows Authentication)
  config = {
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASSWORD,
    server: process.env.LOCAL_DB_SERVER,
    database: process.env.LOCAL_DB_DATABASE,
    port: parseInt(process.env.LOCAL_DB_PORT) || 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 120000,
    },
    requestTimeout: 240000,
  };
}

let pool;

export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log(
        `✅ Connected to ${isProduction ? "AWS (SQL Auth)" : "Local (Windows Auth)"} SQL Server`
      );
    } catch (err) {
      console.error("❌ DB connection failed:", err);
      throw err;
    }
  }
  return pool;
}

export { sql };
