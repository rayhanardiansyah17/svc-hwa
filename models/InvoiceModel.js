const moment = require("moment");
const mysqlHelpers = require("../helpers/mysql_helpers");
const db = require("../helpers/db_helpers");
const { nanoid } = require("nanoid");

const InvoiceModel = {
  createInvoice: async (data) => {
    try {
      const invoiceNumber = `INV-${moment().format("YYYYMMDD")}-${nanoid(6).toUpperCase()}`;

      const insertData = {
        invoice_number: invoiceNumber,
        request_id: data.request_id || null,
        client_id: data.client_id || null,
        amount: data.amount,
        status: "GENERATED",
        generated_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
      };

      const columns = Object.keys(insertData).join(", ");
      const placeholders = Object.keys(insertData).map(() => "?").join(", ");
      const values = Object.values(insertData);

      const query = `INSERT INTO hwa_invoices (${columns}) VALUES (${placeholders})`;

      let result = await mysqlHelpers.query(db, query, values);
      return {
        invoice_number: invoiceNumber,
        amount: data.amount,
        status: "GENERATED",
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = InvoiceModel;