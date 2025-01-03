const moment = require("moment");
const path = require("path");
const validatorJs = require("../helpers/validator");
const ResponseGenerator = require("../helpers/response_generator");
const RequestManagerModel = require("../models/RequestManagerModel");
const ServiceCoverageModel = require("../models/ServiceCoverageModel");
const InvoiceModel = require("../models/InvoiceModel");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const RequestManagerController = {
  List: async (req, res) => {
    try {
      let { page, limit, filter } = req.body;

      let list = await RequestManagerModel.list(page, limit, filter);
      res.status(200).json(ResponseGenerator.Success("Operation Success", list));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Create: async (req, res) => {
    try {
      let {
        name,
        identity_card,
        district,
        sub,
        suco,
        aldeia,
        email,
        msisdn,
        msisdn_alternatif,
        product,
        initial_paket,
        visitation_schedule_date,
        visitation_schedule_time_slot,
      } = req.body;

      // Validate input
      let isValid = await validatorJs(req, res, RequestManagerModel.rules.create);
      if (!isValid) return;

      // Create request
      let request = await RequestManagerModel.create({
        name,
        identity_card,
        district,
        sub,
        suco,
        aldeia,
        email,
        msisdn,
        msisdn_alternatif,
        product,
        initial_paket,
        visitation_schedule_date,
        visitation_schedule_time_slot,
      });

      res.status(200).json(ResponseGenerator.Success("Request Created Successfully", request));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Detail: async (req, res) => {
    try {
      let { request_id } = req.body;

      let request = await RequestManagerModel.getById(request_id).then(({ rows }) => rows[0]);
      if (!request) throw "Request Not Found";

      res.status(200).json(ResponseGenerator.Success("Operation Success", request));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  VerifyCoverage: async (req, res) => {
    try {
      const { request_id } = req.body;

      if (!request_id) throw "Request ID is required";

      // Fetch request data
      const request = await RequestManagerModel.getById(request_id).then(({ rows }) => rows[0]);
      if (!request) throw "Request not found";

      const customerCoords = { lat: request.latitude, lon: request.longitude };

      // Fetch all plazas
      const plazas = await RequestManagerModel.getAllPlazas();
      if (!plazas || plazas.length === 0) throw "No plazas found";

      let isCovered = false;
      let nearestPlaza = null;
      let nearestDistance = Infinity;

      // Check distance to all plazas
      for (const plaza of plazas) {
        const plazaCoords = { lat: plaza.latitude, lon: plaza.longitude };
        const distance = ServiceCoverageModel.haversineDistance(customerCoords, plazaCoords);

        if (distance <= 5) {
          isCovered = true;
        }

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPlaza = plaza;
        }
      }

      res.status(200).json(
        ResponseGenerator.Success("Coverage Verification Complete", {
          isCovered,
          nearestPlaza,
          nearestDistance,
        })
      );
    } catch (error) {
      console.warn("Error in Verify Coverage:", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Approve: async (req, res) => {
    try {
      let {request_id} = req.body;

      let approveResult = await RequestManagerModel.approve(request_id);
      if (approveResult.rowCount === 0) throw "Approval Failed";

      let request = await RequestManagerModel.getById(request_id).then(({ rows }) => rows[0]);
      if (!request) throw "Request Not Found for Allocation";

      let allocation = await RequestManagerModel.allocateProducts(request_id);

      let client = await RequestManagerModel.clientData(request_id);

      res.status(200).json(ResponseGenerator.Success("Request Approved and Products Allocated", { allocation, client }));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Reject: async (req, res) => {
    try {
      const { request_id, reason } = req.body;
  
      if (!request_id) {
        throw "Request ID is required for rejection";
      }
  
      const rejectResult = await RequestManagerModel.reject(request_id, reason);
  
      res.status(200).json(
        ResponseGenerator.Success("Request Rejected Successfully", rejectResult)
      );
    } catch (error) {
      console.warn("Error in Reject Request:", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },  

  Allocate: async (req, res) => {
    try {
      let { request_id } = req.body;

      // Alokasikan produk
      let allocation = await RequestManagerModel.allocateProducts(request_id);

      res.status(200).json(ResponseGenerator.Success("Products Allocated Successfully", allocation));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  AssignSFPlaza: async (req, res) => {
    try {
      let { request_id, sf_plaza_id } = req.body;

      let assignResult = await RequestManagerModel.assignSFPlaza(request_id, sf_plaza_id);

      res.status(200).json(ResponseGenerator.Success(assignResult, "Assigned to SF Plaza Successfully"));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  ConfirmSchedule: async (req, res) => {
    try {
      const { request_id } = req.body;
  
      if (!request_id) {
        throw "Request ID is required";
      }
  
      const request = await RequestManagerModel.getById(request_id).then(({ rows }) => rows[0]);
      if (!request) {
        throw "Request not found";
      }
  
      if (!request.visitation_schedule_date || !request.visitation_schedule_time_slot) {
        throw "Visitation schedule is not set for this request";
      }
  
      const confirmResult = await RequestManagerModel.confirmSchedule(request_id);
  
      res.status(200).json(
        ResponseGenerator.Success(
          "Visitation Schedule Confirmed Successfully",
          confirmResult
        )
      );
    } catch (error) {
      console.warn("Error: ", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },  

  Reschedule: async (req, res) => {
    try {
      let { request_id, schedule_date, schedule_time_slot } = req.body;

      if (!request_id || !schedule_date || !schedule_time_slot) {
        throw "request_id, schedule_date, and schedule_time_slot are required for reschedule";
      }

      let rescheduleResult = await RequestManagerModel.reschedule(
        request_id,
        schedule_date,
        schedule_time_slot
      );

      if (rescheduleResult.rowCount === 0) throw "Reschedule Failed";

      res
        .status(200)
        .json(
          ResponseGenerator.Success(
            "Reschedule Success",
            rescheduleResult.rows[0] 
          )
        );
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Invoice: async (req, res) => {
    try {
      const { request_id, client_id, amount } = req.body;

      if ((!request_id && !client_id) || !amount) {
        return res
          .status(400)
          .json(ResponseGenerator.Error("request_id atau client_id dan amount diperlukan", {}));
      }

      const request = await RequestManagerModel.getById(request_id).then(({ rows }) => rows[0]);      
      if (!request) {
        return res
          .status(400)
          .json(ResponseGenerator.Error("Internet Request tidak ditemukan", {}));
      }

      if (request.status !== "SCHEDULED" && request.status !== "RESCHEDULED") {
        return res.status(400).json(
          ResponseGenerator.Error(
            "Invoice hanya dapat digenerate setelah status SCHEDULED atau RESCHEDULED",
            {}
          )
        );
      }

      const invoice = await InvoiceModel.createInvoice({ request_id, client_id, amount });

      const doc = new PDFDocument();

      const invoiceDir = path.join(__dirname, "..", "uploads", "invoices");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      const pdfPath = path.join(invoiceDir, `${invoice.invoice_number}.pdf`);

      const writeStream = fs.createWriteStream(pdfPath);
      doc.pipe(writeStream);

      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice Number: ${invoice.invoice_number}`);
      doc.text(`Request ID: ${request_id || "-"}`);
      doc.text(`Client ID: ${client_id || "-"}`);
      doc.text(`Amount: Rp ${invoice.amount.toFixed(2)}`);
      doc.text(`Status: ${invoice.status}`);
      doc.text(`Generated At: ${moment().format("YYYY-MM-DD HH:mm:ss")}`); 

      doc.end();

      writeStream.on("finish", () => {
        res.status(200).json(
          ResponseGenerator.Success("Invoice Generated with PDF Successfully", {
            invoice_number: invoice.invoice_number,
            amount: invoice.amount,
            status: invoice.status,
            pdfPath: pdfPath,
          })
        );
      });

      writeStream.on("error", (err) => {
        console.error("PDF WriteStream Error:", err);
        return res
          .status(500)
          .json(ResponseGenerator.Error("Gagal menulis PDF ke file", err));
      });
    } catch (error) {
      console.error("Generate Invoice with PDF Error:", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  CompleteInstallation: async (req, res) => {
    try {
      let { request_id } = req.body;

      if (!req.files || !req.files.proof_installation || !req.files.proof_payment) {
        throw "Proof installation and payment files are required";
      }

      let proofInstallationFile = req.files.proof_installation;
      let proofPaymentFile = req.files.proof_payment;

      const installationPath = path.join(__dirname, "..", "uploads", "proofs", `${Date.now()}_${proofInstallationFile.name}`);
      const paymentPath = path.join(__dirname, "..", "uploads", "proofs", `${Date.now()}_${proofPaymentFile.name}`);

      await proofInstallationFile.mv(installationPath);
      await proofPaymentFile.mv(paymentPath);

      let completeResult = await RequestManagerModel.completeInstallation(request_id, installationPath, paymentPath);

      res.status(200).json(ResponseGenerator.Success("Installation Completed Successfully", completeResult));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },

  Reallocate: async (req, res) => {
    try {
      let { request_id, reallocateType } = req.body;

      let reallocateResult = await RequestManagerModel.reallocateProducts(request_id, reallocateType);

      res.status(200).json(ResponseGenerator.Success(reallocateResult, "Reallocation Successful"));
    } catch (error) {
      console.warn("error :", error);
      res.status(400).json(ResponseGenerator.Error(error.toString(), error));
    }
  },
};

module.exports = RequestManagerController;
