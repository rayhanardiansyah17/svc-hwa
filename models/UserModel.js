const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const UserModel = {
	GetById: (userId) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						users u
					where 
						u.id = ?
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
}

module.exports = UserModel
