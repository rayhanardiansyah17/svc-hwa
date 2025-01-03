const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })
const express = require("express")
const bodyParser = require("body-parser")
var morgan = require("morgan")
const moment = require("moment")
const fileUpload = require("express-fileupload")
const routes = require("./routes")
const app = express()

app.engine("html", require("ejs").renderFile)

app.use(bodyParser.json({ limit: "100mb" }))
// app.use(compression())

app.use(
	fileUpload({
		limits: { fileSize: "10mb" },
		abortOnLimit: true,
		limitHandler: function (req, res) {
			res.status(200).json(ResponseGenerator.Error("FILE TERLALU BESAR", {}))
		},
	})
)

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Credentials", "true")
	res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE")
	res.header("Access-Control-Expose-Headers", "Content-Length")
	res.header("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Requested-With, Range, x-api-key, x-forwarded-for")
	if (req.method === "OPTIONS") {
		return res.json(200)
	} else {
		return next()
	}
})

var __keyDisAllow = ["ktp", "selfie", "img", "image"]
const __shortenResponseData = (resBodiDatas) => {
	for (let _keyResBody in resBodiDatas) {
		if (__keyDisAllow.includes(_keyResBody)) {
			resBodiDatas[_keyResBody] = String(resBodiDatas[_keyResBody]).substring(0, 100) + "....."
		}
	}
	return resBodiDatas
}

const originalSend = app.response.send
app.response.send = function sendOverWrite(body) {
	try {
		originalSend.call(this, body)
		body = JSON.parse(body)
		if (body.success && body.data) {
			if (Array.isArray(body.data)) {
				for (let _keyResBody in body.data) {
					body.data[_keyResBody] = __shortenResponseData(body.data[_keyResBody])
				}
			} else {
				body.data = __shortenResponseData(body.data)
			}
		}
		this.__custombody__ = body
	} catch (error) {}
}

morgan.token("timestamp", () => moment().format("YYYY-MM-DD HH:mm:ss"))
morgan.token("req-param", (req, res) => JSON.stringify(req.param))
morgan.token("req-body", (req, res) => {
	var _oriBd = __shortenResponseData(req.body)
	return JSON.stringify(_oriBd)
})
morgan.token("res-body", (_req, res) => JSON.stringify(res.__custombody__))
app.use(morgan(":timestamp :remote-addr :remote-user :method :url :status | param :req-param | body: :req-body | res: :res-body :response-time ms"))

routes.routesConfig(app)

const server = require("http").createServer(app)
server.listen(process.env.PORT, () => {
	const host = server.address().address
	const port = server.address().port
	console.log("Service HWA on Port ", host, port)
})
