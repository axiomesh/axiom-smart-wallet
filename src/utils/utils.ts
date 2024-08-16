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
    const  userAgent = navigator.userAgent;
    if(userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1){
        return 4;
    } else if(userAgent.indexOf("Edge") > -1){
        return 3;
    } else if(userAgent.indexOf("Firefox") > -1){
        return 5;
    } else if(userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1){
        return 1;
    } else if(userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1){
        return 2;
    }

    return 0;
}

  export const detectBrowser = () => {
    let userAgent = navigator.userAgent.toLowerCase();
    let isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    let isChrome = /chrome|crios|crmo/i.test(userAgent) && !isSafari;

    if (isSafari) {
        return "safari"
    } else if (isChrome) {
        return "chrome"
    } else {
        return "other"
    }
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

export const getChromeVersion = () => {
  let userAgent = navigator.userAgent.toLowerCase();
  let isChrome = /chrome|crios|crmo/i.test(userAgent) && !/edge|edg|opr/i.test(userAgent);

  if (isChrome) {
      let match = userAgent.match(/chrome\/(\d+)/);
      let matchAll = userAgent.match(/chrome\/([\d.]+)/);
      console.log(matchAll)
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

export const getTransportType = (type) => {
    if(type) return 'internal'
    return 'hybrid'
}
