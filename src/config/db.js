import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  requestTimeout: 240000,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 120000,
  },
};

export const poolPromise = sql.connect(config);
export { sql };
