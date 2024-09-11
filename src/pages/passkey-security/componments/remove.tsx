import styles from "./index.less"
import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody, ModalHeader,
} from '@chakra-ui/react';
import {CloseIcon, MacIcon, WindowsIcon} from "@/components/Icons";
import ButtonPro from '@/components/Button';
import Toast from "@/hooks/Toast";
import {removeTrustDevice} from "@/services/transfer";
import {connect} from "@@/exports";


const RemoveDeviceModal = (props: any) => {
    const { isOpen, onClose, info, loadData, userInfo } = props;
    const {showSuccessToast} = Toast();
    const [loading, setLoading] = useState(false);
    const handleRemove = async () => {
        try{
            setLoading(true);
            await removeTrustDevice({email: userInfo.email, device_id: info.usage_records[0].device_id});
            loadData();
            showSuccessToast('Trusted device removed successfully!')
        } finally {
            setLoading(false);
            onClose();
        }
    }

    console.log(info)

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className='modal_title'>Remove Trusted Device</div>
                        <i className='close' onClick={onClose}>
                            <CloseIcon fontSize="12px" />
                        </i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 40px 40px">
                        <div style={{fontSize: 14, fontWeight: 500, color: '#4B5563'}}>
                            <div>Do you want to remove the current trusted device?</div>
                            <div>After removing, you cannot use the device’s passkey to login.</div>
                        </div>
                        <div className={styles.collapseItem}>
                            <div className={styles.collapseItemIcon}>
                                {info?.device_type?.toLowerCase().includes('mac')  ? <MacIcon /> : <WindowsIcon />}
                            </div>
                            <div>
                                {info.device_name}
                            </div>
                        </div>
                        <ButtonPro isLoading={loading} onClick={handleRemove}>Remove</ButtonPro>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )

}


export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(RemoveDeviceModal)
