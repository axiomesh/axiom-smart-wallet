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
import Input from '@/components/Input';
import useContinueButton from '@/hooks/ContinueButton';
import ModalInputPassword from "@/components/ModalInputPassword";
import TransferPassword from "@/components/TransferPassword";
import { setFirstPassword } from '@/services/transfer';
import Toast from "@/hooks/Toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const SetPayPasswordModal = (props: Props) => {
    const [open, setOpen] = useState<Boolean>(props.isOpen);
    const [isVerify, setIsVerify] = useState(false);
    const {Button}  = useContinueButton();
    const {showSuccessToast} = Toast();

    useEffect(() => {
        setOpen(props.isOpen)
    },[props.isOpen])

    const onClose = () => {
        props.onClose()
    }

    const handleSubmit = async (e: string) => {
        await setFirstPassword("", "", e);
        showSuccessToast("Password set successfully!");
        props.onClose();
    }

    return (
        <>
            <Modal isOpen={open} onClose={onClose} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className={styles.payPassTitle}><span>Set Transfer Password</span><span className={styles.payPassInstructions}>Set your quick transfer password for transfer operations.</span></div>
                        <i className={styles.payPassClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 0 40px">
                        {!isVerify && <div>
                            <span className={styles.payPassTip}>Please enter your unlock password to complete the verification</span>
                            <Input
                                type='password'
                                placeholder='Unlock password'
                                style={{height: "56px", marginTop: "8px", marginBottom: "40px"}}
                                _placeholder={{
                                    fontSize: "14px",
                                    fontFamily: "Inter",
                                    fontWeight: "400",
                                    color: "#A0AEC0"
                                }}
                            />
                            <Button>Verify</Button>
                        </div>}
                        {isVerify && <TransferPassword onSubmit={handleSubmit} />}
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default SetPayPasswordModal;
