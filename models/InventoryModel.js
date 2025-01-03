const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const InventoryModel = {
	GetSimCardBoxBySimcardType: (simCardType) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						simcard_boxes sb
					where 
						sb.simcard_type = ?
					
				`
				let result = await mysqlHelpers.query(db, query, [simCardType])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetSimCardByBoxCode: (batchCode, boxCode) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
                    select
                        s.*,
                        if(ppa.id is null, "", "true") as selected
                    from
                        simcards s
                    left join purchase_product_allocations ppa 
                        on ppa.batch_code = s.batch_code 
                        and ppa.box_code = s.box_code 
                        and ppa.item = s.msisdn 
                    where
                        s.batch_code = ?
                        and s.box_code = ?
					
				`
				let result = await mysqlHelpers.query(db, query, [batchCode, boxCode])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetSimCardByMsisdn: (msisdn) => {
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

module.exports = InventoryModel
