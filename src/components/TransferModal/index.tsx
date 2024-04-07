import styles from './index.less';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import ModalInputPassword from '@/components/ModalInputPassword';


const TransferModal = (props: any) => {
    const [isOpen, setIsOpen] = useState<Boolean>(props.open);
    const [pinValues, setPinValues] = useState<string>("");

    useEffect(() => {
        setIsOpen(props.open)
    },[props.open])

    const onClose = () => {
        setIsOpen(false);
    }

    const handleSubmit = (value: string) => {
        props.onSubmit(value)
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        Transfer
                        <i className={styles.transferClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 0 40px">
                        <p className={styles.transferTitle}>Transfer password verification</p>
                        <ModalInputPassword onSubmit={handleSubmit} />
                        <p className={styles.transferForget}>Forget it?</p>
                        <div className={styles.transferDetail}>
                            <h1>DETAILS</h1>
                            <div className={styles.transferSend}>
                                <div className={styles.transferSendItem}>
                                    <span className={styles.transferSendItemTitle}>Send</span>
                                    <div className={styles.transferSendItemContent}><img src={require("@/assets/token/wAXC.png")} alt=""/><span>100AXC</span></div>
                                </div>
                                <div className={styles.transferSendItem} style={{alignItems: "start"}}>
                                    <span className={styles.transferSendItemTitle}>To</span>
                                    <div className={styles.transferSendItemContent}><span className={styles.transferSendItemText}>0x25b74f0Fd6daE31b0c5Fed3cC1A1aA6826061cb7</span></div>
                                </div>
                            </div>
                            <div className={styles.transferSend} style={{borderBottom: 0, marginTop: "20px"}}>
                                <div className={styles.transferSendItem}>
                                    <span className={styles.transferSendItemTitle}>Blockchain</span>
                                    <div className={styles.transferSendItemContent}><img src={require("@/assets/token/ETH.png")} alt=""/><span>Ethereum</span></div>
                                </div>
                                <div className={styles.transferSendItem} style={{alignItems: "start"}}>
                                    <span className={styles.transferSendItemTitle}>Gas fee</span>
                                    <div className={`${styles.transferSendItemContent} ${styles.transferSendItemPrice}`}><span className={styles.transferSendItemText}>0.000001 ETH</span><span className={styles.transferSendItemNum}>$20.02</span></div>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        {/*<Button colorScheme='blue' mr={3} onClick={onClose}>*/}
                        {/*    Close*/}
                        {/*</Button>*/}
                        {/*<Button variant='ghost'>Secondary Action</Button>*/}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
};

export default TransferModal;
