const RequestManagerController = require("../controllers/RequestManagerController");
const ClientMonitoringController = require("../controllers/ClientMonitoringController");

exports.routesConfig = function (app) {
app.post("/request-manager/list", RequestManagerController.List);
app.post("/request-manager/create", RequestManagerController.Create);
app.post("/request-manager/detail", RequestManagerController.Detail);
app.post("/request-manager/verify-coverage", RequestManagerController.VerifyCoverage);
app.post("/request-manager/approve", RequestManagerController.Approve);
app.post("/request-manager/reject", RequestManagerController.Reject);
app.post("/request-manager/allocate", RequestManagerController.Allocate);
app.post("/request-manager/assign-sf-plaza", RequestManagerController.AssignSFPlaza);
app.post("/request-manager/confirm-schedule", RequestManagerController.ConfirmSchedule);
app.post("/request-manager/reschedule", RequestManagerController.Reschedule);
app.post("/request-manager/invoice", RequestManagerController.Invoice);
app.post("/request-manager/reallocate", RequestManagerController.Reallocate);
app.post("/request-manager/complete-installation", RequestManagerController.CompleteInstallation);

app.post("/client-monitoring/list", ClientMonitoringController.List);
app.post("/client-monitoring/list-export", ClientMonitoringController.ListExport);
app.post("/client-monitoring/detail", ClientMonitoringController.Detail);
app.post("/client-monitoring/edit", ClientMonitoringController.EditClient);
// app.post("/client-monitoring/history", ClientMonitoringController.ClientHistory);
app.post("/client-monitoring/monitor", ClientMonitoringController.MonitorClient);
}
