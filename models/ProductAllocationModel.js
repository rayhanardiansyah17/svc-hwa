const moment = require("moment");
const mysqlHelpers = require("../helpers/mysql_helpers");
const db = require("../helpers/db_helpers");

const ProductAllocation = {
    getAvailableDevice: async (deviceType) => {
        const query = `
          SELECT * FROM devices 
          WHERE device_type = ? AND status = 'AVAILABLE' 
          LIMIT 1
        `;
        let result = await mysqlHelpers.query(db, query, [deviceType]);
        return result.length > 0 ? result[0] : null;
      },
    
      updateDeviceStatus: async (deviceId, status) => {
        const updateData = {
          status: status,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(deviceId);
    
        const query = `UPDATE devices SET ${columns} WHERE id = ?`;
    
        return await mysqlHelpers.query(db, query, values);
      },
    
      getAvailableSimcard: async (simcardParent) => {
        const query = `
          SELECT s.* 
          FROM simcards s
          JOIN products p ON p.product_type = s.type
          WHERE p.identifier = ? 
          AND s.type = 'REGULER' 
          AND s.status = 'AVAILABLE' 
          LIMIT 1;
        `;
        let result = await mysqlHelpers.query(db, query, [simcardParent]);
        return result.length > 0 ? result[0] : null;
      },
    
      updateSimcardStatus: async (simcardId, status) => {
        const updateData = {
          status: status,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(simcardId);
    
        const query = `UPDATE simcards SET ${columns} WHERE id = ?`;
    
        return await mysqlHelpers.query(db, query, values);
      },
    
      getPackageById: async (refillId) => {
        const query = `
          SELECT * FROM hwa_packages 
          WHERE refill_id = ?
        `;
        let result = await mysqlHelpers.query(db, query, [refillId]);
        return result.length > 0 ? result[0] : null;
      },

      getInternetPackageByInternetParent: async (internetParent) => {
        const query = `
          SELECT v.code
          FROM vas_product_items v
          JOIN hwa_packages p ON p.internet_parent = v.refill_id
          WHERE p.internet_parent = ?
        `;
        
        let result = await mysqlHelpers.query(db, query, [internetParent]);
      
        return result.length > 0 ? result[0].code : null;
      },
      updateDeviceStatusBySN: async (serialNumber, status, purchaseOrderCode) => {
        const updateData = {
          status: status,
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
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(simSn);
    
        const query = `UPDATE simcards SET ${columns} WHERE iccid = ?`;
    
        return await mysqlHelpers.query(db, query, values);
      }
};

module.exports = ProductAllocation;