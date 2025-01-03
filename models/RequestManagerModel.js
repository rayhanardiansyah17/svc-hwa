const moment = require("moment");
const path = require("path");
const PDFDocument = require("pdfkit");
const mysqlHelpers = require("../helpers/mysql_helpers");
const db = require("../helpers/db_helpers");
const paginationHelper = require("../helpers/pagination_helper");
const ProductAllocationModel = require("../models/ProductAllocationModel");
const { nanoid } = require("nanoid");

const RequestManagerModel = {
  rules: {
    create: {
      name: "required",
      identity_card: "required",
      district: "required",
      sub: "required",
      suco: "required",
      aldeia: "required",
      email: "required|email",
      msisdn: "required",
      product: "required|in:GPON,HWA",
      initial_paket: "required",
      visitation_schedule_date: "required|date",
      visitation_schedule_time_slot: "required|in:09:00-12:00,12:00-15:00,15:00-18:00",
    },
  },

  list: (page = 1, pageSize = 10, filter = null) => {
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
            queryFilter.push(`date(ir.created_at) BETWEEN '${startDate}' AND '${endDate}'`);
          }

          if (queryFilter.length !== 0) {
            queryFilter = `WHERE ${queryFilter.join(" AND ")}`;
          }
        }

        let query = `
          SELECT 
            ir.*, 
            pl.name as sf_plaza_name
          FROM 
            hwa_requests ir
          LEFT JOIN 
            plaza pl ON ir.sf_plaza_id = pl.id
          ${queryFilter}
          ORDER BY ir.id DESC
        `;

        let queryCount = `
          SELECT COUNT(*) as total 
          FROM hwa_requests ir 
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

  create: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Auto-generate REQUEST_ID
        const requestId = `REQ-${moment().format("YYYYMMDD")}-${nanoid(6).toUpperCase()}`;

        const insertData = {
          request_id: requestId,
          name: data.name,
          identity_card: data.identity_card,
          district: data.district,
          sub: data.sub,
          suco: data.suco,
          aldeia: data.aldeia,
          email: data.email,
          msisdn: data.msisdn,
          msisdn_alternatif: data.msisdn_alternatif || null,
          product: data.product,
          initial_paket: data.initial_paket,
          visitation_schedule_date: data.visitation_schedule_date,
          visitation_schedule_time_slot: data.visitation_schedule_time_slot,
          status: "PENDING",
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        const columns = Object.keys(insertData).join(", ");
        const placeholders = Object.keys(insertData).map(() => "?").join(", ");
        const values = Object.values(insertData);

        const query = `INSERT INTO hwa_requests (${columns}) VALUES (${placeholders})`;

        let result = await mysqlHelpers.query(db, query, values);
        resolve({
          rowCount: result.affectedRows,
          rows: [{ request_id: requestId }],
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  reject: async (requestId, reason) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = {
          status: "REJECTED",
          rejection_reason: reason || null, // Menyimpan alasan penolakan jika diberikan
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
  
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(requestId);
  
        const query = `UPDATE hwa_requests SET ${columns} WHERE request_id = ?`;
  
        const result = await mysqlHelpers.query(db, query, values);
  
        if (result.affectedRows === 0) {
          throw new Error("Request not found or already rejected");
        }
  
        resolve({
          rowCount: result.affectedRows,
          message: "Request status updated to REJECTED",
        });
      } catch (error) {
        reject(error);
      }
    });
  },  

  getById: (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `
           SELECT 
            ir.*, 
            pl.name as sf_plaza_name,
            hpa.modem_sn,
            hpa.sim_sn,
            hpa.package_id
          FROM 
            hwa_requests ir
          LEFT JOIN 
            plaza pl ON ir.sf_plaza_id = pl.id
          LEFT JOIN 
            hwa_product_allocations hpa ON hpa.request_id = ir.request_id
          WHERE 
            ir.request_id = ?
        `;

        let result = await mysqlHelpers.query(db, query, [requestId]);
        resolve({
          rowCount: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  getAllPlazas: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = `SELECT * FROM plaza`;
        const result = await mysqlHelpers.query(db, query);
  
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },  

  approve: (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = {
          status: "APPROVED",
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(requestId);

        const query = `UPDATE hwa_requests SET ${columns} WHERE request_id = ?`;

        let result = await mysqlHelpers.query(db, query, values);
        resolve({
          rowCount: result.affectedRows,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  reject: (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const updateData = {
          status: "REJECTED",
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(requestId);

        const query = `UPDATE hwa_requests SET ${columns} WHERE request_id = ?`;

        let result = await mysqlHelpers.query(db, query, values);
        resolve({
          rowCount: result.affectedRows,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  allocateProducts: async (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const requestQuery = `
          SELECT * FROM hwa_requests WHERE request_id = ?
        `;
        const requestResult = await mysqlHelpers.query(db, requestQuery, [requestId]);
        if (requestResult.length === 0) {
          throw "Request Not Found";
        }
        const request = requestResult[0];
  
        const modem = await ProductAllocationModel.getAvailableDevice("Mifi");
        if (!modem) {
          throw "No Available Mifi";
        }
  
        const simcard = await ProductAllocationModel.getAvailableSimcard();
        if (!simcard) {
          throw "No Available Simcard";
        }
  
        const package = await ProductAllocationModel.getPackageById(request.initial_paket);
        if (!package) {
          throw "Package Not Found";
        }

        await ProductAllocationModel.updateDeviceStatus(modem.id, "SOLD", requestId);
  
        await ProductAllocationModel.updateSimcardStatus(simcard.id, "SOLD", requestId);
  
        const allocationData = {
          request_id: requestId,
          modem_sn: modem.serial_number,
          sim_sn: simcard.iccid,
          package_id: package.id,
          allocated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        const columns = Object.keys(allocationData).join(", ");
        const placeholders = Object.keys(allocationData).map(() => "?").join(", ");
        const values = Object.values(allocationData);
        const allocationQuery = `INSERT INTO hwa_product_allocations (${columns}) VALUES (${placeholders})`;
        await mysqlHelpers.query(db, allocationQuery, values);
  
        const updateStatusQuery = `
          UPDATE hwa_requests 
          SET status = 'ALLOCATED', updated_at = ?
          WHERE request_id = ?
        `;
        await mysqlHelpers.query(db, updateStatusQuery, [
          moment().format("YYYY-MM-DD HH:mm:ss"),
          requestId,
        ]);
  
        resolve({
          modem_sn: modem.serial_number,
          sim_sn: simcard.iccid,
          package_id: package.id,
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  

  clientData: async (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const requestQuery = `
          SELECT * FROM hwa_requests WHERE request_id = ?
        `;
        const requestResult = await mysqlHelpers.query(db, requestQuery, [requestId]);
        if (requestResult.length === 0) throw "Request Not Found";

        const request = requestResult[0];

        const clientData = {
          request_id: request.request_id,
          client_id: `CLT-${moment().format("YYYYMMDD")}-${nanoid(6).toUpperCase()}`,
          name: request.name,
          identity_card: request.identity_card,
          district: request.district,
          sub: request.sub,
          suco: request.suco,
          aldeia: request.aldeia,
          email: request.email,
          msisdn: request.msisdn,
          msisdn_alternatif: request.msisdn_alternatif,
          product: request.product,
          initial_paket: request.initial_paket,
          status: "INACTIVE",
          termination_date: null,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };

        const columns = Object.keys(clientData).join(", ");
        const placeholders = Object.keys(clientData).map(() => "?").join(", ");
        const values = Object.values(clientData);

        const clientQuery = `INSERT INTO hwa_clients (${columns}) VALUES (${placeholders})`;

        await mysqlHelpers.query(db, clientQuery, values);

        resolve("Client Created Successfully");
      } catch (error) {
        reject(error);
      }
    });
  },

  assignSFPlaza: async (requestId, sfPlazaId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const allocationQuery = `
          SELECT * FROM hwa_product_allocations WHERE request_id = ?
        `;
        const allocationResult = await mysqlHelpers.query(db, allocationQuery, [requestId]);
        if (allocationResult.length === 0) throw "Products Not Allocated";

        const assignQuery = `
          UPDATE hwa_requests 
          SET sf_plaza_id = ?, status = 'ASSIGNED', updated_at = ?
          WHERE request_id = ?
        `;
        await mysqlHelpers.query(db, assignQuery, [sfPlazaId, moment().format("YYYY-MM-DD HH:mm:ss"), requestId]);

        resolve("Assigned to SF Plaza Successfully");
      } catch (error) {
        reject(error);
      }
    });
  },

  confirmSchedule: async (requestId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const requestQuery = `
          SELECT * FROM hwa_requests 
          WHERE request_id = ? AND status = 'ASSIGNED'
        `;
        const requestResult = await mysql_helpers.query(db, requestQuery, [requestId]);
        if (requestResult.length === 0) {
          throw "Request not assigned or not found";
        }
  
        const confirmQuery = `
          UPDATE hwa_requests 
          SET visitation_schedule_confirmed = 1, 
              status = 'SCHEDULED', 
              updated_at = ?
          WHERE request_id = ?
        `;
        await mysql_helpers.query(db, confirmQuery, [
          moment().format("YYYY-MM-DD HH:mm:ss"),
          requestId,
        ]);
  
        resolve("Visitation Schedule Confirmed Successfully");
      } catch (error) {
        reject(error);
      }
    });
  },  

  reschedule: (requestId, newDate, newTimeSlot) => {
    return new Promise(async (resolve, reject) => {
      try {
        const requestQuery = `
          SELECT * FROM hwa_requests 
          WHERE request_id = ?
        `;
        let [request] = await mysqlHelpers.query(db, requestQuery, [requestId]);
        if (!request) {
          throw "Request Not Found";
        }
  
        if (request.status !== "SCHEDULED") {
          throw "Reschedule only allowed if status is SCHEDULED";
        }
  
        const updateData = {
          visitation_schedule_date: newDate,
          visitation_schedule_time_slot: newTimeSlot,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          status: "RESCHEDULED",
        };
  
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(requestId);
  
        const updateQuery = `UPDATE hwa_requests SET ${columns} WHERE request_id = ?`;
        await mysqlHelpers.query(db, updateQuery, values);
  
        const updatedRequest = await mysqlHelpers.query(db, requestQuery, [requestId]);
  
        resolve({
          rowCount: 1,
          rows: updatedRequest, 
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  completeInstallation: async (requestId, proofInstallation, proofPayment) => {
    return new Promise(async (resolve, reject) => {
      try {
        const scheduleQuery = `
          SELECT * FROM hwa_requests WHERE request_id = ? AND visitation_schedule_confirmed = 1
        `;
        const scheduleResult = await mysqlHelpers.query(db, scheduleQuery, [requestId]);
        if (scheduleResult.length === 0) throw "Visitation Schedule Not Confirmed";

        const updateProofQuery = `
          UPDATE hwa_requests 
          SET proof_installation = ?, 
              proof_payment = ?, 
              status = 'SUCCESS', 
              updated_at = ?
          WHERE request_id = ?
        `;
        await mysqlHelpers.query(db, updateProofQuery, [
          proofInstallation,
          proofPayment,
          moment().format("YYYY-MM-DD HH:mm:ss"),
          requestId,
        ]);

        const updateClientStatusQuery = `
        UPDATE hwa_clients
        SET status = 'ACTIVE', updated_at = ?
        WHERE request_id = ?
      `;
      await mysqlHelpers.query(db, updateClientStatusQuery, [
        moment().format("YYYY-MM-DD HH:mm:ss"),
        requestId,
      ]);

      resolve("Installation Completed and Client Activated");
    } catch (error) {
      reject(error);
    }
    });
  },

  reallocateProducts: async (requestId, reallocateType) => {
    return new Promise(async (resolve, reject) => {
      try {
        const allocationQuery = `
          SELECT * FROM hwa_product_allocations WHERE request_id = ?
        `;
        const allocationResult = await mysqlHelpers.query(db, allocationQuery, [requestId]);
        if (allocationResult.length === 0) throw "No Allocation Found";

        const allocation = allocationResult[0];

        const modem = await ProductAllocationModel.getAvailableDevice("Mifi");
        if (!modem && (reallocateType === "Mifi" || reallocateType === "both")) {
          throw "No Available Mifi";
        }

        const simcard = await ProductAllocationModel.getAvailableSimcard();
        if (!simcard && (reallocateType === "Simcard" || reallocateType === "both")) {
          throw "No Available Simcard";
        }
        
        if (reallocateType === "Mifi" || reallocateType === "both") {
          await this.updateDeviceStatusBySN(allocation.modem_sn, "UNAVAILABLE", null);
        }
  
        if (reallocateType === "Simcard" || reallocateType === "both") {
          await this.updateSimcardStatusBySN(allocation.sim_sn, "UNAVAILABLE", null);
        }

        const deleteQuery = `
          DELETE FROM hwa_product_allocations WHERE request_id = ?
        `;
        await mysqlHelpers.query(db, deleteQuery, [requestId]);

        await RequestManagerModel.allocateProducts(requestId);

        resolve("Reallocation Successful");
      } catch (error) {
        reject(error);
      }
    });
  },

  updateDeviceStatusBySN: async (serialNumber, status, purchaseOrderCode) => {
    const updateData = {
      status: status,
      purchase_order_code: purchaseOrderCode,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(serialNumber);

    const query = `UPDATE devices SET ${columns} WHERE serial_number = ?`;

    return await mysqlHelpers.query(db, query, values);
  },

  updateSimcardStatusBySN: async (simSn, status, purchaseOrderCode) => {
    const updateData = {
      status: status,
      sbp_po_code: purchaseOrderCode,
      updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updateData);
    values.push(simSn);

    const query = `UPDATE simcard SET ${columns} WHERE iccid = ?`;

    return await mysqlHelpers.query(db, query, values);
  },
};

module.exports = RequestManagerModel;
