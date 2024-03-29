import request from '@/utils/request';


export async function getHistoryList(data: any) {
    const res = await request({
        url: `/api/axm-wallet/transfer/transaction-history`,
        method: 'post',
        data,
    });
    return res.data;
}



