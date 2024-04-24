import React from 'react'
import { ChakraProvider } from '@chakra-ui/react';
import ClearStorageAfterTimestamp from "@/components/ClearStorage";
import {validUntil} from "@/utils/utils";
import './app.less'

export const rootContainer = (container: React.ReactNode) => {
    return <ChakraProvider>
        <ClearStorageAfterTimestamp targetTimestamp={() => validUntil()} />
        {container}
        </ChakraProvider>
}
