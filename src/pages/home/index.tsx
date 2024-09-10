import React, {useEffect, useState} from "react";
import { Menu, Flex, MenuButton, MenuList, MenuItem, Button, Image, Box, Divider,
    Tabs, TabList,  Tab } from '@chakra-ui/react'
import styles from './index.less';
import {currencyList, PayStatus, selectCurrencyList} from './config';
import { SelectDownIcon } from '@/components/Icons';
import TokenList from './componment/tokenList';
import {changePrice, getImgFromHash, changeBalance} from "@/utils/help";
import {getNftList, getTickerPrice} from "@/services/login";
import {ethers, JsonRpcProvider} from "ethers";
import { formatUnits, formatEther } from 'viem'
// @ts-ignore
import { ERC20_ABI } from '@/utils/abi';
import SkeletonCard from './componment/skeleton-card';
import Empty from "./componment/empty";
import DAppCard from './componment/dApp-card'
import ScrollLoader from './componment/scroll-bar';
import {connect, history} from "umi";
const Decimal = require('decimal.js');
const tabList = [{name: 'ERC721', type: 'ERC-721'}, {name: 'ERC1155', type: 'ERC-1155'}];

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
    const [nftList, setNftList] = useState([]);
    const [selectList, setSelectList] = useState<Array<Item>>(selectCurrencyList.all);
    const [total, setTotal] = useState<number | string | any>(0);
    const [num, setNum] = useState(3);
    const [current, setCurrent] = useState(1);
    const [nextPageParams, setPageParams] = useState({});
    const [activeTab, setActiveTab] = useState('ERC-721');
    const [nftLoading, setNftLoading] = useState(false);
    const [h, setH] = useState(0);
    // @ts-ignore
    const rpc_provider = new JsonRpcProvider(window.RPC_URL);
    // @ts-ignore
    const provider = new JsonRpcProvider(window.ETH_RPC);
    const handleActiveClick = (value: string) => {
        setActiveKey(value);
        setActiveTab('ERC-721');
    }

    const handleChangeType = (key: number) => {
        setActiveType(key);
        if(key){
            setActiveTab('ERC-721');
            initNftList('ERC-721');
        }
    }

    const initNftList = async (type) => {
        try {
            setNftLoading(true);
            const addr = type === 'ERC-721' ? window.NFT_CONTRACT_721 : window.NFT_CONTRACT_1155;
            const res = await getNftList(addr);
            //
            if(res.data){
                const nftRes = res.data;
                const fitlerData = (nftRes.items || []).filter(li => li?.owner?.hash === userInfo.address);
                // const fitlerData = (nftRes.items || []).filter(li => li?.owner?.hash === '0xDb543662a4f4Ae138b773782f19C5dd4C2298642');
                if(fitlerData.length > 0){
                    const w = document.getElementById('outlet')?.clientWidth;
                    const activeW = w - 80 - 328;
                    const max = parseInt(activeW / 242);
                    setH(Math.ceil(fitlerData.length / max) * 300);
                    setNftList(fitlerData)
                    setPageParams(nftRes.next_page_params);
                } else {
                    setNftList([])
                    setPageParams(null)
                }
            } else {
                setNftList([])
                setPageParams(null)
            }
        } finally {
            setNftLoading(false)
        }
    }

    const initBalance = async (type:string | any) => {
        // @ts-ignore

        if(type === 'AXCUSD'){
            const balance = await rpc_provider.getBalance(userInfo.address);
            // @ts-ignore
            return formatUnits(balance, window.AXC_SYMBOL)
        } else if(type === 'ETHUSD'){
            let balance = await provider.getBalance(userInfo.address);
            // @ts-ignore
            return formatEther(balance, window.ETH_SYMBOL)
        } else {
            const allList = selectCurrencyList.all;
            const filterData = allList.filter((item: Item) => item.symbol === type)[0];
            const currentProvider = filterData.type === 'eth' ? provider : rpc_provider;
            // return 0
            const erc20 = new ethers.Contract(filterData.contract, ERC20_ABI, currentProvider);
            const balance = await erc20.balanceOf(userInfo.address);
            const decimals = await erc20.decimals();
            const formatUnitsDe = formatUnits(decimals, 0);
            const balanceStr = formatUnits(balance, Number(formatUnitsDe))
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

    const loadMoreItems = async (page) => {
        if(nextPageParams){
            try {
                setNftLoading(true);
                const addr = activeTab === 'ERC-721' ? window.NFT_CONTRACT_721 : window.NFT_CONTRACT_1155;
                const res = await getNftList(addr, {...nextPageParams, page});
                setCurrent(page);
                if(res.data){
                    const nftRes = res.data;
                    const fitlerData = (nftRes.items || []).filter(li => li?.owner?.hash === userInfo.address);
                    // const fitlerData = (nftRes.items || []).filter(li => li?.owner?.hash === '0xDb543662a4f4Ae138b773782f19C5dd4C2298642');
                    let activeList = nftList;
                    if(fitlerData.length > 0){
                        activeList = [...nftList, ...fitlerData]
                        setPageParams(nftRes.next_page_params)
                    } else {
                        setPageParams(nftRes.next_page_params)
                    }

                    const w = document.getElementById('outlet')?.clientWidth;
                    const activeW = w - 80 - 328;
                    const max = parseInt(activeW / 242);
                    setH(Math.ceil(activeList.length / max) * 300);
                    setNftList(activeList)

                } else {
                    setNftList(nftList)
                    setPageParams(null)
                }
            } finally {
                setNftLoading(false)
            }
        }

    };

    const handleTabChange = (type) => {
        setActiveTab(type);
        initNftList(type);
    }

    return (
        <div className={styles.homePage} style={{height: h}}>
            <Box mb="20px">
                <Menu>
                    {/*<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>*/}
                    <MenuButton
                        bg='#F7FAFC'
                        as={Button}
                        w="160px"
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
                <Image boxSize='112px' borderRadius='12px' src={getImgFromHash(userInfo?.address || '')} alt='avatar' mr='8px'/>
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
                    <Tabs index={activeType} onChange={handleChangeType} mb="20px" variant="unstyled">
                        <TabList>
                            <Tab
                                fontWeight="700"
                                fontSize="18px"
                                p="0 32px 0 0"
                                color='gray.300'
                                _hover={{color: "#2D3748" }}
                                _selected={{ color: "#2D3748"}}
                            >TOKEN</Tab>
                            <Tab
                                fontWeight="700"
                                fontSize="18px"
                                p="0 32px 0 0"
                                color='gray.300'
                                _hover={{color: "#2D3748" }}
                                _selected={{ color: "#2D3748"}}
                            >
                                NFT
                            </Tab>
                        </TabList>
                    </Tabs>
                    {activeType === 0 ? <Box>
                        <TokenList list={selectList} loading={loading}/>
                    </Box> : null}
                    {activeKey === 'eth' ? <Box textAlign='center' mt='150px'>
                        <Flex w='70px' h='70px' borderRadius='50%' bg='#EDF2F7' align='center' justify='center' margin='0 auto'>
                            <Box fontSize='32px'>⚙️</Box>
                        </Flex>
                        <Box color="gray.500" fontWeight='500' fontSize='16px' mt='8px'>Coming Soon</Box>
                    </Box> : activeType === 1 ? <Box>
                        <div style={{display: 'flex', margin: '20px 0'}}>
                            <div className={styles.tabList}>
                                {tabList.map((item, index) => (
                                    <div
                                        key={item.type}
                                        className={activeTab === item.type ? 'tab-active' : 'tab'}
                                        onClick={() => handleTabChange(item.type)}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {nftList?.length || nftLoading ? <div>
                            {/*{list.map(item => <DAppCard item={item} isHome/>)}*/}
                            <div className='dapp-list'>
                                {current === 1 && nftLoading ? <>
                                        <SkeletonCard />
                                        <SkeletonCard />
                                        <SkeletonCard />
                                    </> : null}
                                {!nftLoading ? [...nftList].map(item => <DAppCard type={activeTab} item={item} isHome/>) : null}
                            </div>
                            <ScrollLoader
                                firstLoading={nftLoading}
                                current={current}
                                loadMore={loadMoreItems}
                                hasMore={nextPageParams}
                            />
                        </div> : <Empty title="No results" />}

                    </Box> : null}
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

            {userInfo.pay_password_set_status === PayStatus.init ? <div className={styles.bottom}>
                <Flex align='center' gap="8px">
                    <div className={styles.bottomIcon}>!</div>
                    <div className={styles.bottomTitle}>Improve account security </div>
                </Flex>
                <div style={{marginTop: 12, marginBottom: 20}}>Please set your transfer password promptly to enhance the security level of your account.</div>
                <div>
                    <span className='a_link' onClick={() => history.push('/transfer')}>Go to set</span>
                </div>
            </div> : null}
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Home)
