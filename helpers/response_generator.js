const Success = (_message = "Operation Success", _data = {}) => {
	return {
		success: true,
		message: _message,
		data: _data,
	}
}
const Error = (_message = "Operation Fail", _error = null) => {
	return {
		success: false,
		message: _message,
		error: _error,
	}
}

module.exports = { Success, Error }