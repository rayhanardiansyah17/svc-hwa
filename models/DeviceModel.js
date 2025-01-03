const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const DeviceModel = {
	rules: {
		create: {
			name: "required",
		},
		update: {
			id: "required",
			name: "required",
		},
	},
	GetByStatusByDeviceType: (status, deviceType, limit = null) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						d.*
					from
						devices d
					where 
						d.status = ?
                        and d.device_type = ?
                    order by 
                        batch_code asc,
                        id asc
				`
				if (limit) query += ` limit ?`
				console.log("limit :", limit)

				let result = await mysqlHelpers.query(db, query, [status, deviceType, limit])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	Update: (tableName, id, data) => {
		return new Promise(async (resolve, reject) => {
			try {
				var col = []
				var val = []

				for (var d in data) {
					col.push(d + "=?")
					val.push(data[d])
				}

				val.push(id)

				var query = "UPDATE " + tableName + `  SET ` + col.join(", ") + `  WHERE id=?`

				let result = await mysqlHelpers.query(db, query, val)
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
}

module.exports = DeviceModel
