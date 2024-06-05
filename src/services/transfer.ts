import request from '@/utils/request';

export async function sendVerifyCode(email: string | null) {
    const res = await request({
        url: `/api/axm-wallet/transfer/send-verify-code/reset-pay`,
        method: 'post',
        data: { email },
    });
    return res?.data;
}

export async function checkVerifyCode(email: string | null,  verify_code: string | null) {
    const res = await request({
        url: `/api/axm-wallet/transfer/check-verify-code/reset-pay`,
        method: 'post',
        data: { email, verify_code },
    });
    return res?.data;
}

export async function setNewPassword(email: string | null, old_enc_private_key: string | null, enc_private_key: string | null, owner_address: string | null, salt: string | null, transfer_salt: string | null) {
    const res = await request({
        url: `/api/axm-wallet/transfer/reset-private-key`,
        method: 'post',
        data: { email, old_enc_private_key, enc_private_key, owner_address, salt, transfer_salt },
    });
    return res?.data;
}

export async function setFirstPassword(email: string | null, old_enc_private_key: string | null, enc_private_key: string | null, transfer_salt: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/update-private-key`,
        method: 'post',
        data: { email, old_enc_private_key, enc_private_key, transfer_salt },
    });
    return res?.data;
}


export async function getHistoryList(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/transaction-history`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function transaction(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/creat-transaction`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function passwordTimes(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/remnant-times`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function wrongPassword(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/wrong-password`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function transferLockTime(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/time-left`,
        method: 'get',
        data,
    });
    return res?.data;
}

export async function bioCreate(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/bio-payment/enable-creat`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function bioCheck(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/bio-payment/enable-save`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function bioClose(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/bio-payment/close`,
        method: 'post',
        data,
    });
    return res?.data;
}

export async function passkeySecurityInfo(data: any) {
    const res = await request({
        url: `/api/axm-wallet/account/passkey-security`,
        method: 'get',
        data,
    });
    return res?.data;
}
