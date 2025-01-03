const Validator = require('validatorjs')
Validator.useLang('en')

function validatorJs(req, res, validationRules) {
    return new Promise((resolve, reject) => {
        const isInputValid = new Validator(req.body, validationRules)
        if (isInputValid.fails()) {
            const apiResult = {
                meta: {
                    code: 400,
                    message: Object.values(isInputValid.errors.all())[0][0], // get the first error message
                },
            }
            res.status(200).json(apiResult)
            resolve(false)
        }
        resolve(true)
    })
}

module.exports = validatorJs