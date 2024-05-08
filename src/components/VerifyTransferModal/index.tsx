import styles from "./index.less";
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody
} from '@chakra-ui/react';
import ModalInputPassword from "@/components/ModalInputPassword";
import {history} from "umi";
import Toast from "@/hooks/Toast"

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    errorMsg: string;
    pinLoading: boolean;
}

const VerifyTransferModal = (props: Props) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState<number>(30);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {showErrorToast} = Toast();

    useEffect(() => {
    }, [])

    useEffect(() => {
        setError(props.errorMsg)
    }, [props.errorMsg])

    useEffect(() => {
        setIsLoading(props.pinLoading)
    }, [props.pinLoading])

    useEffect(() => {
        setTime(30)
        setOpen(props.isOpen)
        if(props.isOpen) {
            let t = setInterval(countDown, 1000);
            let i = 30
            function countDown() {
                setTime(i)
                if (i === 0){
                    clearInterval(t);
                    showErrorToast("Password verification timeout");
                    props.onClose();
                }
                i--;
            }
            return () => clearInterval(t);
        }
    },[props.isOpen])

    const toReset = () => {
        history.push("/reset-transfer")
    }

    return (
        <>
            <Modal isOpen={open} onClose={props.onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className={styles.payPassTitle}><span className={styles.payPassTitleBefore}>Verification</span><span className={styles.payPassTitleTime}>（{time}s）</span></div>
                        <i className={styles.payPassClose} onClick={props.onClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 40px 40px">
                        <div className={styles.payPassBody}>
                            <span className={styles.payPassTip}>Transfer password verification</span>
                            <div>
                                <ModalInputPassword isLoading={isLoading} onSubmit={props.onSubmit} isError={error} clearError={() => {setError("")}} />
                            </div>
                            {/* <span className={styles.payPassForget} onClick={toReset}>Forget it?</span> */}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default VerifyTransferModal;
