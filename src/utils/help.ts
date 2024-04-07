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

export const changePrice = (num = 0) => {
    const str = num ? String(num) : '0';
    const strList = str.split('.')
    if(num > 100){
        if(strList.length > 1) {
            // @ts-ignore
            return `${window.symbol}${(num.toFixed(2)).toLocaleString('en-us')}`
        }
        // @ts-ignore
        // return `${needSymbol ? window.symbol : ''}${((num.toFixed()).toLocaleString('en-us')}`;
    } else {
        if(strList.length > 1 && strList[1].length > 8){
            // @ts-ignore
            return `${window.symbol}${(num.toFixed(8)).toLocaleString('en-us')}`
        } else {
            // @ts-ignore
            return `${window.symbol}${(Number(strList[0])).toLocaleString('en-us')}.${strList[1]}`
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
    dispatch({
        type: 'global/setUser',
        payload: {},
    })
}




