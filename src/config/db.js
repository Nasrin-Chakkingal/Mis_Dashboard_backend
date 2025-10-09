import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();
// Select the right config based on environment
console.log("✅ ENV SERVER:", process.env.LOCAL_DB_SERVER);

const isProduction = process.env.NODE_ENV === "production";

const config = {
  user: isProduction ? process.env.AWS_DB_USER : process.env.LOCAL_DB_USER,
  password: isProduction ? process.env.AWS_DB_PASSWORD : process.env.LOCAL_DB_PASSWORD,
  server: isProduction ? process.env.AWS_DB_SERVER : process.env.LOCAL_DB_SERVER,
  database: isProduction ? process.env.AWS_DB_DATABASE : process.env.LOCAL_DB_DATABASE,
  port: parseInt(isProduction ? process.env.AWS_DB_PORT : process.env.LOCAL_DB_PORT) || 1433,
  options: {
    encrypt: isProduction, // encrypt AWS connection, not local
    trustServerCertificate: !isProduction, // trust local certificate
  },
  requestTimeout: 240000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 120000,
  },
};

let pool;

export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log(`✅ Connected to ${isProduction ? "AWS" : "local"} SQL Server:`, config.server);
    } catch (err) {
      console.error("❌ DB connection failed:", err);
      throw err;
    }
  }
  return pool;
}

export { sql };
