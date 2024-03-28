import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import './app.less'
import '../public/env';


export const rootContainer = (container: React.ReactNode) => {
    return <ChakraProvider>{container}</ChakraProvider>
}
