export const generateRandomBytes = (length) => {
    let randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);
    let randomHexString = Array.from(randomBytes)
        .map(byte => ('0' + byte.toString(length)).slice(-2))
        .join('');
    return randomHexString
}

export const msToTime = (duration) => {
    let seconds: number|string = Math.floor((duration / 1000) % 60),
        minutes: number|string = Math.floor((duration / (1000 * 60)) % 60),
        hours: number|string = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "h:" + minutes + "min:" + seconds + "s";
}

export const formatAmount = (inputAmount) => {
    const parts = inputAmount.split('.');
    const integerPart = parts[0];
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 1 ? formattedIntegerPart : formattedIntegerPart + '.' + parts[1];
};
