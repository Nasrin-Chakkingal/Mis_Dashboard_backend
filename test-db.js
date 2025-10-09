import { getPool } from "./src/config/db.js";

const testConnection = async () => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT TOP 1 * FROM INFORMATION_SCHEMA.TABLES");
    console.log("✅ Database connected successfully!");
    console.log("Sample table name:", result.recordset[0]?.TABLE_NAME);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
};

testConnection();
