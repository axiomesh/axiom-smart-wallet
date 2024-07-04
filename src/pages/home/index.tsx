import React, {useEffect, useState} from "react";
import { Menu, Flex, MenuButton, MenuList, MenuItem, Button, Image, Box, Divider,
    Tabs, TabList,  Tab, Tooltip,
} from '@chakra-ui/react'
import styles from './index.less';
import {currencyList, selectCurrencyList} from './config';
import { SelectDownIcon } from '@/components/Icons';
import TokenList from './componment/tokenList';
import {changePrice, getImgFromHash, changeBalance} from "@/utils/help";
import {getTickerPrice} from "@/services/login";
import { ethers } from "ethers";
// @ts-ignore
import { ERC20_ABI } from 'axiom-smart-account-test'
import {connect} from "umi";
const Decimal = require('decimal.js');

interface Item {
    label: string
    icon: string | any
    value?: string
    price?: string | number | any
    symbol?: string;
    type: string;
    balance?:string | number | any
    total?: string | number | any
    totalValue?: string | number | any
}

interface CurrentItem {
    label: string
    icon: string | any
    value?: string | any
    symbol?: string
}
const Home = (props:any) => {
    const { userInfo } = props;
    const [activeKey, setActiveKey] = useState('axc');
    const activeList = currencyList.filter(item => item.value === activeKey)[0];
    const [activeType, setActiveType] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [priceList, setPriceList] = useState<Array<Item>>([]);
    const [selectList, setSelectList] = useState<Array<Item>>(selectCurrencyList.all);
    const [total, setTotal] = useState<number | string | any>(0);
    // @ts-ignore
    const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
    // @ts-ignore
    const provider = new ethers.providers.JsonRpcProvider(window.ETH_RPC);
    const handleActiveClick = (value: string) => {
        setActiveKey(value)
    }

    const handleChangeType = (key: number) => {
        if(key) return;
        setActiveType(key);
    }

    const getSymbol = async (erc20:any, currentProvider:any) => {
        const symboldata = erc20.interface.encodeFunctionData('decimals');
        const symbolRes = await currentProvider.call({
            to: erc20.address,
            data: symboldata,
            // value: 0,
        })
        return  Math.pow(10, Number(symbolRes === '0x' ? 0 : BigInt(symbolRes).toString()))
    }

    const initBalance = async (type:string | any) => {
        // @ts-ignore

        if(type === 'AXCUSD'){
            const balance = await rpc_provider.getBalance(userInfo.address);
            // @ts-ignore
            // return balance.toBigInt().toString() / Math.pow(10, window.AXC_SYMBOL)
            return ethers.utils.formatUnits(balance, window.AXC_SYMBOL)
        } else if(type === 'ETHUSD'){
            let balance = await provider.getBalance(userInfo.address);
            // @ts-ignore
            return balance.toBigInt().toString() / Math.pow(10,window.ETH_SYMBOL)
        } else {
            const allList = selectCurrencyList.all;
            const filterData = allList.filter((item: Item) => item.symbol === type)[0];
            const currentProvider = filterData.type === 'eth' ? provider : rpc_provider;
            // return 0
            const erc20 = new ethers.Contract(filterData.contract, ERC20_ABI, currentProvider);
            // const calldata = erc20.interface.encodeFunctionData('balanceOf',[userInfo.address]);
            // const res = await currentProvider.call({
            //     to: erc20.address,
            //     data: calldata,
            // })
            const balance = await erc20.balanceOf(userInfo.address);
            const balanceStr = ethers.utils.formatUnits(balance, await erc20.decimals())
            console.log(balanceStr)
            // const decimals = await getSymbol(erc20, currentProvider)
            // @ts-ignore
            return balanceStr;
        }
    }

    const initTicketData = async() => {
        try{
            setLoading(true)
            const res = await getTickerPrice();
            const promises = res.map(async (item:CurrentItem)  => {
                const balance = await initBalance(item.symbol);
                // @ts-ignore
                return {...item, balance, total: balance * item.price}
            })

            const list = await Promise.all(promises);
            setPriceList(list)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(userInfo?.address){
            initTicketData()
        }
    }, [userInfo?.address]);
    const sumArrayObjects = (arr:Array<Item>) => {
        return arr.reduce((accumulator, obj) => accumulator.add(new Decimal(obj.totalValue)), new Decimal(0));
        // return arr.reduce((accumulator, obj) => accumulator + obj.totalValue, 0);
    }

    useEffect(() => {
        // if(priceList && priceList.length){
            const list = selectCurrencyList[activeKey];
            const newList = [...list].map( (item, index) => {
                const priceDataItem: Item = priceList.filter(li => li.symbol?.toLowerCase() === item.symbol.toLowerCase())[0];
                return  {
                    ...item,
                    balance: changeBalance(priceDataItem?.balance, false),
                    price: changePrice(Number(priceDataItem?.price || 0)),
                    total: changePrice(Number(priceDataItem?.total || 0)),
                    totalValue: Number(priceDataItem?.total || 0),
                }
            })

            const totalValue = sumArrayObjects(newList);

            setTotal(changePrice(totalValue, true))

            setSelectList(newList.sort((a, b) => b.totalValue - a.totalValue))
        // }
    }, [priceList, activeKey]);

    return (
        <div className={styles.homePage}>
            <Box mb="20px">
                <Menu>
                    {/*<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>*/}
                    <MenuButton
                        bg='#F7FAFC'
                        as={Button}
                        w="150px"
                        rightIcon={<SelectDownIcon className='select_down_icon' w='12px' />}
                        borderRadius="20px"
                        border="1px solid #EDF2F7"
                        h="40px"
                        _hover={{bg: 'gray.100', borderColor: 'gray.200'}}
                        _active={{bg: 'gray.200', borderColor: 'gray.300'}}
                    >
                        <Flex align="center">
                            <Image
                                boxSize='24px'
                                borderRadius='full'
                                src={activeList.icon}
                                alt={activeList.label}
                                mr='8px'
                            />
                            <span style={{fontSize: 14}}> {activeList.label}</span>
                        </Flex>
                    </MenuButton>

                    <MenuList borderRadius="20px" p='24px' w="280px">
                        {currencyList.map((item: CurrentItem, index: Number) => <MenuItem
                            onClick={() => handleActiveClick(item.value)}
                            bg={activeKey === item.value ? 'gray.100' : ''}
                            _hover={{bg: activeKey === item.value ? '' : 'gray.100'}}
                            p="16px"
                            mb={index !== currencyList.length -1 ? '4px' : '0px'}
                            boxSizing='border-box'
                            borderRadius="12px"
                            value={item.value}
                            h="72px"
                            minH="72px"
                        >
                            <Image
                                boxSize='40px'
                                borderRadius='full'
                                src={item.icon}
                                alt={item.label}
                                mr='8px'
                            />
                            <span style={{fontSize: 16, fontWeight: 500, color: '#292D32'}}>{item.label}</span>
                        </MenuItem>)}
                    </MenuList>
                </Menu>
            </Box>
            <Flex align='center' mb="20px">
                {/*@ts-ignore */}
                <Image boxSize='112px' borderRadius='12px' src={getImgFromHash(userInfo.address)} alt='avatar' mr='8px'/>
                <Box color="text.50" fontWeight="700">
                    <Box fontSize="18px" lineHeight="28px" mb="6px">TOTAL VALUE</Box>
                    {loading ? <div className='big-loader' style={{marginLeft: 22}}></div> :
                        <Box fontSize='40px' lineHeight="48px">{total || '$0'}</Box>}
                </Box>
            </Flex>
            <Box mb="20px">
                <Divider />
            </Box>
            <Flex gap="20px" pb="40px">
                <Box flex={1}>
                    <Tabs colorScheme='gray.300' index={activeType} onChange={handleChangeType} mb="20px" variant="unstyled">
                        <TabList>
                            <Tab fontWeight="700" fontSize="18px" color='grey.700' p="0 32px 0 0">TOKEN</Tab>
                            <Tab fontWeight="700" fontSize="18px" color="gray.300" p="0 32px 0 0">
                                <Tooltip hasArrow label='Coming soon' fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top">
                                    NFT
                                </Tooltip>
                            </Tab>
                        </TabList>
                    </Tabs>
                    <Box>
                        <TokenList list={selectList} loading={loading}/>
                    </Box>
                </Box>
                <Box>
                    <Box fontWeight="700" fontSize="18px" color='grey.700' mb="20px">RECENT TRANSACTIONS</Box>
                    <Flex
                        align="center"
                        justify='center'
                        w='328px'
                        h='280px'
                        bg="#fff"
                        border="1px solid rgba(236, 201, 75, 0.2)"
                        borderRadius='20px'
                    >
                        <Box >
                            <Box fontSize='32px' textAlign="center" mb="8px">⚙️</Box>
                            <Box color="gray.500" fontWeight='500' fontSize='16px'>Coming Soon</Box>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Home)
