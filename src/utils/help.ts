import { generateFromString } from 'generate-avatar';

export const getImgFromHash = (hash = "") => `data:image/svg+xml;utf8,${generateFromString(hash)}`;
export const getQueryParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

export const exchangeAddress = (text: string) => (text ? `${text.slice(0, 6)}...${text.slice(-4)}` : '');
export const toThousands = (num = 0, needSymbol = false) => {
    const str = num ? String(num) : '0';
    const strList = str.split('.')
    if(strList.length > 1) {
        // @ts-ignore
        return `${needSymbol ? window.symbol : ''}${(Number(strList[0])).toLocaleString('en-us')}.${strList[1]}`
    }
    // @ts-ignore
    return `${needSymbol ? window.symbol : ''}${(Number(strList[0])).toLocaleString('en-us')}`;
}

export const changePrice = (num = 0, needSymbol = true) => {
    const str = num ? String(num) : '0';
    const strList = str.split('.')
    // @ts-ignore
    if(num === 0) return `${needSymbol ? window.symbol : ''}0`;
    if(num > 100){
        if(strList.length > 1) {
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${(num.toFixed(2)).toLocaleString('en-us')}`
        }
        // @ts-ignore
        return `${needSymbol ? window.symbol : ''}${(num.toFixed(2)).toLocaleString('en-us')}`;
    } else {
        if(strList.length > 1){
            // @ts-ignore
            if(strList[1].length > 8) return `${needSymbol ? window.symbol : ''}${(num.toFixed(8)).toLocaleString('en-us')}`
            // @ts-ignore
           return `${needSymbol ? window.symbol : ''}${(Number(strList[0])).toLocaleString('en-us')}.${strList[1]}`

        } else {
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${(Number(strList[0])).toLocaleString('en-us')}`
        }
    }

}

export const setToken = (token: string) => {
    sessionStorage.setItem('Wallet_Token', token);
}

export const getToken = () => {
    return sessionStorage.getItem('Wallet_Token');
}

export const setMail = (mail: string) => {
    sessionStorage.setItem('Wallet_Mail', mail);
}

export const getMail = () => {
    return sessionStorage.getItem('Wallet_Mail');
}

export const passWordReg = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

export const clearSessionData = (dispatch: any) => {
    setMail('');
    setToken('');
    sessionStorage.setItem('sessionKey','');
    sessionStorage.setItem("freeLimit", "");
    sessionStorage.setItem("key", "");
    sessionStorage.setItem("token", "");
    dispatch({
        type: 'global/setUser',
        payload: {},
    })
}

export function formatUnits(value: bigint, decimals: number) {
    let display = value.toString()

    const negative = display.startsWith('-')
    if (negative) display = display.slice(1)

    display = display.padStart(decimals, '0')

    let [integer, fraction] = [
        display.slice(0, display.length - decimals),
        display.slice(display.length - decimals),
    ]
    fraction = fraction.replace(/(0+)$/, '')
    return `${negative ? '-' : ''}${integer || '0'}${
        fraction ? `.${fraction}` : ''
    }`
}

export const etherUnits = {
    gwei: 9,
    wei: 18,
}

export function formatEther(wei: bigint, unit: 'wei' | 'gwei' = 'wei') {
    return formatUnits(wei, etherUnits[unit])
}




