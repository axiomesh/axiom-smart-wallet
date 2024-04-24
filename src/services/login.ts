import request from '@/utils/request';
import { clearSessionData } from "@/utils/help";


export async function sendVerifyCode(email: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/login/send-verify-code`,
        method: 'post',
        data: { email },
    });
    return res.data;
}

export async function resendVerifyCode(email:  string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password/send-verify-code`,
        method: 'post',
        data: { email },
    });
    return res.data;
}


export async function checkVerifyCode(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/check-verify-code`,
        method: 'post',
        data,
    });
    return res.data;
}

export async function registerUser(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/register`,
        method: 'post',
        data,
    });
    return res.data;
}

export async function checkResendVerifyCode(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password/check-verify-code`,
        method: 'post',
        data,
    });
    return res.data;
}

export async function resetPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/reset-password`,
        method: 'post',
        data,
    });
    return res.data;
}

export async function updatePassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/update-password`,
        method: 'post',
        data,
    });
    return res.data;
}

//

export async function checkLoginPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login/check`,
        method: 'post',
        data,
    });
    return res.data;
}

// /api/axm-wallet/account/pwd/check
export async function checkPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/pwd/check`,
        method: 'post',
        data,
    });
    return res.data;
}


export async function lockPage(email: string) {
    const res = await request({
        url: `/api/axm-wallet/account/lock`,
        method: 'post',
        data: { email },
    });
    return res.data;
}

export async function getUserInfo(email: string) {
    const res = await request({
        url: `/api/axm-wallet/account/info`,
        method: 'get',
        data: { email },
    });
    return res.data;
}

export async function getTickerPrice() {
    const res = await request({
        url: `/api/ticker/price`,
        method: 'get',
    });
    return res.data;
}

export async function logout(email:string) {
    const res = await request({
        url: `/api/axm-wallet/account/logout`,
        method: 'post',
        data: {email},
    });
    clearSessionData();
    return res.data;
}


export async function refreshToken() {
    const res = await request({
        url: `/api/axm-wallet/account/refresh-token`,
        method: 'post',
    });
    return res?.data;
}




