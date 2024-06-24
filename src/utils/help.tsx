import { generateFromString } from 'generate-avatar';
import { Tooltip } from "@chakra-ui/react";

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

const formatNumberWithCommas = (number: string) => {
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const changeBalance = (num: string, needSymbol = true) => {
    const str = num ? String(num) : '0';
    const balanceNumber = Number(str)
    const strList = str.split('.')
    // @ts-ignore
    if(balanceNumber === 0) return `${needSymbol ? window.symbol : ''}0`;
    if(balanceNumber > 1){
        if(strList.length > 1) {
            if(strList[1].length > 2){
                const strNum = strList[1].substring(0, 2)
                return <Tooltip hasArrow label={`${formatNumberWithCommas(strList[0])}.${strList[1]}`} bg='#171923' color='#fff' placement="top">
                    {/*@ts-ignore*/}
                    {`${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}.${strNum}`}
                </Tooltip>
            }
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}.${strList[1]}`
        }
        // @ts-ignore
        return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(str)}`;
    } else {
        if(strList.length > 1){
            if(strList[1].length > 5) {
                const strNum = strList[1].substring(0, 5)
                return  <Tooltip hasArrow label={`${formatNumberWithCommas(strList[0])}.${strList[1]}`} bg='#171923' color='#fff' placement="top">
                    {/*@ts-ignore*/}
                    { `${needSymbol ? window.symbol : ''} ${formatNumberWithCommas(strList[0])}.${strNum}`}
                </Tooltip>
            }
            // @ts-ignore
           return `${needSymbol ? window.symbol : ''} ${formatNumberWithCommas(strList[0])}.${strList[1]}`

        } else {
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}`
        }
    }

}

export const changePrice = (num = 0, needSymbol = true) => {
    const str = num ? String(num) : '0';
    const strList = str.split('.')
    // @ts-ignore
    if(num === 0) return `${needSymbol ? window.symbol : ''}0`;
    if(num > 1){
        if(strList.length > 1) {
            if(strList[1].length > 2){
                const strNum = strList[1].substring(0, 2)
                return <Tooltip hasArrow label={`${formatNumberWithCommas(strList[0])}.${strList[1]}`} bg='#171923' color='#fff' placement="top">
                    {/*@ts-ignore*/}
                    {`${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}.${strNum}`}
                </Tooltip>
            }
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}.${strList[1]}`
        }
        // @ts-ignore
        return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(str)}`;
    } else {
        if(strList.length > 1){
            if(strList[1].length > 5) {
                const strNum = strList[1].substring(0, 5)
                return  <Tooltip hasArrow label={`${formatNumberWithCommas(strList[0])}.${strList[1]}`} bg='#171923' color='#fff' placement="top">
                    {/*@ts-ignore*/}
                    { `${needSymbol ? window.symbol : ''} ${formatNumberWithCommas(strList[0])}.${strNum}`}
                </Tooltip>
            }
            // @ts-ignore
           return `${needSymbol ? window.symbol : ''} ${formatNumberWithCommas(strList[0])}.${strList[1]}`

        } else {
            // @ts-ignore
            return `${needSymbol ? window.symbol : ''}${formatNumberWithCommas(strList[0])}`
        }
    }

}

export const setToken = (token: string) => {
    localStorage.setItem('Wallet_Token', token);
}

export const getToken = () => {
    return localStorage.getItem('Wallet_Token');
}

export const setMail = (mail: string) => {
    localStorage.setItem('Wallet_Mail', mail);
}

export const getMail = () => {
    return localStorage.getItem('Wallet_Mail');
}

export const passWordReg = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

export const clearSessionData = (dispatch?: any) => {
    setMail('');
    setToken('');
    sessionStorage.removeItem("sk");
    sessionStorage.removeItem("a");
    sessionStorage.removeItem("b");
    sessionStorage.removeItem("op");
    sessionStorage.removeItem("freeLimit");
    sessionStorage.removeItem("sr");
    sessionStorage.removeItem("ow");
    sessionStorage.removeItem("validAfter");
    sessionStorage.removeItem("validUntil");
    if(dispatch){
        dispatch({
            type: 'global/setUser',
            payload: {},
        })
    }
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




