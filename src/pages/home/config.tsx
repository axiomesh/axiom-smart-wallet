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
}

interface selectItem{
    eth: Array<Item | any>,
    axc: Array<Item | any>,
    all: Array<Item | any>,
}

export const selectCurrencyList: selectItem | any = {
    eth: [{
        label: 'wAXC',
        icon: waxc
    },{
        label: 'ETH',
        icon: eth,
    },{
        label: 'USDC',
        icon: usdc
    },{
        label: 'USDT',
        icon: usdt
    }],
    axc: [{
        label: 'AXC',
        icon: axc
    },{
        label: 'WETH',
        icon: weth,
    },{
        label: 'wUSDC',
        icon: wusdc,
    },{
        label: 'wUSDT',
        icon: wusdt
    }],
    all: [{
        label: 'AXC',
        icon: axc,
    },{
        label: 'wAXC',
        icon: allWaxc,
    },{
        label: 'wETH',
        icon: allWeth
    },{
        label: 'ETH',
        icon: eth,
    },{
        label: 'wUSDC',
        icon: allWusdc,
    },{
        label: 'USDC',
        icon: allUsdc,
    },{
        label: 'wUSDT',
        icon: allWusdt,
    },{
        label: 'USDT',
        icon: allUsdt,
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
