const nextString = async (inputString) => {
	// Convert string to an array of characters for easier manipulation
	let chars = inputString.split("")

	// Find the rightmost character that is not 'Z'
	let i = chars.length - 1
	while (i >= 0 && chars[i] === "Z") {
		i--
	}

	// If all characters are 'Z', increment the length of the string
	if (i === -1) {
		return "A".repeat(chars.length + 1)
	}

	// Increment the rightmost non-'Z' character
	chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1)

	// Reset all characters to the right of the incremented character to 'A'
	for (let j = i + 1; j < chars.length; j++) {
		chars[j] = "A"
	}

	// Convert the array of characters back to a string
	return chars.join("")
}

module.exports = nextString
