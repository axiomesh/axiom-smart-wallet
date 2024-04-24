import eth from '@/assets/currency/eth/eth.png';
import usdt from '@/assets/currency/eth/usdt.png';
import usdc from '@/assets/currency/eth/usdc.png';
import waxc from '@/assets/currency/eth/waxc.png';
import axc from '@/assets/currency/axc/axc.png';
import weth from '@/assets/currency/axc/weth.png'
import wusdt from '@/assets/currency/axc/wusdt.png'
import wusdc from '@/assets/currency/axc/wusdc.png'
import allWusdc from '@/assets/currency/all/all-wusdc.png';
import allWusdt from '@/assets/currency/all/all-wusdt.png';
import allWaxc from '@/assets/currency/all/all-waxc.png';
import allWeth from '@/assets/currency/all/all-weth.png';
import allUsdc from '@/assets/currency/all/all-usdc.png';
import allUsdt from '@/assets/currency/all/all-usdt.png';
import all from '@/assets/currency/all/all.png';
interface Item {
    label: string,
    icon: string | any,
    value?: string,
    symbol?: string
    contract?:string
    type?: string
}

interface selectItem{
    eth: Array<Item | any>,
    axc: Array<Item | any>,
    all: Array<Item | any>,
}

export const selectCurrencyList: selectItem | any = {
    eth: [{
        label: 'ETH',
        icon: eth,
        type: 'eth',
        symbol: 'ETHUSD',
    },{
        label: 'wAXC',
        icon: waxc,
        type: 'eth',
        symbol: 'wAXCUSD',
        contract: window.WAXC_CONTRACT
    },{
        label: 'USDC',
        icon: usdc,
        type: 'eth',
        symbol: 'USDCUSD',
        contract: window.USDC_CONTRACT
    },{
        label: 'USDT',
        icon: usdt,
        type: 'eth',
        symbol: 'USDTUSD',
        contract: window.USDT_CONTRACT
    }],
    axc: [{
        label: 'AXC',
        icon: axc,
        type: 'axc',
        symbol: 'AXCUSD',
    },{
        label: 'WETH',
        icon: weth,
        type: 'axc',
        symbol: 'WETHUSD',
        contract: window.WETH_CONTRACT
    },{
        label: 'wUSDC',
        icon: wusdc,
        type: 'axc',
        symbol: 'wUSDCUSD',
        contract: window.WUSDC_CONTRACT
    },{
        label: 'wUSDT',
        icon: wusdt,
        type: 'axc',
        symbol: 'wUSDTUSD',
        contract: window.WUSDT_CONTRACT
    }],
    all: [{
        label: 'AXC',
        icon: axc,
        type: 'axc',
        symbol: 'AXCUSD',
    },{
        label: 'ETH',
        icon: eth,
        type: 'eth',
        symbol: 'ETHUSD',
    },{
        label: 'wAXC',
        icon: allWaxc,
        type: 'eth',
        symbol: 'wAXCUSD',
        contract: window.WAXC_CONTRACT
    },{
        label: 'wETH',
        icon: allWeth,
        type: 'axc',
        symbol: 'wETHUSD',
        contract: window.WETH_CONTRACT
    },{
        label: 'wUSDC',
        icon: allWusdc,
        type: 'axc',
        symbol: 'wUSDCUSD',
        contract: window.WUSDC_CONTRACT
    },{
        label: 'USDC',
        icon: allUsdc,
        type: 'eth',
        symbol: 'USDCUSD',
        contract: window.USDC_CONTRACT
    },{
        label: 'wUSDT',
        icon: allWusdt,
        type: 'axc',
        symbol: 'wUSDTUSD',
        contract: window.WUSDT_CONTRACT
    },{
        label: 'USDT',
        icon: allUsdt,
        type: 'eth',
        symbol: 'USDTUSD',
        contract: window.USDT_CONTRACT
    }]
}

export const currencyList: Array<Item> = [
    {
        label: 'All Chains',
        value: 'all',
        icon: all,
    },{
        label: 'Ethereum',
        value: 'eth',
        icon: eth,
    }, {
        label: 'Axiomesh',
        value: 'axc',
        icon: axc,
    }
]
