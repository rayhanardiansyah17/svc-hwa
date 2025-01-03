const handleNumric = (arr, _type = null) => {
	const sequences = []
	let currentSequence = []

	arr = arr.sort()

	for (let i = 0; i < arr.length; i++) {
		const current = BigInt(arr[i])
		const previous = i > 0 ? BigInt(arr[i - 1]) : null

		if (previous === null || current === previous + 1n) {
			currentSequence.push(arr[i])
		} else {
			sequences.push(currentSequence)
			currentSequence = [arr[i]]
		}
	}

	if (currentSequence.length > 0) {
		sequences.push(currentSequence)
	}

	return sequences
}

const _totalCharCode = (string) => {
	let _total = 0
	for (let _char of string.split("")) {
		_total = _total + _char.charCodeAt()
	}
	return _total
}

const handleAlphaNumeric = (arr, _type = null) => {
	const sequences = []
	let currentSequence = []

	arr = arr.sort()

	for (let i = 0; i < arr.length; i++) {
		const current = _totalCharCode(arr[i])
		const previous = i > 0 ? _totalCharCode(arr[i - 1]) : null

		if (previous === null || current === previous + 1) {
			currentSequence.push(arr[i])
		} else {
			sequences.push(currentSequence)
			currentSequence = [arr[i]]
		}
	}

	if (currentSequence.length > 0) {
		sequences.push(currentSequence)
	}

	return sequences
}

const splitIntoSequences = (arr) => {
	let _numerics = []
	let _alphaNumeric = []

	for (let _arr of arr) {
		if (/^\d+$/.test(_arr)) {
			_numerics.push(_arr)
		} else {
			_alphaNumeric.push(_arr)
		}
	}

	_numerics = _numerics.sort()
	_alphaNumeric = _alphaNumeric.sort()

	let _groupNumber = handleNumric(_numerics)
	// console.log('_groupNumber :', _groupNumber)
	let _groupAlpha = handleAlphaNumeric(_alphaNumeric)
	// console.log('_groupAlpha :', _groupAlpha)

	return _groupNumber.concat(_groupAlpha)
}

module.exports = { splitIntoSequences }
