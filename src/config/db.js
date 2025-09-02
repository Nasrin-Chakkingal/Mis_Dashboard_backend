import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: true, trustServerCertificate: true },
  requestTimeout: 240000,
  pool: { max: 10, min: 0, idleTimeoutMillis: 120000 },
};

let pool;

export const connectDB = async () => {
  try {
    pool = await sql.connect(config);
    if (pool.connected) console.log("✅ Connected to SQL Server");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

export const getPool = () => pool;
export { sql };
