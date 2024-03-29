import React, {useState} from 'react';
import { selectCurrencyList } from '../config';
import { Flex,  Image, Box } from '@chakra-ui/react'
import { toThousands } from '@/utils/help';

type Props = {
    activeKey: string;
};

function Loading (props: any) {
    return <div className='loader' {...props}></div>
}
const TokenList = ({activeKey}: Props) => {
    const [loading, setLoading] = useState(true);
    const list = selectCurrencyList[activeKey];
    console.log(list);
    return (
        <div>
            <Box w="100%">
                {
                    list.map(item =>  <Flex
                        align="center"
                        w="100%"
                        bg="#fff"
                        borderRadius="20px"
                        border="1px solid rgba(236, 201, 75, 0.2)"
                        p="15px 20px 15px 8px"
                        mb="8px"
                        h="64px"
                        boxSizing='border-box'
                    >
                        <Image
                            boxSize='40px'
                            borderRadius='12px'
                            src={item.icon}
                            alt='avatar'
                            mr='16px'
                        />
                        <Box flex='1'>
                            <Flex w="100%" justify='space-between' color="gray.700" fontWeight="500" fontSize="16px" lineHeight="19px">
                                <Box>{item.label}</Box>
                                <Box>{loading ?  <Loading style={{marginRight: 10}} /> : toThousands(500)}</Box>
                            </Flex>
                            <Flex w="100%" justify='space-between' color="gray.500" fontSize="12px" lineHeight="14.5px">
                                <Box>{loading ?  <Loading style={{marginLeft: 10, marginTop: 5}} /> : toThousands(1, true)}</Box>
                                <Box>{loading ?  <Loading style={{marginRight: 10, marginTop: 5}} /> : toThousands(500, true)}</Box>
                            </Flex>
                        </Box>
                    </Flex>)
                }
            </Box>
        </div>
    )
}

export  default TokenList;
