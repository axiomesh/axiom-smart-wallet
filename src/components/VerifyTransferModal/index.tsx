import styles from "./index.less";
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody
} from '@chakra-ui/react';
import ModalInputPassword from "@/components/ModalInputPassword";
import Toast from "@/hooks/Toast"
import {CloseIcon} from "@/components/Icons";


const VerifyTransferModal = (props: any) => {
    const [open, setOpen] = useState(false);
    const [time, setTime] = useState<number>(30);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [openBio, setOpenBio] = useState<boolean | undefined>(false);
    const [showBio, setShowBio] = useState(false);
    const {showErrorToast} = Toast();

    useEffect(() => {
        setError(props.errorMsg)
    }, [props.errorMsg])

    useEffect(() => {
        setOpenBio(props.isOpenBio)
        if(props.isOpenBio) {
            setShowBio(true)
        }
    }, [props.isOpenBio])

    useEffect(() => {
        setIsLoading(props.pinLoading)
    }, [props.pinLoading])

    const handleInitClose = () => {
        setOpenBio(props.isOpenBio);
        setShowBio(props.isOpenBio)
        props.onClose();
    }

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
                    if(showBio) {
                        showErrorToast("Verification timeout");
                    }else {
                        showErrorToast("Confirm timeout !");
                    }
                    handleInitClose();
                }
                i--;
            }
            return () => clearInterval(t);
        }
    },[props.isOpen])

    const handleClose = () => {
        if(showBio) {
            showErrorToast("Verification failed");
        }else {
            showErrorToast("Confirm failed !");
        }
        handleInitClose();
    }

    const handleBio = () => {
        props.bioPay()
    }

    return (
        <>
            <Modal isOpen={open} onClose={props.onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className={styles.payPassTitle}><span className={styles.payPassTitleBefore}>Verification</span><span className={styles.payPassTitleTime}>（{time}s）</span></div>
                        {/*<i className={styles.payPassClose} onClick={handleClose}></i>*/}
                        <i className='close' onClick={handleClose}>
                            <CloseIcon fontSize="12px" />
                        </i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 40px 40px">
                        <div className={styles.payPassBody}>
                            <span className={styles.payPassTip}>{props.tip ? props.tip : "Transfer password verification"}</span>
                            {!openBio ? <div>
                                <ModalInputPassword isForget={false} isLoading={isLoading} onSubmit={props.onSubmit} isError={error} clearError={() => {setError("")}} />
                            </div> : <div>
                                {
                                    showBio ? <div>
                                        <div className={styles.payPassBio} onClick={handleBio}><i className={styles.payPassBioIcon}></i><span className={styles.payPassBioTitle}>I understand, proceed to confirm</span></div>
                                        <div className={styles.payPassSwitch} onClick={() => {setShowBio(false)}}>Confirm with password</div>
                                    </div> : <div>
                                        <ModalInputPassword isForget={false} isLoading={isLoading} onSubmit={props.onSubmit} isError={error} clearError={() => {setError("")}} />
                                        <div className={styles.payPassSwitch} onClick={() => {setShowBio(true)}}>Confirm with passkey</div>
                                    </div>
                                }
                            </div>}
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default VerifyTransferModal;
