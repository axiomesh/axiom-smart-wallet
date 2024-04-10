export const generateRandomBytes = (length) => {
    const bytes = [];
    for (let i = 0; i < length; i++) {
        bytes.push(Math.floor(Math.random() * 10)); // 生成 0 到 9 之间的随机数字
    }
    return bytes;
}
