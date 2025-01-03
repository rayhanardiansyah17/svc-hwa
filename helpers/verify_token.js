const tokenHelper = require('./token_helpers')

const VerifyToken = async function(req, res, next) {
    let token = req.headers['x-api-key']
    let apiResult = {}
    if(!token) {
        apiResult.meta = {
            code: '401',
            message: 'Token Not Provided'
        }
        return res.status(401).json(apiResult)
    } else {
        try {
            const payload = await tokenHelper.verify(token)
            req.id = payload.id
            req.email = payload.email
            req.name = payload.name
            next()
        } catch (error) {
            apiResult.meta = {
                code: '401',
                message: 'Invalid Token'
            }
            return res.status(401).json(apiResult)
        }
    }
}

module.exports = VerifyToken