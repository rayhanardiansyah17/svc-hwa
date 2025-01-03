const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const SimcardModel = {
	rules: {
		create: {
			name: "required",
		},
		update: {
			id: "required",
			name: "required",
		},
	},
	GetByMsisdn: (msisdn) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						s.msisdn = ?
				`
				let result = await mysqlHelpers.query(db, query, [msisdn])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByStatus: (status, limit = null) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						s.status = ?
                    order by 
                        batch_code asc,
                        box_code asc
				`
				if (limit) query += ` limit ?`
				let result = await mysqlHelpers.query(db, query, [status, limit])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByTypeByStatus: (type, status, limit = null) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						type = ?
						and s.status = ?
                    order by 
                        batch_code asc,
                        box_code asc
				`
				if (limit) query += ` limit ?`
				let result = await mysqlHelpers.query(db, query, [type, status, limit])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByTypeByStatusIsMsisdnNull: (type, status, isMsisdnNull = false, limit = null) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						type = ?
						and s.status = ?
						${isMsisdnNull == true ? `and s.msisdn is null` : ""}
                    order by 
                        batch_code asc,
                        box_code asc
				`
				if (limit) query += ` limit ?`
				let result = await mysqlHelpers.query(db, query, [type, status, limit])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByStatusSbpPoCodeMsisdn: (status, purchaseOrderCode, msisdn) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						s.status = ?
						and sbp_po_code = ?
						and msisdn = ?
                    order by 
                        batch_code asc,
                        box_code asc
				`

				let result = await mysqlHelpers.query(db, query, [status, purchaseOrderCode, msisdn])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByStatusSbpPoCodeItemId: (status, purchaseOrderCode, itemId) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						s.status = ?
						and sbp_po_code = ?
						and id = ?
                    order by 
                        batch_code asc,
                        box_code asc
				`

				let result = await mysqlHelpers.query(db, query, [status, purchaseOrderCode, itemId])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByStatusSbpPoCodeImsiIccid: (status, purchaseOrderCode, imsi, iccid) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						s.status = ?
						and sbp_po_code = ?
						and imsi = ?
						and iccid = ?
                    order by 
                        batch_code asc,
                        box_code asc
				`

				let result = await mysqlHelpers.query(db, query, [status, purchaseOrderCode, imsi, iccid])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByIccid: (iccid) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcards s
					where 
						iccid = ?
				`

				let result = await mysqlHelpers.query(db, query, [iccid])
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

module.exports = SimcardModel
