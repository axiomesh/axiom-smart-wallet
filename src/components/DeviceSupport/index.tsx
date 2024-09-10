import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
} from '@chakra-ui/react';
import useContinueButton from "@/hooks/ContinueButton";
import {getDeviceVersion} from "@/utils/system";
import {SuccessIcon} from "@/components/Icons";
import {detectBrowser, getBrowserVersion} from "@/utils/utils";


const DeviceSupport = (props: any) => {
    const { isOpen } = props;
    const ua = navigator.userAgent;

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
                                    <span className={styles.deviceSupportContentItemText}>{detectBrowser()} {detectBrowser() === 'Other' ? '' : getBrowserVersion()}</span>
                                </div>
                            </div>

                            <div className={styles.deviceSupportContentList}>
                                <div className={styles.deviceSupportContentItem}>
                                    {/*<i className={styles.deviceSupportContentItemNoIcon}></i>*/}
                                    <SuccessIcon width='24px' height='24px' />
                                    <span className={styles.deviceSupportContentItemText}>{getDeviceVersion()}</span>
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
