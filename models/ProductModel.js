const moment = require("moment")
const mysqlHelpers = require("../helpers/mysql_helpers")
const db = require("../helpers/db_helpers")
const paginationHelper = require("../helpers/pagination_helper")

const ProductModel = {
	GetPrice: (keySecondary, productName, serviceClassId = "") => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						p.*
					from
                        products p
					where 
						p.key_primary = 'product_maintenance'
                        and p.key_secondary = ?
                        and p.product_name = ?
                        and deleted_by is null
				`
				if (serviceClassId != "") {
					query += " and p.service_class_id = ?"
				}
				let result = await mysqlHelpers.query(db, query, [keySecondary, productName, serviceClassId])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetByName: (keySecondary, productName, serviceClassId = "") => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						p.*
					from
                        products p
					where 
						p.key_primary = 'product_maintenance'
                        and p.key_secondary = ?
                        and p.product_name = ?
                        and deleted_by is null
				`
				if (serviceClassId != "") {
					query += " and p.service_class_id = ?"
				}
				let result = await mysqlHelpers.query(db, query, [keySecondary, productName, serviceClassId])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetById: (productId) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						p.*
					from
                        products p
					where 
						p.id = ?
                        and deleted_by is null
				`

				let result = await mysqlHelpers.query(db, query, [productId])
				resolve({
					rowCount: result.length,
					rows: result,
				})
			} catch (error) {
				reject(error)
			}
		})
	},
	GetProductRelations: (childId) => {
		return new Promise(async (resolve, reject) => {
			try {
				var query = `
					select
						pr.*
					from
                        product_relations pr
					where 
						pr.child_id = ?
				`
				let result = await mysqlHelpers.query(db, query, [childId])
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

module.exports = ProductModel
