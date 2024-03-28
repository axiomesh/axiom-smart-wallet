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


