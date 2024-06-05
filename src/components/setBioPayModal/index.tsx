import { useEffect, useState } from 'react';
import styles from './index.less';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import { startRegistration } from '@simplewebauthn/browser';
import { getDeviceType } from "@/utils/utils";
import BioResultModal from "@/components/BioResultModal";
import {bioCreate, bioCheck} from "@/services/transfer";
import {getMail} from "@/utils/help";
import Toast from "@/hooks/Toast";
import { connect } from "@@/exports";
import { getUserInfo } from "@/services/login";

const SetBioPayModal = (props: any) => {
    const { userInfo, dispatch } = props;
    const [open, setOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState("");
    const email: string | any = getMail();
    const { showErrorToast } = Toast();

    useEffect(() => {
        setOpen(props.isOpen)
    },[props.isOpen])

    const onClose = () => {
        props.onClose(false)
    }

    const handleOpenBio = async () => {
        setResultOpen(true);
        setResultStatus("loading");
        onClose();
        await createPasskey();
    }

    const handleResultClose = async () => {
        setResultOpen(false);
    }

    const createPasskey = async () => {
        const visitorId = userInfo.device_id;
        const register: any = await bioCreate({email, device_id: visitorId, device_type: getDeviceType()});
        const registerObj: any = {
            challenge: register.challenge,
            rp: register.rp[0],
            pubKeyCredParams: register.pub_key_cred_param ? [register.pub_key_cred_param] : [],
            authenticatorSelection: {
                authenticatorAttachment: register.authenticator_type
            },
            user: {
                "id": register.user.id,
                "name": register.user.name,
                "displayName": register.user.displayName
            },
            excludeCredentials: [],
            timeout: 30000
        }
        let publicKeyCredential: any;
        try{
            publicKeyCredential = await startRegistration(registerObj)
        }catch (error: any) {
            console.log(error)
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setResultStatus("cancel");
            }else {
                setResultStatus("failed");
            }
            return;
        }
        try {
            await bioCheck({email, device_id: visitorId, result: JSON.stringify(publicKeyCredential)});
            const deviceId = localStorage.getItem('visitorId');
            const userRes = await getUserInfo(email, deviceId);
            if(userRes){
                dispatch({
                    type: 'global/setUser',
                    payload: userRes,
                })
            }
            setResultStatus("opened");
        }catch (error: any) {
            showErrorToast(error);
            return;
        }
    }

    return (
        <>
            <Modal isOpen={open} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalBody padding="40px">
                        <div className={styles.bioModalTop}>
                            <img style={{width: "156px",marginTop: "35.5px"}} src={require("@/assets/transfer/bio-success.png")} alt="" />
                            <span className={styles.bioModalTopTitle}>Password set successfully!</span>
                            <span className={styles.bioModalTopTip}>Open Bio-Payment for password-free transfer</span>
                        </div>
                        <div className={styles.bioModalBtn}>
                            <i className={styles.bioModalBtnIcon}></i>
                            <span className={styles.bioModalBtnText} onClick={handleOpenBio}>Open Bio-Payment</span>
                            <div className={styles.bioModalBtnLine}>Recommend</div>
                        </div>
                        <p className={styles.bioModalCancel} onClick={onClose}>Cancel</p>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <BioResultModal isOpen={resultOpen} status={resultStatus} onClose={handleResultClose} loadingTip="Only use it on a safety device" />
        </>
    )
};

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(SetBioPayModal)