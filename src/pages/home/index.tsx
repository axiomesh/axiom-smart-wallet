import React, { useState } from "react";
import { Menu, Flex, MenuButton, MenuList, MenuItem, Button, Image, Box, Divider,
    Tabs, TabList,  Tab, Tooltip,
} from '@chakra-ui/react'
import styles from './index.less';
import { currencyList } from './config';
import { SelectDownIcon } from '@/components/Icons';
import TokenList from './componment/tokenList';
import {getImgFromHash, toThousands} from "@/utils/help";
const Home = () => {
    const [activeKey, setActiveKey] = useState('all');
    const activeList = currencyList.filter(item => item.value === activeKey)[0];
    const [activeType, setActiveType] = useState(0);
    const handleActiveClick = (value: string) => {
        setActiveKey(value)
    }

    const handleChangeType = (key: number) => {
        if(key) return;
        setActiveType(key);
    }

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
                        {currencyList.map(item => <MenuItem
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
                <Image boxSize='112px' borderRadius='12px' src={getImgFromHash(window.testAddress)} alt='avatar' mr='8px'/>
                <Box color="text.50" fontWeight="700">
                    <Box fontSize="18px" lineHeight="28px" mb="6px">TOTAL VALUE</Box>
                    <Box fontSize='40px' lineHeight="48px">{toThousands(1445000, true)}</Box>
                </Box>
            </Flex>
            <Box mb="20px">
                <Divider />
            </Box>
            <Flex gap="20px">
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
                        <TokenList activeKey={activeKey} />
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

export default Home;
