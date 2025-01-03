const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const ChannelModel = {
	GetByUserId: (userId) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						sales_channel sc
					where 
						sc.user_id = ?
                        and deleted_at is null
				`
				let result = await mysqlHelpers.query(db, query, [userId])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetBySalesName: (salesName) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						sales_channel sc
					where 
						sc.sales_name = ?
                        and deleted_at is null
				`
				let result = await mysqlHelpers.query(db, query, [salesName])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetBySalesCode: (salesCode) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						sales_channel sc
					where 
						sc.sales_code = ?
                        and deleted_at is null
				`
				let result = await mysqlHelpers.query(db, query, [salesCode])
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

module.exports = ChannelModel
