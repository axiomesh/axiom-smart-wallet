import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'


export const rootContainer = (container: React.ReactNode) => {
    return <ChakraProvider>{container}</ChakraProvider>
}
