import { Input } from '@chakra-ui/react';
import './index.less';

const InputPro = (props: any) => {

    return (<Input
        bg="#fff"
        borderColor="#E2E8F0"
        borderRadius="12px"
        fontSize="14px"
        color="gray.700"
        className="wallet-input"
        _hover={{borderColor: 'gray.400'}}
        _active={{borderColor: 'gray.500'}}
        _focusVisible={{borderColor: 'gray.500'}}
        {...props}
    />)
}

export default InputPro;
