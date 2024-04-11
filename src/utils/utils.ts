export const generateRandomBytes = (length) => {
    let randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);
    let randomHexString = Array.from(randomBytes)
        .map(byte => ('0' + byte.toString(length)).slice(-2))
        .join('');
    return randomHexString
}
