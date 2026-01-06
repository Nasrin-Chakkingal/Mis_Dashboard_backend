import { sql } from "../config/db.js";

export function buildFilters(queryParams, request) {
  const conditions = ["1=1"];

  // Map frontend keys to DB columns
  const filterMap = {
    supplier: "SUPPLIER",
    brand_code: "BRAND_CODE",
    division_code: "DIVISION_CODE",
    type_code: "TYPE_CODE",
    branch_code: "BRANCH_CODE",
  };

  // 🔁 Handle multi-select filters
  for (const key in filterMap) {
    const column = filterMap[key];
    const values = queryParams[key];

    if (Array.isArray(values) && values.length > 0) {
      const placeholders = values.map((_, i) => `@${key}${i}`);

      conditions.push(`${column} IN (${placeholders.join(", ")})`);

      values.forEach((obj, i) => {
        request.input(`${key}${i}`, sql.VarChar, obj.value);
      });
    }
  }

  // 📅 Date filters
  if (queryParams.fromDate) {
    conditions.push("VOCDATE >= @fromDate");
    request.input("fromDate", sql.Date, queryParams.fromDate);
  }

  if (queryParams.toDate) {
    conditions.push("VOCDATE <= @toDate");
    request.input("toDate", sql.Date, queryParams.toDate);
  }

  return conditions.join(" AND ");
}
