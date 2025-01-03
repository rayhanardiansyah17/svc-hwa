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
    
      updateDeviceStatus: async (deviceId, status, purchaseOrderCode) => {
        const updateData = {
          status: status,
          sbp_po_code: purchaseOrderCode,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(deviceId);
    
        const query = `UPDATE devices SET ${columns} WHERE id = ?`;
    
        return await mysqlHelpers.query(db, query, values);
      },
    
      getAvailableSimcard: async () => {
        const query = `
          SELECT * FROM simcards
          WHERE status = 'AVAILABLE' 
          LIMIT 1
        `;
        let result = await mysqlHelpers.query(db, query);
        return result.length > 0 ? result[0] : null;
      },
    
      updateSimcardStatus: async (simcardId, status, purchaseOrderCode) => {
        const updateData = {
          status: status,
          sbp_po_code: purchaseOrderCode,
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
    
        const columns = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
        const values = Object.values(updateData);
        values.push(simcardId);
    
        const query = `UPDATE simcards SET ${columns} WHERE id = ?`;
    
        return await mysqlHelpers.query(db, query, values);
      },
    
      getPackageById: async (packageId) => {
        const query = `
          SELECT * FROM products 
          WHERE id = ? AND product_type = 'Package'
        `;
        let result = await mysqlHelpers.query(db, query, [packageId]);
        return result.length > 0 ? result[0] : null;
      }
};

module.exports = ProductAllocation;