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
  var date = new Date(timestamp);
  var formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
  return formattedDate;
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
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
   
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