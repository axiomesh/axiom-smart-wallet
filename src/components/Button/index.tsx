import { Button } from '@chakra-ui/react'

const ButtonPro = (props: any) => {
    const { children, ...extra } = props;

    return (<Button
        color='#fff'
        bg='yellow.400'
        width="100%"
        borderRadius="56px"
        fontSize="16px"
        fontWeight="500"
        height="56px"
        variant='solid'
        spinnerPlacement='end'
        loadingText={children}
        _hover={{
            bg: 'yellow.300'
        }}
        _active={{bg: 'yellow.600'}}
        _focusVisible={{bg: 'yellow.600'}}
        _disabled={{
            opacity: 0.5,
            bg: 'yellow.400'
        }}
        {...extra}
    >{ children }</Button>)
}

export default ButtonPro;
