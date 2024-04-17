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
import useContinueButton from "@/hooks/ContinueButton";
import {history} from "umi";
interface transferProps {
    send: string;
    to: string;
    blockchain: string;
    value: string;
    gas: string;
    gasPrice: number
}

const TransferModal = (props: any) => {
    const [isOpen, setIsOpen] = useState<Boolean>(props.open);
    const [isFree, setIsFree] = useState<Boolean>(false);
    const [info, setInfo] = useState<transferProps>();
    const [error, setError] = useState<string>('');
    const {Button} = useContinueButton();

    useEffect(() => {
        const sessionKey = sessionStorage.getItem('sessionKey');
        const freeLimit = sessionStorage.getItem('freeLimit');
        if(sessionKey || freeLimit){
            setIsFree(true)
        }
    },[])

    useEffect(() => {
        setError(props.errorMsg)
    }, [props.errorMsg])

    useEffect(() => {
        setInfo(props.info)
    },[props.info])

    useEffect(() => {
        setIsOpen(props.open)
    },[props.open])

    const onClose = () => {
        props.onClose()
    }

    const handleSubmit = (value: string) => {
        props.onSubmit(value)
    }

    const handleToReset = () => {
        history.push('/reset-transfer')
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        Transfer
                        <i className={styles.transferClose} onClick={onClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 0 40px">
                        {!isFree && <><p className={styles.transferTitle}>Transfer password verification</p>
                        <ModalInputPassword onSubmit={handleSubmit} isError={error}/>
                        <p className={styles.transferForget} onClick={handleToReset}>Forget it?</p></>}
                        <div className={styles.transferDetail}>
                            <h1>DETAILS</h1>
                            <div className={styles.transferSend}>
                                <div className={styles.transferSendItem}>
                                    <span className={styles.transferSendItemTitle}>Send</span>
                                    <div className={styles.transferSendItemContent}><img src={require("@/assets/token/wAXC.png")} alt=""/><span>{info?.value}{info?.send}</span></div>
                                </div>
                                <div className={styles.transferSendItem} style={{alignItems: "start"}}>
                                    <span className={styles.transferSendItemTitle}>To</span>
                                    <div className={styles.transferSendItemContent}><span className={styles.transferSendItemText}>{info?.to}</span></div>
                                </div>
                            </div>
                            <div className={styles.transferSend} style={{borderBottom: 0, marginTop: "20px"}}>
                                <div className={styles.transferSendItem}>
                                    <span className={styles.transferSendItemTitle}>Blockchain</span>
                                    <div className={styles.transferSendItemContent}><img src={info?.blockchain === "Axiomesh" ? require("@/assets/token/AXC.png") : require("@/assets/token/ETH.png")} alt=""/><span>{info?.blockchain}</span></div>
                                </div>
                                <div className={styles.transferSendItem} style={{alignItems: "start"}}>
                                    <span className={styles.transferSendItemTitle}>Gas fee</span>
                                    <div className={`${styles.transferSendItemContent} ${styles.transferSendItemPrice}`}><span className={styles.transferSendItemText}>{info?.gas} {info?.send}</span><span className={styles.transferSendItemNum}>$ {info?.gasPrice}</span></div>
                                </div>
                            </div>
                            {isFree && <div><Button onClick={() => handleSubmit("")}>Confirm</Button></div>}
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
