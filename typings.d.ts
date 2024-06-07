import 'umi/typings';
declare global {
    interface Window {
        axiom: any;
        PAYMASTER: string;
        RPC_URL: string;
        ENTRY_POINT: string;
    }
}
