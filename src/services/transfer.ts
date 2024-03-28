import request from '@/utils/request';

export async function sendVerifyCode(email: string | null) {
    const res = await request({
        url: `/api/axm-wallet/transfer/send-verify-code/reset-pay`,
        method: 'post',
        data: { email },
    });
    return res.data;
}
