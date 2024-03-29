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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => void;
    onCancel: () => void;
}

const VerifyTransferModal = (props: Props) => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(props.isOpen)
    },[props.isOpen])

    return (
        <>
            <Modal isOpen={open} onClose={props.onClose} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className={styles.payPassTitle}><span className={styles.payPassTitleBefore}>Verification</span><span className={styles.payPassTitleTime}>（30s）</span></div>
                        <i className={styles.payPassClose} onClick={props.onClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 0 40px">
                        <div className={styles.payPassBody}>
                            <span className={styles.payPassTip}>Transfer password verification</span>
                            <div>
                                <ModalInputPassword onSubmit={props.onSubmit} />
                            </div>
                            <span className={styles.payPassForget}>Forget it?</span>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default VerifyTransferModal;
