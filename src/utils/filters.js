// src/utils/filters.js
import { sql } from '../config/db.js';

export const buildFilters = (query) => {
  const parts = ['1=1'];
  const params = {};

  const add = (key, clause, type, value) => {
    if (value !== undefined && value !== null && value !== '') {
      parts.push(clause);
      params[key] = { type, value };
    }
  };

  add('supplier',        'SUPPLIER = @supplier',        sql.VarChar, query.supplier);
  add('brand_code',      'BRAND_CODE = @brand_code',    sql.VarChar, query.brand_code);
  add('division_code',   'DIVISION_CODE = @division_code', sql.VarChar, query.division_code);
  add('type_code',       'TYPE_CODE = @type_code',      sql.VarChar, query.type_code);
  add('branch_code',     'BRANCH_CODE = @branch_code',  sql.VarChar, query.branch_code);
  add('fromDate',        'VOCDATE >= @fromDate',        sql.Date,    query.fromDate);
  add('toDate',          'VOCDATE <= @toDate',          sql.Date,    query.toDate);

  return {
    whereClause: parts.join(' AND '),
    params,
  };
};

export const bindParams = (request, params) => {
  Object.entries(params).forEach(([name, p]) => {
    request.input(name, p.type, p.value);
  });
  return request;
};
