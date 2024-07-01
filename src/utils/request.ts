import axios from 'axios';
import { history } from 'umi';
import {clearSessionData, getToken} from "@/utils/help";

// 只支持一层简单json格式的对象
const jsonToUrlEncode = (data:any) =>
    Object.entries(data)
        // .filter((item) => item[1] !== undefined)
        .map(
            (res: any) =>
                `${res[0]}=${window.encodeURIComponent(res[1])}`,
        )
        .join('&');
const getParams = (method: string, data: any) => {
    switch (method) {
        case 'get':
            return jsonToUrlEncode(data);
    }
};

export default async function request(params: any) {
    const { url, data, method = 'get', ...last } = params;
    const baseApi = "";
    const new_data = {};
    for (let key in data) {
        // if (getTrueData(data[key])) new_data[key] = data[key];
        // @ts-ignore
        new_data[key] = data[key]
    }
    const headers = {
        Authorization: `axiom-wallet ${getToken()}`,
    }

    try {
        const res: any = await axios(
            (method === 'get') && data
                ? `${baseApi}${url}?${getParams(method, new_data)}`
                : baseApi + url,
            {
                data,
                method,
                headers,
                ...last,
            },
        );
        if (res.status === 200) {
            if(res?.data?.code === 0){
                return res.data;
            }
            if(res?.data?.code === 10102 || res?.data?.code === 10103 || res?.data?.code === 10104){
                clearSessionData();
                history.replace('/login')
                return
            }

            throw new Error(res?.error || res?.message || res?.data?.message || 'Error');

        } else {
            throw new Error(res?.error || res?.message  ||  res?.data?.message || 'Error');
            // Promise.reject(res?.error || res.data.message || 'Error')
        }
    } catch (e: any) {
        const err = e.response ? e.response.data : e;
        const msg = err?.message || e.message || err;
        return Promise.reject(msg);
    }
}
