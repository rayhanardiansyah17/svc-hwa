const intl = {
    number_format(number){
        const formattedCurrency = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(number);

        const formattedCurrencyWithoutDecimal = formattedCurrency.replace(/,00$/, '');

        return formattedCurrencyWithoutDecimal;
    },
    convertToPaddedBinary(num) {
        let numString = num.toString();
        
        // Pad the binary string with zeros to ensure it has 4 digits
        let paddedBinary = numString.padStart(4, '0');
        return paddedBinary;
    },
    generateRandomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
}

module.exports = intl