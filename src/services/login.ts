import request from '@/utils/request';
import {clearSessionData, setToken} from "@/utils/help";
import axios from "axios";


export async function sendVerifyCode(email: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/login/send-verify-code`,
        method: 'post',
        data: { email },
    });
    return res?.data;
}

export async function resendVerifyCode(email:  string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password/send-verify-code`,
        method: 'post',
        data: { email },
    });
    return res?.data;
}


export async function checkVerifyCode(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/check-verify-code`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function registerUser(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/register`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkResendVerifyCode(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password/check-verify-code`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function resetPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password`,
        method: 'post',
        data,
    });
    setToken(res?.data);
    return res?.data;
}

export async function updatePassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/update-password`,
        method: 'post',
        data,
    });
    return res?.data;
}

//

export async function checkLoginPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/check`,
        method: 'post',
        data,
    });
    return res?.data;
}

// /api/axm-wallet/account/pwd/check
export async function checkPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/pwd/check`,
        method: 'post',
        data,
    });
    return res?.data;
}


export async function lockPageData(email: string) {
    const res = await request({
        url: `/api/axm-wallet/account/lock`,
        method: 'post',
        data: { email },
    });
    return res?.data;
}

export async function getUserInfo(email: string, device_id: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/info`,
        method: 'get',
        data: { email, device_id },
    });
    return res?.data;
}

export async function getTickerPrice() {
    const res = await request({
        url: `/api/ticker/price`,
        method: 'get',
    });
    return res?.data;
}

export async function logout(email:string, device_id: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/logout`,
        method: 'post',
        data: {email, device_id},
    });
    clearSessionData();
    return res?.data;
}


export async function refreshToken(email: string, device_id: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/refresh-token`,
        method: 'post',
        data: {email, device_id},
    });
    return res?.data;
}

export async function checkUser(email: string) {
    const res = await request({
        url: `/api/axm-wallet/account/login/check-user`,
        method: 'get',
        data: {email},
    });
    return res?.data;
}

export async function addPrivateKey(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/private-key/add`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function getPrivateKey(email: string) {
    const res = await request({
        url: `/api/axm-wallet/account/private-key/get`,
        method: 'get',
        data: {email},
    });
    return res?.data;
}

export async function registerAddress(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/register-address`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function registerPasskey(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/passkey/register-creat`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function registerPasskeySave(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/passkey/register-save`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkPasskeyCreate(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/passkey/check-creat`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkPasskey(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/passkey/check`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkUnlockPasskeyCreate(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/unlock/check-creat`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkUnlockPasskey(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/unlock/check`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function isTrustedDevice(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/is-trusted-device`,
        method: 'get',
        data,
    });
    return res?.data;
}


export async function isOpenBio(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/is-open-bio-payment`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function deviceIsOpenBio(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/is-opened-bio-payment`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function isReplaceBioPayment(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/is-replace-bio-payment`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function checkBioPasskeyCreate(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/passkey/check-creat-bio`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function checkBioPasskey(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/passkey/check-bio`,
        method: 'post',
        data,
    });
    return res?.data;
}

// export async function getAllNft(address, type) {
//     const res = await axios(`/api/v2/addresses/${address}/tokens?type=${type}`);
//     return res.data;
// }

const jsonToUrlEncode = (data:any) =>
    Object.entries(data)
        // .filter((item) => item[1] !== undefined)
        .map(
            (res: any) =>
                `${res[0]}=${window.encodeURIComponent(res[1])}`,
        )
        .join('&');

export async function getNftList(address, data?:any) {
    const res = await axios(`/api/v2/tokens/${address}/instances?${jsonToUrlEncode(data)}`);
    return res.data;
}

// /api/v2/tokens/0x0d96356DE55cf67D07d8Df2c78DA371c5268DaF7/instances/7
export async function getNftDetail(address, id: any) {
    const res = await axios(`/api/v2/tokens/${address}/instances/${id}`);
    return res.data;
}

export async function isNewDevice(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/is-new-device`,
        method: 'get',
        data,
    });
    return res?.data;
}
