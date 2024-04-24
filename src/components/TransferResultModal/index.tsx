import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import useContinueButton from "@/hooks/ContinueButton";


const TransferResultModal = (props: any) => {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [status, setStatus] = useState('');
    const [name, setName] = useState('');
    const [time, setTime] = useState<number>(3);
    const {Button} = useContinueButton();

    useEffect(() => {
        setTime(3)
        setIsOpen(props.isOpen)
    },[props.isOpen])

    useEffect(() => {
        setName(props.name)
    },[props.name])

    useEffect(() => {
        setStatus(props.status)
        if(props.status === 'success' || props.status === 'failed') {
            let t = setInterval(countDown, 1000);
            let i = 3
            function countDown() {
                setTime(i)
                if (i === 0){
                    clearInterval(t);
                    onClose();
                }
                i--;
            }
        }
    },[props.status])

    const onClose = () => {
        props.onClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalBody padding="80px 40px 0 40px">
                        {
                            status === "loading" ? <div className={styles.loading}>
                                <img src={require("@/assets/transfer/loading.png")} alt=""/>
                                <span>Transfering {name}...</span>
                            </div> : status === "success" ? <div className={styles.success}>
                                <div className={styles.successIcon}><img src={require("@/assets/transfer/success-center.png")} alt=""/></div>
                                <span>Transfer {name} success</span>
                            </div> : status === "failed" ? <div className={styles.success}>
                                <div className={`${styles.successIcon} ${styles.failedIcon}`}><img src={require("@/assets/transfer/failed-center.png")} alt=""/></div>
                                <span>Transfer {name} failed</span>
                            </div>: null
                        }
                        {status === "success" || status === "failed" ? <div style={{margin: "40px 0"}}><Button onClick={onClose}>Close ({time}s)</Button></div> : null}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )

}


export default TransferResultModal;
