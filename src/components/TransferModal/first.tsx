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
import { Steps } from 'antd';
import { bioCreate, bioCheck } from "@/services/transfer";
import { CloseIcon, StepOneIcon, StepTwoIconDefault, StepTwoIcon } from "@/components/Icons";
import dayjs from "dayjs";

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

let oneTime = null;
const FirstTransferModal = (props: any) => {
    const { userInfo } = props;
    const freeLimit = sessionStorage.getItem("freeLimit");
    const timer = sessionStorage.getItem("limit_timer");
    const timerSting = timer ? dayjs(Number(timer)).format('MMM-DD-YYYY HH:mm:ss') : '';
    const [isOpen, setIsOpen] = useState<Boolean>(props.open);
    const [info, setInfo] = useState<transferProps>();
    const [error, setError] = useState<string>('');
    const [time, setTime] = useState<number>(30);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isBio, setIsBio] = useState<boolean>(false);
    const {Button} = useContinueButton();
    const [step, setStep] = useState(0);
    let [fivetime, setFiveTime] = useState(5);
    const {showErrorToast} = Toast();
    const steps = [
        {
            title: 'Activate Password-free Payment',
            icon: <StepOneIcon />,
        },
        {
            title: <div style={{color: step === 1 ? '#ECC94B' : '#718096'}}>Process Transaction</div>,
            icon: step === 1 ?  <StepTwoIcon /> : <StepTwoIconDefault />,
        },
    ];

    const handleTime = () => {
        oneTime = setTimeout(() => {
            if(fivetime){
                setFiveTime(fivetime--);
                handleTime();
            } else {
                setFiveTime(0);
                clearTimeout(oneTime);
                setStep(1);
            }
        }, 1000)
    }


    useEffect(() => {
        if(props.open) {
            if(userInfo.bio_payment_status === 1) {
                setIsBio(true)
            }else {
                setIsBio(false)
            }
            handleTime();
        }
    }, [props.open])

    useEffect(() => {
        setIsLoading(props.pinLoading)
    }, [props.pinLoading])

    useEffect(() => {
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
                    setTime(30);
                    setIsLoading(false);
                    setError('');
                    showErrorToast("Verification timeout");
                    props.onClose();
                }
                i--;
            }
            return () => clearInterval(t);
        }
    },[props.open])

    useEffect(() => {
        if(!props.open){
            setFiveTime(5);
            setStep(0);
        }
    }, [props.open]);

    useEffect(() => {
        setError(props.errorMsg)
    }, [props.errorMsg])

    useEffect(() => {
        setInfo(props.info)
    },[props.info])

    const handleBioPay = () => {
        props.onBioPay()
    }

    const onClose = () => {
        setTime(30);
        setIsLoading(false);
        setError('');
        props.onClose()
    }

    const handleSubmit = (value: string) => {
        props.onSubmit(value)
    }



    const handleClear = () => {
        props.clearError()
    }

    const handleNextClick = () => {
        setStep(1);
        clearTimeout(oneTime);
        setFiveTime(0);
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
                        <div style={{marginBottom: 20}}>
                            <Steps
                                labelPlacement="vertical"
                                size="small"
                                current={step}
                                items={steps}
                            />
                        </div>
                        {step === 0 ? <>
                            <div className={styles.transferFreeToast}>
                                <span className={styles.alertIcon}>!</span>
                                <span style={{flex: 1}}>
                                    {sessionStorage.getItem("freeStep") === '1' ?  'Password-free payment update will be activated after this transfer transaction.' :
                                        'Password-free payment will be activated after this transfer transaction.'}
                                </span>
                            </div>
                            <div className={styles.transferDetail} style={{marginBottom: 20}}>
                                <h1 style={{paddingBottom: "8px"}}>DETAILS</h1>
                                <div className={styles.transferSend} style={{border: 0, padding: 0}}>
                                    <div className={styles.transferSendItem}>
                                        <span className={styles.transferSendItemTitle}>Daily transfer limit</span>
                                        <div className={styles.transferSendItemContent}>
                                            {freeLimit}HK$
                                        </div>
                                        {/* <div className={styles.transferSendItemContent}><img src={require("@/assets/token/wAXC.png")} alt=""/><Tooltip fontSize="14px" borderRadius="4px" zIndex="9999999" hasArrow bg='gray.900' placement='top' label={"1231212323112312321312312312312331212312312"}><span className={styles.transferSendItemContentText}pan className={styles.transferSendItemContentText}>1231212323112312321312312312312331212312312</span></Tooltip><span>AXC</span></div> */}
                                    </div>
                                    <div className={styles.transferSendItem} style={{alignItems: "start"}}>
                                        <span className={styles.transferSendItemTitle}>Validity date</span>
                                        <div className={styles.transferSendItemContent}>{timerSting}</div>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleNextClick}>Next {fivetime ? `(${fivetime}s)` : ''}</Button>
                        </> : <>
                            <div className={styles.transferDetail} style={{marginBottom: 20}}>
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
                            {isBio ? <div className={styles.transferBio}>
                                <div className={styles.transferBioButton} onClick={handleBioPay}><img src={require("@/assets/transfer/bio.png")} alt="" /><span>Confirm</span></div>
                                <div className={styles.transferBioText} style={{marginTop: 0}} onClick={() => setIsBio(false)}>Confirm with password</div>
                            </div> : <><p className={styles.transferTitle}>Transfer password verification</p>
                                <ModalInputPassword isForget={true} isLoading={false} onSubmit={handleSubmit} isError={error}  clearError={handleClear}/>
                                {userInfo.bio_payment_status === 1 && <div className={styles.transferBioText} onClick={() => setIsBio(true)}>Confirm with passkey</div>}
                            </>}
                        </>}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
};

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(FirstTransferModal)
