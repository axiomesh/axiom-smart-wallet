import { useToast, Box } from '@chakra-ui/react'
import styles from './index.less'

interface ToastHook {
    showSuccessToast: (message: string) => void;
    showErrorToast: (message: string) => void;
    showWarningToast: (message: string) => void;
}

interface propsInter {
    color: string,
    padding: string,
    fontSize: string,
    fontWeight: string,
    borderRadius: string,
    display: string,
    alignItems: string
}

const useToastHook = (): ToastHook => {
    const toast = useToast();

    const successProps:propsInter = {
        color: "white",
        padding: "12px 16px",
        fontSize: "16px",
        fontWeight: "700",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center"
    }

    const showSuccessToast = (message: string) => {
        toast({
            title: message,
            status: "success",
            duration: 3000,
            isClosable: true,
            position: 'top',
            render: () => (
                <Box {...successProps} bg="#38A169">
                    <img className={styles.image} src={require('@/assets/toast-success.png')} alt=""/>{message}
                </Box>
            )
        });
    };

    const showErrorToast = (message: string) => {
        toast({
            title: message,
            status: "error",
            duration: 3000,
            isClosable: true,
            position: 'top',
            render: () => (
                <Box {...successProps} bg='#DD6B20'>
                    <img className={styles.image} src={require('@/assets/toast-warn.png')} alt=""/>{message}
                </Box>
            )
        });
    };

    const showWarningToast = (message: string) => {
        toast({
            title: message,
            status: "warning",
            duration: 3000,
            isClosable: true,
            position: 'top',
            render: () => (
                <Box {...successProps} bg="#DD6B20">
                    <img className={styles.image} src={require('@/assets/toast-warn.png')} alt=""/>{message}
                </Box>
            )
        });
    };

    return { showSuccessToast, showErrorToast, showWarningToast };
};

export default useToastHook;
