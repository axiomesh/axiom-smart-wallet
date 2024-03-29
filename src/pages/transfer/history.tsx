import styles from './index.less'
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Tooltip, Flex, Image, Box, Skeleton } from '@chakra-ui/react'
import React, {useEffect, useState} from "react";
import Page from "@/components/Page";
import PaginationPro from '@/components/Pagination';
import { ProgressIcon, SuccessIcon, FailIcon } from '@/components/Icons';
import dayjs from '@/utils/dayjs';
import Copy from '@/components/Copy';
import {exchangeAddress, getMail} from '@/utils/help';
import MainTag from '@/components/Tag/main';
import { selectCurrencyList } from '../home/config';
import eth from '@/assets/currency/eth/eth.png';
import axc from '@/assets/currency/axc/axc.png';
import empty from '@/assets/empty.png';
import {getHistoryList} from "@/services/transfer";

interface ListItem {
    to_address: string;
    chain_type: number | string;
    token_name: string;
    value: string | number,
    transaction_status: string | number | any,
    transaction_time: number,
    transaction_hash: string,
    url: string;
}
const TransferHistory = () => {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const skeletonList = [{}, {}, {}, {}, {}];
    const [list, setList] = useState<Array<ListItem>>([{
        "to_address": "DCRFRDFERFRFRFRFSCSFVR",
        "chain_type": 1,
        "token_name": "WETH",
        "value": 19000000000000000,
        "transaction_status": 0,
        "transaction_time": 111,
        "transaction_hash":"111322",
        "url": ''
    }]);
    const [current, setCurrent] = useState(1);
    const [total, setTotal] = useState(0);

    const statusList = [
        <Tooltip key="icon0" hasArrow fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top" label='Pending'>
            <ProgressIcon fontSize={22} width={22}/>
        </Tooltip>,
        <Tooltip key="icon1"  hasArrow fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top" label='Success'>
            <SuccessIcon fontSize={22} width={22} />
        </Tooltip>,
        <Tooltip key="icon2"  hasArrow fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top" label='Failed'>
            <FailIcon fontSize={22} width={22} />
        </Tooltip>
    ];

    const initData = async (cur: number) => {
        const params = { page: cur, size: 10, email};
        try{
            setLoading(true)
            setCurrent(cur)
            const res = await getHistoryList(params);
            setTotal(res.total);
            setList(res.list);
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
    },[])

    const getIcon = (tokenName: string) => {
        const allList = [...selectCurrencyList.eth, ...selectCurrencyList.axc];
        const filterList = allList.filter(item => item.label === tokenName);
        return filterList[0].icon;
    }

    const handleHashClick = (item: ListItem) => {
        // 0: Axiomesh, 1 : Ethereum
        if(item.chain_type === 1){

        } else {

        }
    }

    const handlePageChange = (page: number) => {
        if(loading) return;
        initData(page)
    }

    return (
        <Page needBack>
            <div>
                <div className='page-title'>Transaction history</div>
                <div className={styles.history}>
                    <div>
                        <TableContainer>
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th fontFamily="Inter" textTransform='none' color="#4A5568" fontSize="14px" fontWeight="700">Transaction Hash</Th>
                                        <Th fontFamily="Inter" textTransform='none' color="#4A5568" fontSize="14px" fontWeight="700">Value</Th>
                                        <Th fontFamily="Inter" textTransform='none' color="#4A5568" fontSize="14px" fontWeight="700">To</Th>
                                        <Th fontFamily="Inter" textTransform='none' color="#4A5568" fontSize="14px" fontWeight="700">Time</Th>
                                        <Th fontFamily="Inter" textTransform='none' color="#4A5568" fontSize="14px" fontWeight="700">Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {loading ? skeletonList.map(item => <Tr h="72px" lineHeight="72px">
                                        <Td><Skeleton height='20px' /></Td>
                                        <Td><Skeleton height='20px' /></Td>
                                        <Td><Skeleton height='20px' /></Td>
                                        <Td><Skeleton height='20px' /></Td>
                                        <Td><Skeleton height='20px' /></Td>
                                    </Tr>) : list.length ? list.map((item: ListItem) => <Tr _hover={{bg: 'rgba(236, 201, 75, 0.1)'}} h="72px" lineHeight="72px">
                                        <Td>
                                            <Flex align='center'>
                                                <Image
                                                    boxSize='24px'
                                                    borderRadius='full'
                                                    // 0: Axiomesh, 1 : Ethereum
                                                    src={item.chain_type === 1 ? eth : axc}
                                                    alt='avatar'
                                                    mr='8px'
                                                />
                                                <MainTag onClick={() => {handleHashClick(item)}} text={exchangeAddress(item.transaction_hash)} fullData={item.transaction_hash} mr='8px' />
                                                <Copy text={item.transaction_hash} />
                                            </Flex>
                                        </Td>
                                        <Td>
                                            <Flex align='center'>
                                                <span>{item.value}</span>
                                                <Tooltip hasArrow fontSize="14px" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="top" label={item.token_name}>
                                                    <Image
                                                        boxSize='24px'
                                                        borderRadius='full'
                                                        src={getIcon(item.token_name)}
                                                        alt='avatar'
                                                        ml='8px'
                                                    />
                                                </Tooltip>
                                            </Flex>
                                        </Td>
                                        <Td>
                                            <Flex align='center'>
                                                <Box mr="8px">{item.url ? item.url : exchangeAddress(item.to_address)}</Box>
                                                <Copy text={item.url ? item.url : item.to_address} />
                                            </Flex>
                                        </Td>
                                        <Td>{dayjs(item.transaction_time).utc().format('llll')}</Td>
                                        <Td>{statusList[item.transaction_status]}</Td>
                                    </Tr>) : <Tr>
                                        <Td colSpan={5} border="0">
                                            <Flex justify="center" w="100%" p="110px">
                                                <Box>
                                                    <Image
                                                        w="220px"
                                                        src={empty}
                                                    />
                                                    <Box color="gray.900" fontWeight='600' fontSize="18px">No transaction history yet</Box>
                                                </Box>
                                            </Flex>
                                        </Td>
                                    </Tr>}
                                </Tbody>
                            </Table>
                        </TableContainer>
                    </div>
                    {!loading && list.length ? <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end'}}>
                        <PaginationPro
                            current={current}
                            total={total}
                            onChange={handlePageChange}
                        />
                    </div> : null}
                </div>
            </div>
        </Page>
    )
}

export default TransferHistory;
