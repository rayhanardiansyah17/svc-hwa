const response = {
    200: {
        meta: {
            code: '200',
            status: 'success',
            message: 'the request succeeded',
        },
        data: '',
    },
    201: {
        meta: {
            code: '201',
            status: 'success',
            message: 'resource created',
        },
        data: '',
    },
    202: {
        meta: {
            code: '202',
            status: 'success',
            message: 'resource accepted, but in progress',
        },
        data: '',
    },
    400: {
        meta: {
            code: '400',
            status: 'bad_request',
            message: 'bad request',
        },
        data: '',
    },
    401: {
        meta: {
            code: '401',
            status: 'unauthenticated',
            message: 'unauthenticated',
        },
        data: '',
    },
    404: {
        meta: {
            code: '404',
            status: 'not_found',
            message: 'resource not found',
        },
        data: '',
    },
    422: {
        meta: {
            code: '422',
            status: 'unprocessable_entity',
            message: 'bad input',
        },
        data: '',
    },
    500: {
        meta: {
            code: '500',
            status: 'error',
            message: 'error',
        },
        data: '',
    },
};

module.exports = response;