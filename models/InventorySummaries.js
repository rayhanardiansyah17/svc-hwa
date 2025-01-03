const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const InventorySummariesModel = {
	GetByProductTypeProductName: (productType, productName) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						*
					from
                        inventory_summaries
					where 
						product_type = ?
                        and product_name = ?
                    order by 
                        updated_at desc
					
				`
				let result = await mysqlHelpers.query(db, query, [productType, productName])
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

module.exports = InventorySummariesModel
