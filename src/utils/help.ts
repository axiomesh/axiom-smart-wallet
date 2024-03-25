export const getQueryParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};


