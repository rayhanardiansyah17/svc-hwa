const PaginationHelper = (countResult, page, pageSize, data) => {
    return new Promise((resolve, reject) => {
        const totalRecords = countResult;
        const totalPage = Math.ceil(totalRecords / pageSize);
        const nextPage = page < totalPage ? parseInt(page) + 1 : null;
        const beforePage = page > 1 ? page - 1 : null;

        let response = {
            pagination: {
                first_page: 1,
                next_page: nextPage,
                before_page: beforePage,
                last_page: totalPage,
                total_page: totalPage,
                total_data: countResult
            },
            data: data,
        }

        resolve(response)
    })
}

module.exports=PaginationHelper