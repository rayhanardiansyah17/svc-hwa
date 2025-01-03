const moment = require("moment");
const mysqlHelpers = require("../helpers/mysql_helpers");
const db = require("../helpers/db_helpers");
const { nanoid } = require("nanoid");
const paginationHelper = require("../helpers/pagination_helper");

const ClientMonitoringModel = {
  List: (page = 1, pageSize = 10, filter = null) => {
    return new Promise(async (resolve, reject) => {
      try {
        const offset = (page - 1) * pageSize;

        let queryFilter = [];
        let startDate = null;
        let endDate = null;

        if (filter) {
          for (let _filter of filter) {
            if (_filter.value !== "") {
              if (_filter.key === "start_date") {
                startDate = _filter.value;
              } else if (_filter.key === "end_date") {
                endDate = _filter.value;
              } else {
                queryFilter.push(`${_filter.key} = '${_filter.value}'`);
              }
            }
          }

          if (startDate && endDate) {
            queryFilter.push(`date(hc.created_at) BETWEEN '${startDate}' AND '${endDate}'`);
          }

          if (queryFilter.length !== 0) {
            queryFilter = `WHERE ${queryFilter.join(" AND ")}`;
          }
        }

        let query = `
          SELECT 
            hc.*, 
          FROM 
            hwa_clients hc
          LEFT JOIN 
          ${queryFilter}
          ORDER BY hc.id DESC
        `;

        let queryCount = `
          SELECT COUNT(*) as total 
          FROM hwa_clients hc 
          ${queryFilter}
        `;

        query += ` LIMIT ${pageSize} OFFSET ${offset}`;

        let result = await mysqlHelpers.query(db, query);
        let countResult = await mysqlHelpers.query(db, queryCount);
        let pagination = await paginationHelper(countResult[0].total, page, pageSize, result);

        resolve(pagination);
      } catch (error) {
        reject(error);
      }
    });
  },

  ListExport: (filter) => {
    return new Promise(async (resolve, reject) => {
      try {
        let queryFilter = "";
        if (filter) {
          queryFilter = [];
          for (let _filter of filter) {
            if (_filter.value != "") {
              if (_filter.operator && _filter.operator.toUpperCase() === "LIKE") {
                queryFilter.push(`${_filter.key} LIKE '${_filter.value}'`);
              } else {
                queryFilter.push(`${_filter.key} = '${_filter.value}'`);
              }
            }
          }
  
          if (queryFilter.length != 0) {
            queryFilter = `WHERE ${queryFilter.join(" AND ")}`;
          }
        }
  
        let query = `
          SELECT 
            hc.client_id, 
            hc.msisdn, 
            hc.status, 
            hc.termination_date 
          FROM 
            hwa_clients hc 
          ${queryFilter}
        `;
  
        let result = await mysqlHelpers.query(db, query);
        resolve({
          rowCount: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  getById: (clientId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `
          SELECT 
            hc.*, 
            hpa.modem_sn,
            hpa.sim_sn,
            hpa.package_id 
          FROM 
            hwa_clients hc 
          LEFT JOIN 
            hwa_product_allocations hpa ON hpa.request_id = hc.request_id 
          WHERE 
            hc.client_id = ?
        `;
  
        let result = await mysqlHelpers.query(db, query, [clientId]);
        resolve({
          rowCount: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  Edit: (clientId, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const allowedColumns = [
          "district",
          "sub",
          "suco",
          "aldeia",
          "email",
          "msisdn",
          "msisdn_alternatif",
          "status",
          "termination_date"
        ];
  
        const updates = Object.keys(data)
          .filter((key) => allowedColumns.includes(key))
          .map((key) => `${key} = ?`);
  
        if (updates.length === 0) {
          throw "No valid fields to update";
        }
  
        const query = `
          UPDATE hwa_clients 
          SET ${updates.join(", ")} 
          WHERE client_id = ?
        `;
  
        const values = [...Object.values(data).filter((_, index) => allowedColumns.includes(Object.keys(data)[index])), clientId];
  
        await mysqlHelpers.query(db, query, values);
        resolve({ success: true });
      } catch (error) {
        reject(error);
      }
    });
  },  

  getClientHistory: (clientId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `
          SELECT 
            cs.*, 
            p.product_name, 
            cs.purchase_date
          FROM 
            client_subscriptions cs
          LEFT JOIN 
            products p ON cs.package_id = p.id
          WHERE 
            cs.client_id = ?
          ORDER BY cs.purchase_date DESC
        `;

        let result = await mysqlHelpers.query(db, query, [clientId]);
        resolve({
          rowCount: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = ClientMonitoringModel;
