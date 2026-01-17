import sql from "mssql";

export function buildFilters(query, request) {
  const conditions = [];

  const filterMap = {
    supplier: "SUPPLIER",
    brand_code: "BRAND_CODE",
    division_code: "DIVISION_CODE",
    type_code: "TYPE_CODE",
    branch_code: "BRANCH_CODE",
  };

  for (const key in filterMap) {
    if (query[key]) {
      // convert "A,B,C" → ["A","B","C"]
      const values = Array.isArray(query[key])
        ? query[key]
        : query[key].split(",");

      const params = values.map((_, i) => `@${key}${i}`);
      conditions.push(`${filterMap[key]} IN (${params.join(",")})`);

      values.forEach((val, i) => {
        request.input(`${key}${i}`, sql.VarChar, val.trim());
      });
    }
  }

  // Date filters
  if (query.fromDate) {
    conditions.push("VOCDATE >= @fromDate");
    request.input("fromDate", sql.Date, query.fromDate);
  }

  if (query.toDate) {
    conditions.push("VOCDATE <= @toDate");
    request.input("toDate", sql.Date, query.toDate);
  }

  return conditions.length ? conditions.join(" AND ") : "1=1";
}
