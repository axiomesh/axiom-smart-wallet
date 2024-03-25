import request from '@/utils/request';


export async function sendVerifyCode(email: string | null) {
    const res = await request({
        url: `/api/axm-wallet/account/send-verify-code/login`,
        method: 'post',
        data: { email },
    });
    return res.data;
}


export async function checkVerifyCode(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/check-verify-code/login`,
        method: 'post',
        data,
    });
    return res.data;
}

export async function addOrUpdatePassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/login-password/addOrUpdate`,
        method: 'post',
        data,
    });
    return res.data;
}



