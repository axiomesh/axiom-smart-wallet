import styles from './index.less'
import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@chakra-ui/react';
import useContinueButton from "@/hooks/ContinueButton";

const useCancelModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [header, setHeader] = useState('');
    const [confirmCallback, setConfirmCallback] = useState(() => () => {});
    const {Button} = useContinueButton();

    const openModal = (headerText,onConfirm) => {
        setHeader(headerText);
        setConfirmCallback(() => onConfirm);
        setIsOpen(true);
    };

    const closeModal = () => {
        setHeader('');
        setConfirmCallback(() => () => {});
        setIsOpen(false);
    };

    const ModalComponent = ({ children }) => (
        <Modal isOpen={isOpen}>
            <ModalOverlay />
            <ModalContent borderRadius="32px" boxShadow="lg" bg="white" padding="0 40px 0 40px" w="500px" maxWidth="none">
                <ModalHeader padding="45px 0 20px 0" fontSize="24px" maxWidth="260px">{header}</ModalHeader>
                <i className={styles.closeIcon} onClick={closeModal}></i>
                {children && <ModalBody padding="0 0 30px 0" fontSize="14px" fontWeight="500" color="#4B5563">
                    {children}
                </ModalBody>}
                <ModalFooter padding="0 0 40px 0">
                    <Button onClick={confirmCallback}>Continue</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );

    return [ModalComponent, openModal, closeModal];
}

export default useCancelModal;
