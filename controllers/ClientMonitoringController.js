const ResponseGenerator = require("../helpers/response_generator")
const ClientMonitoringModel = require("../models/ClientMonitoringModel")

const ClientMonitoringController = {
    List: async (req, res) => {
		try {
			let { page, limit, client_id, msisdn, status, termination_date } = req.body
			let data = await ClientMonitoringModel.List(page, limit, client_id, msisdn, status, termination_date)
			res.status(200).json(ResponseGenerator.Success("Operation Success", data))
		} catch (error) {
			console.warn("error :", error)
			res.status(400).json(ResponseGenerator.Error(error.toString(), error))
		}
	},
    ListExport: async (req, res) => {
        try {
            let { client_id = "", msisdn = "", status = "", termination_date = "" } = req.body;

            let filter = [];

            if (client_id) {
                filter.push({ key: "client_id", value: client_id });
            }

            if (msisdn) {
                filter.push({ key: "msisdn", value: msisdn });
            }

            if (status) {
                filter.push({ key: "status", value: `%${status}%`, operator: "LIKE" });
            }

            if (termination_date) {
                filter.push({ key: "termination_date", value: `%${termination_date}%`, operator: "LIKE" });
            }

            let data = await ClientMonitoringModel.ListExport(filter).then(({ rows }) => rows);

            let csv = `Client ID,MSISDN,Status,Termination Date\n`;

            for (let record of data) {
                let row = [
                    record.client_id,
                    record.msisdn,
                    record.status,
                    record.termination_date,
                ];
                csv += `${row.join(",")}\n`;
            }

            let fileName = `Export-${Date.now()}.csv`;

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.send(csv);
        } catch (error) {
            console.error("Error:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    },

    EditClient: async (req, res) => {
      try {
        const { client_id, ...data } = req.body;
        if (!client_id) throw "Client ID is required";
  
        const result = await ClientMonitoringModel.Edit(client_id, data);
        res.status(200).json(ResponseGenerator.Success("Client data updated successfully", result));
      } catch (error) {
        console.error("Error:", error);
        res.status(400).json(ResponseGenerator.Error(error.toString(), error));
      }
    },

    Detail: async (req, res) => {
      try {
        let { client_id } = req.body;
  
        let request = await ClientMonitoringModel.getById(client_id).then(({ rows }) => rows[0]);
        if (!request) throw "Request Not Found";
  
        res.status(200).json(ResponseGenerator.Success("Operation Success", request));
      } catch (error) {
        console.warn("error :", error);
        res.status(400).json(ResponseGenerator.Error(error.toString(), error));
      }
    },

    MonitorClient: async (req, res) => {
        try {
          let { client_id } = req.body;
    
          const clientQuery = `
            SELECT 
              hc.client_id,
              hc.allocated_modem_sn,
              hc.msisdn,
              hc.status,
              hc.allocated_package,
              hc.termination_date,
              p.product_name as active_package
            FROM 
              hwa_clients hc
            LEFT JOIN 
              products p ON hc.allocated_package = p.id
            WHERE 
              hc.client_id = ?
          `;
          let clientResult = await mysqlHelpers.query(db, clientQuery, [client_id]);
          if (clientResult.length === 0) throw "Client Not Found";
    
          const client = clientResult[0];
    
          res.status(200).json(ResponseGenerator.Success("Operation Success", client));
        } catch (error) {
          console.warn("error :", error);
          res.status(400).json(ResponseGenerator.Error(error.toString(), error));
        }
      },
}

module.exports = ClientMonitoringController;