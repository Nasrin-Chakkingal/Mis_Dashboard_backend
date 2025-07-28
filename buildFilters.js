// utils/buildFilters.js
import sql from "mssql";

export function buildFilters(queryParams, request) {
  const conditions = ["1=1"]; // always true to simplify appending ANDs

  if (queryParams.supplier) {
    conditions.push("SUPPLIER = @supplier");
    request.input("supplier", sql.VarChar, queryParams.supplier);
  }
  if (queryParams.brand_code) {
    conditions.push("BRAND_CODE = @brand_code");
    request.input("brand_code", sql.VarChar, queryParams.brand_code);
  }
  if (queryParams.division_code) {
    conditions.push("DIVISION_CODE = @division_code");
    request.input("division_code", sql.VarChar, queryParams.division_code);
  }
  if (queryParams.type_code) {
    conditions.push("TYPE_CODE = @type_code");
    request.input("type_code", sql.VarChar, queryParams.type_code);
  }
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
