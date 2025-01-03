const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const PlazaModel = {
	GetByCode: (plazaCode) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
						plaza p
					where 
						p.code = ?
                        and deleted_at is null
				`
				let result = await mysqlHelpers.query(db, query, [plazaCode])
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

module.exports = PlazaModel
