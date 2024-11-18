import dayjs from '@/utils/dayjs';
export const generateRandomBytes = (length: number) => {
    let randomBytes = new Uint8Array(length);
    window.crypto.getRandomValues(randomBytes);
    let randomHexString = Array.from(randomBytes)
        .map(byte => ('0' + byte.toString(length)).slice(-2))
        .join('');
    return randomHexString
}

export const msToTime = (duration: number) => {
    let seconds: number|string = Math.floor((duration / 1000) % 60),
        minutes: number|string = Math.floor((duration / (1000 * 60)) % 60),
        hours: number|string = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "h:" + minutes + "min:" + seconds + "s";
}

export const convertTimestampToDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export const formatAmount = (inputAmount: string) => {
    const parts = inputAmount.split('.');
    const integerPart = parts[0];
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 1 ? formattedIntegerPart : formattedIntegerPart + '.' + parts[1];
};

export const validAfter = () => {
    return Math.round(Date.now() / 1000);
}

export const validUntil = () => {
    let currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999);
    return currentDate.getTime();
}


export const getDeviceType = () => {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (userAgent.includes('Mac')) {
      return 'Mac';
    } else if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (
      (userAgent.includes('iPhone') || userAgent.includes('iPad')) &&
      !userAgent.includes('iPod')
    ) {
      return 'iPhone/iPad';
    }

    return 'Unknown';
  }

export const getBrowserName = () =>{
    const  userAgent = navigator.userAgent.toLowerCase();
    if(userAgent.indexOf("opera") > -1 || userAgent.indexOf("opr") > -1){
        return 4;
    } else if(userAgent.indexOf("edg") > -1){
        return 3;
    } else if(userAgent.indexOf("firefox") > -1){
        return 5;
    } else if(userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") == -1){
        return 1;
    } else if(userAgent.indexOf("chrome") > -1 && userAgent.indexOf("safari") > -1){
        return 2;
    }

    return 0;
}

  export const detectBrowser = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    let isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    let isChrome =/chrome|crios|crmo/i.test(userAgent) && !/edge|edg|opr|qq/i.test(userAgent) && !isSafari;
    if (isSafari) {
        return "Safari"
    } else if (isChrome) {
        return "Chrome"
    } else if(userAgent.indexOf("opera") > -1 || userAgent.indexOf("opr") > -1){
        return "Opera";
    }else if(userAgent.indexOf("firefox") > -1){
        return "Firefox";
    }else if(userAgent.indexOf("edg") > -1){
        return "Edge";
    }else {
        return "Other"
    }
}


export const getDeviceName = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    if(navigator?.userAgentData && navigator?.userAgentData?.brands.length > 2) {
        let brands = navigator?.userAgentData?.brands;
        return brands[1].brand;
    }

    return detectBrowser()

}

export const getSafariVersion = () => {
  let userAgent = navigator.userAgent.toLowerCase();
  let isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  if (isSafari) {
      let match = userAgent.match(/version\/(\d+)/);
      let matchAll = userAgent.match(/version\/([\d.]+)/);
      if (match && matchAll) {
          let safariVersion = parseInt(match[1], 10);
          return {
              version: safariVersion,
              allVersion: matchAll[1]
          };
      } else {
          console.log("Safari version not found.");
          return null;
      }
  } else {
      console.log("The browser is not Safari.");
      return null;
  }
}

export const getIsActiveBrowser = () =>{
    const ua = navigator.userAgent.toLowerCase();
    let isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    let isChrome = /chrome|crios|crmo/i.test(ua) && !/edge|edg|opr|qq/i.test(ua) && !isSafari;

    if(ua.indexOf('edg') > -1){
        let match = ua.match(/edg\/(\d+)/);
        let matchAll = ua.match(/edg\/([\d.]+)/);
        if(ua.includes('mac')) return false;
        if (match && matchAll) {
            let version = parseInt(match[1], 10);
            if(version >= 128) return true
            return false
        }
        return false
    } else if(isSafari){
        let match = ua.match(/version\/(\d+)/);
        let matchAll = ua.match(/version\/([\d.]+)/);
        if (match && matchAll) {
           let safariVersion = parseInt(match[1], 10);
           if(safariVersion > 16) return true
            return false
        }
        return false
    } else if(isChrome){
        let match = ua.match(/chrome\/(\d+)/);
        let matchAll = ua.match(/chrome\/([\d.]+)/);
        if (match && matchAll) {
            let version = parseInt(match[1], 10);
            if(version >= 128) return true
            return false
        }
        return false
    }

    return false
}

export const getChromeVersion = () => {
  let userAgent = navigator.userAgent.toLowerCase();
  let isChrome = /chrome|crios|crmo/i.test(userAgent) && !/edge|edg|opr|qq/i.test(userAgent);

  if (isChrome) {
      let match = userAgent.match(/chrome\/(\d+)/);
      let matchAll = userAgent.match(/chrome\/([\d.]+)/);
      if (match && matchAll) {
          let chromeVersion = parseInt(match[1], 10);
          console.log("Chrome major version: " + matchAll[1]);
          return {
            version: chromeVersion,
            allVersion: matchAll[1]
        };;
      } else {
          console.log("Chrome version not found.");
          return null;
      }
  } else {
      console.log("The browser is not Chrome.");
      return null;
  }
}

export const getBrowserVersion = () =>{

    const ua = navigator.userAgent.toLowerCase();
    let isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    let isChrome = /chrome|crios|crmo/i.test(ua) && !/edge|edg|opr|qq/i.test(ua) && !isSafari;
    if(ua.indexOf("firefox") > -1){
        let match = ua.match(/firefox\/(\d+)/);
        if (match) return parseInt(match[1], 10)

        return '0.0'
    } else if(ua.indexOf("opera") > -1 || ua.indexOf('opr') > -1){
        let match = ua.match(/opr\/(\d+)/);
        if (match) return parseInt(match[1], 10)
        return '0.0'
    } else if(ua.indexOf('edg') > -1){
        let match = ua.match(/edg\/(\d+)/);
        if (match) return parseInt(match[1], 10)
        return '0.0'
    } else if(isSafari){
        let match = ua.match(/version\/(\d+)/);
        if (match) return parseInt(match[1], 10)
        return '0.0'
    } else if(isChrome){
        let match = ua.match(/chrome\/(\d+)/);
        if (match) return parseInt(match[1], 10)
        return '0.0'
    }

    return '0.0'
}

export const removeTransferFee = () => {
    sessionStorage.removeItem("sk");
    sessionStorage.removeItem("a");
    sessionStorage.removeItem("b");
    sessionStorage.removeItem("op");
    sessionStorage.removeItem("freeLimit");
    sessionStorage.removeItem('limit_timer')
    sessionStorage.removeItem("sr");
    sessionStorage.removeItem("validAfter");
    sessionStorage.removeItem("validUntil");
    sessionStorage.removeItem("ow");
    sessionStorage.removeItem("freeStatus")
    sessionStorage.removeItem("freeStep")
}

export const removeLogin = () => {
    sessionStorage.removeItem('sessionKey');
    sessionStorage.removeItem("key");
    sessionStorage.removeItem("allowCredentials");
    sessionStorage.removeItem("ow");
    sessionStorage.removeItem("sr");
    sessionStorage.removeItem("verify_code");
}

export const getTransportType = (type) => {
    if(type) return 'internal'
    return 'hybrid'
}
