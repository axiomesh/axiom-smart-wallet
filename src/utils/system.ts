export const getMacVersion = () => {
    const ua = navigator.userAgent;
    const reg = /mac os x [\d._]+/gi;
    const v_info = ua.match(reg) || '';
    return Array.isArray(v_info) ? v_info[0] : v_info;
}

export const getWindowsVersion = () => {
    const ua = navigator.userAgent;
    const reg = /windows nt [\d._]+/gi;
    const v_info = ua.match(reg) || '';
    return Array.isArray(v_info) ? v_info[0] : v_info;
}

export const getAndroidVersion = () => {
    const ua = navigator.userAgent;
    const reg = /android [\d._]+/gi;
    const v_info = ua.match(reg) || '';
    return Array.isArray(v_info) ? v_info[0] : v_info;
}

export const getIosVersion = () => {
    const ua = navigator.userAgent;
    const reg = /os [\d._]+/gi;
    const v_info = ua.match(reg) || '';
    return Array.isArray(v_info) ? v_info[0] : v_info;
}

export const getDeviceVersion = () => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('mac')) {
        return getMacVersion();
    } else if (userAgent.includes('windows')) {
        return getWindowsVersion();
    } else if (userAgent.includes('android')) {
        return getAndroidVersion();
    } else if (
        (userAgent.includes('iphone') || userAgent.includes('ipad')) &&
        !userAgent.includes('ipod')
    ) {
        return getIosVersion();
    }

    return 'unknown';
}
