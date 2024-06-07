import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import useContinueButton from "@/hooks/ContinueButton";


const BioResultModal = (props: any) => {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [status, setStatus] = useState('');
    const [tip, setTip] = useState('');
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
        setTip(props.loadingTip)
    }, [props.loadingTip])

    useEffect(() => {
        setStatus(props.status)
        if(props.status === 'success' || props.status === 'failed') {
            let t = setInterval(countDown, 1000);
            let i = 1
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

    const onVerify = () => {
        props.onVerify()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalBody padding="40px">
                        <div className={styles.bioResultModal}>
                            {
                                status === "loading" ? <div className={styles.loading}>
                                    <img src={require("@/assets/transfer/bio-loading.png")} alt=""/>
                                    <span>Authentication</span>
                                </div> : status === "success" ? <div className={styles.success}>
                                    <div className={styles.successIcon}><img src={require("@/assets/transfer/bio-success.png")} alt=""/></div>
                                    <span>Authentication success</span>
                                </div> : status === "first" ? <div className={styles.success}>
                                    <div className={styles.successIcon}><img src={require("@/assets/transfer/bio-success.png")} alt=""/></div>
                                    <span>Welcome to AxiomWallet</span>
                                </div> : status === "back" ? <div className={styles.success}>
                                    <div className={styles.successIcon}><img src={require("@/assets/transfer/bio-success.png")} alt=""/></div>
                                    <span>Welcome Back</span>
                                </div> : status === "opened" ? <div className={styles.success}>
                                    <div className={styles.successIcon}><img src={require("@/assets/transfer/bio-success.png")} alt=""/></div>
                                    <span>Authentication success</span>
                                    <div className={styles.successText}>Open Bio-Payment for password-free transfer</div>
                                </div> : status === "failed" ? <div className={styles.success}>
                                    <div className={`${styles.successIcon} ${styles.failedIcon}`}><img style={{width: '110px', height: '110px'}} src={require("@/assets/transfer/bio-failed.png")} alt=""/></div>
                                    <span>Authentication failed</span>
                                    <div className={styles.successText}>Please try again later</div>
                                    <div className={styles.successBtn} onClick={onClose}>Dismiss</div>
                                </div> : status === "cancel" ? <div className={styles.success}>
                                    <div className={`${styles.successIcon} ${styles.failedIcon}`}><img style={{width: '110px', height: '110px'}} src={require("@/assets/transfer/bio-failed.png")} alt=""/></div>
                                    <span>You canceled or timeout</span>
                                    <div className={styles.successText}>Please try again later</div>
                                    <div className={styles.successBtn} onClick={onClose}>Dismiss</div>
                                </div> : null
                            }
                            {(tip && status === "loading") && <div className={styles.tip}>{tip}</div>}
                        </div>
                        {
                            status === "opened" && <div>
                                <div style={{margin: "20px 0"}}><Button onClick={onVerify}>Verify transfer password</Button></div>
                                <div className={styles.successBtn} onClick={onClose}>Cancel</div>
                            </div>
                        }
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )

}


export default BioResultModal;
