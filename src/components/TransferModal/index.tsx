import styles from './index.less';
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Tooltip
} from '@chakra-ui/react';
import ModalInputPassword from '@/components/ModalInputPassword';
import useContinueButton from "@/hooks/ContinueButton";
import Toast from "@/hooks/Toast";
import {connect} from "umi";
import { bioCreate, bioCheck } from "@/services/transfer";
import { CloseIcon } from "@/components/Icons";

interface transferProps {
    send: string;
    to: string;
    blockchain: string;
    value: string;
    gas: string;
    gasPrice: number;
    isTransfinite: boolean;
    pinLoading: boolean;
}

const TransferModal = (props: any) => {
    const { userInfo } = props;
    const [isOpen, setIsOpen] = useState<Boolean>(props.open);
    const [isFree, setIsFree] = useState<Boolean>(false);
    const [info, setInfo] = useState<transferProps>();
    const [error, setError] = useState<string>('');
    const [time, setTime] = useState<number>(30);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBio, setIsBio] = useState<boolean>(false);
    const {Button} = useContinueButton();
    const {showErrorToast} = Toast();

    useEffect(() => {
        if(props.open) {
            if(userInfo.bio_payment_status === 1) {
                setIsBio(true)
            }else {
                setIsBio(false)
            }
        }
    }, [props.open])

    useEffect(() => {
        setIsLoading(props.pinLoading)
    }, [props.pinLoading])

    const isFreeTransfer = () => {
        const status = sessionStorage.getItem("freeStatus")
        const timer = sessionStorage.getItem("limit_timer")
        if((status === '1' || status === '2') && timer && Number(timer) >= new Date().getTime()) {
            return true
        }
        return false
    }

    useEffect(() => {

        setIsFree(isFreeTransfer())
        setIsOpen(props.open)
        setTime(30)
        if(props.open) {
            setError("")
            let t = setInterval(countDown, 1000);
            let i = 30
            function countDown() {
                setTime(i)
                if (i === 0){
                    clearInterval(t);
                    if(isBio || isFree) {
                        showErrorToast("Verification timeout");
                    }else {
                        showErrorToast("Password verification timeout");
                    }
                    props.onClose();
                }
                i--;
            }
            return () => clearInterval(t);
        }
    },[props.open])

    useEffect(() => {
        setError(props.errorMsg)
    }, [props.errorMsg])

    useEffect(() => {
        setInfo(props.info)
        console.log()
        if(props.info?.isTransfinite === false){
            setIsFree(false)
        } else if(props.info?.isTransfinite === true) {
            setIsFree(true)
        }
    },[props.info, props.open])

    const handleBioPay = () => {
        props.onBioPay()
    }

    const onClose = () => {
        props.onClose()
    }

    const handleSubmit = (value: string) => {
        props.onSubmit(value)
    }



    const handleClear = () => {
        props.clearError()
    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div>Transfer <span className={styles.transferTitleTime}>（{time}s）</span></div>
                        <i className={styles.transferClose} onClick={onClose}><CloseIcon fontSize="12px" /></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 40px 40px">
                        {isFree ? <div className={styles.transferFreeToast}>
                            <img src={require("@/assets/transfer/free-toast.png")} alt="" />
                            <span>Password-free payment update will be activated after this transfer transaction.</span>
                        </div> : null}
                        <div className={styles.transferDetail}>
                            <h1 style={{paddingBottom: "8px"}}>DETAILS</h1>
                            <div className={styles.transferSend}>
                                <div className={styles.transferSendItem}>
                                    <span className={styles.transferSendItemTitle}>Send</span>
                                    <div className={styles.transferSendItemContent}><img src={require("@/assets/token/wAXC.png")} alt=""/><Tooltip fontSize="14px" borderRadius="4px" zIndex="9999999" hasArrow bg='gray.900' placement='top' label={info?.value}><span className={styles.transferSendItemContentText}>{info?.value}</span></Tooltip><span>{info?.send}</span></div>
                                    {/* <div className={styles.transferSendItemContent}><img src={require("@/assets/token/wAXC.png")} alt=""/><Tooltip fontSize="14px" borderRadius="4px" zIndex="9999999" hasArrow bg='gray.900' placement='top' label={"1231212323112312321312312312312331212312312"}><span className={styles.transferSendItemContentText}pan className={styles.transferSendItemContentText}>1231212323112312321312312312312331212312312</span></Tooltip><span>AXC</span></div> */}
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
                        </div>
                        {(isBio && !isFree) ? <div className={styles.transferBio}>
                            <div className={styles.transferBioButton} onClick={handleBioPay}><img src={require("@/assets/transfer/bio.png")} alt="" /><span>Confirm</span></div>
                            <div className={styles.transferBioText} style={{marginTop: 0}} onClick={() => setIsBio(false)}>Confirm with password</div>
                        </div> : null}
                        {(!isBio && !isFree) ? <><p className={styles.transferTitle}>Transfer password verification</p>
                            <ModalInputPassword isForget={true} isLoading={isLoading} onSubmit={handleSubmit} isError={error}  clearError={handleClear}/>
                            {userInfo.bio_payment_status === 1 && <div className={styles.transferBioText} onClick={() => setIsBio(true)}>Confirm with passkey</div>}
                        </> : null}
                        {isFree ? <div style={{marginTop: "20px"}}><Button onClick={() => handleSubmit("")}>Confirm (Passward-free)</Button></div> : null}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
};

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(TransferModal)
