import React, {useEffect, useState} from "react";
import { Menu, Flex, MenuButton, MenuList, MenuItem, Button, Image, Box, Divider,
    Tabs, TabList,  Tab, Tooltip,
} from '@chakra-ui/react'
import styles from './index.less';
import {currencyList, selectCurrencyList} from './config';
import { SelectDownIcon } from '@/components/Icons';
import TokenList from './componment/tokenList';
import {changePrice, getImgFromHash, toThousands} from "@/utils/help";
import {getTickerPrice} from "@/services/login";
import { ethers } from "ethers";
// @ts-ignore
import { ERC20_ABI } from 'axiom-smart-account-test'
import {connect} from "umi";

interface Item {
    label: string
    icon: string | any
    value?: string
    price?: string | number | any
    symbol?: string;
    type: string;
    balance?:string | number | any
    total?: string | number | any
}

interface CurrentItem {
    label: string
    icon: string | any
    value?: string | any
    symbol?: string
}
const Home = (props:any) => {
    const { userInfo } = props;
    const [activeKey, setActiveKey] = useState('all');
    const activeList = currencyList.filter(item => item.value === activeKey)[0];
    const [activeType, setActiveType] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [priceList, setPriceList] = useState<Array<Item>>([]);
    const [selectList, setSelectList] = useState<Array<Item>>(selectCurrencyList.all);
    const [total, setTotal] = useState<number | string | any>(0);
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
        const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
        // @ts-ignore
        const provider = new ethers.providers.JsonRpcProvider(window.ETH_RPC);
        const address = '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013';
        if(type === 'AXCUSD'){
            const balance = await rpc_provider.getBalance(userInfo.address);
            // const balance = await rpc_provider.getBalance(address);
            // @ts-ignore
            return balance.toBigInt().toString() / Math.pow(10, window.AXC_SYMBOL)
        } else if(type === 'ETHUSD'){
            let balance = await provider.getBalance(userInfo.address);
            // let balance = await provider.getBalance(address);
            // @ts-ignore
            return balance.toBigInt().toString() / Math.pow(10,window.ETH_SYMBOL)
        } else {
            const allList = selectCurrencyList.all;
            const filterData = allList.filter((item: Item) => item.symbol === type)[0];
            const currentProvider = filterData.type === 'eth' ? provider : rpc_provider;
            // return 0
            const erc20 = new ethers.Contract(filterData.contract, ERC20_ABI);
            const calldata = erc20.interface.encodeFunctionData('balanceOf',[userInfo.address]);
            // const calldata = erc20.interface.encodeFunctionData('balanceOf',[address]);

            const res = await currentProvider.call({
                to: erc20.address,
                data: calldata,
            })
            const decimals = await getSymbol(erc20, currentProvider)
            // @ts-ignore
            return (res === '0x' ? 0 : BigInt(res).toString() / decimals)
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

    useEffect(() => {
        if(priceList && priceList.length){
            const list = selectCurrencyList[activeKey];
            const newList = [...list].map(item => {
                const priceDataItem: Item = priceList.filter(li => li.symbol?.toLowerCase() === item.symbol.toLowerCase())[0];
                return  {
                    ...item,
                    balance: changePrice(Number(priceDataItem.balance), false),
                    price: changePrice(Number(priceDataItem.price)),
                    total: changePrice(Number(priceDataItem.total)),
                }
            })

            setSelectList(newList)
        }
    }, [priceList, activeKey]);

    return (
        <div className={styles.homePage}>
            <Box mb="20px">
                <Menu>
                    {/*<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>*/}
                    <MenuButton
                        bg='#EDF2F7'
                        as={Button}
                        w="150px"
                        rightIcon={<SelectDownIcon className='select_down_icon' w='12px' />}
                        borderRadius="20px"
                        h="40px"
                        _hover={{bg: '#E2E8F0'}}
                        _active={{bg: '#CBD5E0'}}
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
                        {currencyList.map((item: CurrentItem) => <MenuItem
                            onClick={() => handleActiveClick(item.value)}
                            bg={activeKey === item.value ? 'gray.100' : ''}
                            _hover={{bg: activeKey === item.value ? '' : 'gray.100'}}
                            p="16px"
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
                    <Box fontSize='40px' lineHeight="48px">{toThousands(total, true)}</Box>
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