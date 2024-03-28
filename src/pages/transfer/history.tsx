import styles from './index.less'
import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    InputRightElement,
    InputGroup
} from '@chakra-ui/react';
import Select, {components} from 'react-select';
import useContinueButton from "@/hooks/ContinueButton";
import React, {useState, useEffect} from "react";
import {token} from "@/utils/tokenList";
import Page from "@/components/Page";
import PaginationPro from '@/components/Pagination';

interface token {
    value: string;
    label: string;
    icon: JSX.Element;
}

const TransferHistory = () => {

    useEffect(() => {
    },[])

    return (
        <Page needBack>
            <div>
                <div className='page-title'>Transaction history</div>
                <div>
                    <PaginationPro current={500} />
                </div>
            </div>
        </Page>
    )
}

export default TransferHistory;
