import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import useContinueButton from "@/hooks/ContinueButton";


const DeviceSupport = (props: any) => {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [version, setVersion] = useState(props.version);
    const [device, setDevice] = useState(props.device);
    const {Button} = useContinueButton();

    useEffect(() => {
        setIsOpen(props.isOpen)
    },[props.isOpen])

    useEffect(() => {
        setVersion(props.version)
    },[props.version])

    useEffect(() => {
        setDevice(props.device)
    },[props.device])

    const onClose = () => {
        props.onClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalBody padding="40px">
                        <div className={styles.deviceSupportTitle}>Unsupported environment</div>
                        <div className={styles.deviceSupportContent}>
                            <p>Your current environmet</p>
                            <div className={styles.deviceSupportContentList}>
                                <div className={styles.deviceSupportContentItem}>
                                    <i className={styles.deviceSupportContentItemNoIcon}></i>
                                    <span className={styles.deviceSupportContentItemText}>{device} {version}</span>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )

}


export default DeviceSupport;
