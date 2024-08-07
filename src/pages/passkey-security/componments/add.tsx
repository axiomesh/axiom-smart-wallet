import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody, ModalHeader,
} from '@chakra-ui/react';
import {CloseIcon, KeyBioIcon} from "@/components/Icons";
import BioResultModal from "@/components/BioResultModal";
import {
    addTrustDevice,
    addTrustDeviceCheck,
    bioCreate,
    registerTrustDevice,
    registerTrustDeviceCheck
} from '@/services/transfer';
import { isTrustedDevice } from '@/services/login';
import {connect} from "@@/exports";
import {detectBrowser, getBrowserName, getDeviceType, getSafariVersion} from "@/utils/utils";
import {startRegistration, startAuthentication} from "@simplewebauthn/browser";
import {getDeviceVersion} from "@/utils/system";


const AddDeviceModal = (props: any) => {
    const { isOpen, onClose, userInfo, loadData } = props;
    const [statusOpen, setStatusOpen] = useState(false);
    const [status, setStatus] = useState('loading');
    // limit_timer

    const getAuth = async (verifyRes, transports, id) => {
        return await startAuthentication({
            challenge: verifyRes.publicKey.challenge,
            rpId: verifyRes.publicKey.rpId,
            allowCredentials: [{
                "type": "public-key",
                "id": id,
                "transports": transports
            }],
            userVerification: "required"
        })
    }


    const handleCreatePasskey = async () => {
        const register = await registerTrustDevice({ email: userInfo.email,device_id: userInfo.device_id});

        const registerObj: any = {
            challenge: register.challenge,
            rp: register.rp[0],
            pubKeyCredParams: register.pub_key_cred_param ? [register.pub_key_cred_param] : [],
            authenticatorSelection: {
                authenticatorAttachment: register.authenticator_type,
                userVerification: 'required',
            },
            user: {
                "id": register.user.id,
                "name": register.user.name,
                "displayName": register.user.displayName
            },
            excludeCredentials: [],
            timeout: 30000
        }

        let publicKeyCredential = await startRegistration(registerObj);
        await registerTrustDeviceCheck({
            email: userInfo.email,
            device_id: userInfo.device_id,
            response: JSON.stringify(publicKeyCredential),
            device_type: getDeviceType(),
            device_name: navigator.platform,
            device_version: getDeviceVersion(),
            browser_type: getBrowserName(),
        })
        onClose();
        loadData()
        setStatus('deviceSuccess');

    }

    const handleAddPasskey = async () => {
        const res = await addTrustDevice({ email: userInfo.email,device_id: userInfo.device_id});
        const verifyRes = JSON.parse(res.credentials_json);
        let transports = [res.transport];
        const browser = detectBrowser();
        if(browser === "safari") {
            const version = getSafariVersion();
            if(version && version.version == 16) {
                transports = ["internal", res.transport]
            }
        }

        let authentication = '';
        let credential_id = '';
        if(res?.credential_ids?.length === 1){
            credential_id = res.credential_ids[0];
            authentication = await getAuth(verifyRes, transports, res.credential_ids[0]);
        } else if(res?.credential_ids?.length === 2) {
            // getAuth
            // const list = await Promise.all(res?.credential_ids.map(item => getAuth(verifyRes, transports,item)));
            // credential_id = list[0] ? res.credential_ids[0] : res.credential_ids[1];
            // authentication = list.filter(li => li)[0];
            const list = await Promise.allSettled(res?.credential_ids.map(item => getAuth(verifyRes, transports,item)));
            const index = list.findIndex(li => li.status === "fulfilled");
            credential_id = res.credential_ids[index];
            authentication = list[index].value;
        }
        await addTrustDeviceCheck({
            email: userInfo.email,
            device_id: userInfo.device_id,
            result: JSON.stringify(authentication),
            credential_id,
            device_type: getDeviceType(),
            device_name: navigator.platform,
            device_version: getDeviceVersion(),
            browser_type: getBrowserName(),
        })
        onClose();
        loadData()
        setStatus('deviceSuccess');
    }
    const handlePasskeyClick = async () => {
        try{
            setStatusOpen(true);
            setStatus('loading');

            // 处理事件
            const isTrusted = await isTrustedDevice({
                email: userInfo.email,
                device_id: userInfo.device_id,
            });

            if(isTrusted === -1){
                await handleCreatePasskey()
            } else {
                await handleAddPasskey();
            }

        } catch (e) {
            console.log(e)
            const string = e.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setStatus("cancel");
            }else {
                setStatus("failed");
            }
        }

    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} isCentered>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className='modal_title'>Add Trusted Device</div>
                        <i className='close' onClick={onClose}>
                            <CloseIcon fontSize="12px" />
                        </i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 40px 40px">
                        <div style={{fontSize: 14, fontWeight: 500, color: '#4B5563'}}>After adding the trusted device, AxiomWallet allows quick login via trusted</div>
                        <div className={styles.keyBtn} onClick={handlePasskeyClick}>
                            <KeyBioIcon fontSize="24px" />
                            <span>Continue</span></div>
                        <div style={{color: '#718096', fontSize: 14, textAlign: 'center'}}>Most friendly and secure way based on Passkey</div>
                    </ModalBody>
                </ModalContent>
            </Modal>
            <BioResultModal isOpen={statusOpen} status={status} onClose={() => {setStatusOpen(false)}} />
        </>
    )

}


export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(AddDeviceModal)
