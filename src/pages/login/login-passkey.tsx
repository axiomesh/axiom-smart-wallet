import React from 'react';
import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
} from '@chakra-ui/react';
import { history, useLocation } from 'umi';
import {useEffect, useState} from "react";
import Right from './componments/right';
import {addPrivateKey, registerAddress, registerPasskey, registerPasskeySave, checkPasskeyCreate, checkPasskey, isOpenBio} from '@/services/login';
import {getMail, setToken} from "@/utils/help";
import LogoutModal from "@/pages/login/componments/logout-modal";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import BioResultModal from '@/components/BioResultModal';
import { AxiomAccount, generateSigner } from 'axiom-smart-account-test'
import { sha256 } from 'js-sha256'
import {generateRandomBytes,getDeviceType} from "@/utils/utils";
import { register } from '@passwordless-id/webauthn/dist/esm/client';
import Toast from "@/hooks/Toast";



const LoginPasskey: React.FC = () => {
    const email: string | any = getMail();
    const [open, setOpen] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [isBioOpen, setIsBioOpen] = useState(0);
    const [openBioResult, setOpenBioResult] = useState(false);
    const [bioResultStatus, setBioResultStatus] = useState('');
    const [deviceId, setDeviceId] = useState('');

    const {showErrorToast} = Toast();

    useEffect(() => {
        const deviceId = localStorage.getItem('visitorId');
        if(deviceId) {
            hanldeIsOpenBio(deviceId);
        }else {
            const fpPromise = import('@/utils/v3')
            .then(FingerprintJS => FingerprintJS.load())
            fpPromise.then(fp => fp.get()).then(async (result) => {
                const visitorId = result.visitorId;
                setDeviceId(visitorId);
                localStorage.setItem('visitorId', visitorId);
                await hanldeIsOpenBio(visitorId);
            })
        }
        if(location.pathname === '/register-passkey'){
            setIsRegister(true)
        }else {
            setIsRegister(false)
        }
    }, [])

    const hanldeIsOpenBio = async (deviceId: string) => {
        const isOpen = await isOpenBio({
            email: email,
            device_id: deviceId,
        });
        setIsBioOpen(isOpen);
    }

    const handleBack = () =>{
        if(location.pathname === '/lock-password'){
            setOpen(true);
        } else {
            history.replace('/login')
        }
    }

    const handlePasskeyClick = async () => {
        setOpenBioResult(true);
        setBioResultStatus("loading");
        if(isRegister) {
            try {
                await handleRegisterPasskey();
                // setBioResultStatus("success");
            }catch (error: any) {
                setOpenBioResult(true);
                const string = error.toString(), expr = /The operation either timed out or was not allowed/;
                if(string.search(expr) > 0) {
                    setBioResultStatus("cancel");
                }else {
                    setBioResultStatus("failed");
                }
            }
        }else {
            try {
                await handleVerifyPasskey();
                const code = localStorage.getItem('verify_code');
                if(code) {
                    const address = await handleGetAddress();
                    const device_id = localStorage.getItem('visitorId');
                    try {
                        await registerAddress({
                            email: email,
                            address: address,
                            device_id: device_id
                        })
                        setBioResultStatus("first");
                        localStorage.removeItem('verify_code');
                    }catch (error: any) {
                        showErrorToast(error)
                        return;
                    }
                }else {
                    setBioResultStatus("back");
                }
                setTimeout(() => {
                    history.replace('/home');
                }, 1000)
            }catch (error: any) {
                console.log(error, '------verify')
                setOpenBioResult(true);
                const string = error.toString(), expr = /The operation either timed out or was not allowed/;
                if(string.search(expr) > 0) {
                    setBioResultStatus("cancel");
                }else {
                    setBioResultStatus("failed");
                }
            }
        }
    }
    const handleRegisterPasskey = async () => {
        const visitorId = deviceId;
        setDeviceId(visitorId);
        let register: any;
        try {
            register = await registerPasskey({
                email: email,
                device_id: visitorId
            })
        }catch(error: any) {
            setOpenBioResult(false);
            showErrorToast(error)
            return;
        }
        const registerObj: any = {
            challenge: register.challenge,
            rp: register.rp[0],
            pubKeyCredParams: [register.pub_key_cred_param],
            authenticatorSelection: {
                authenticatorAttachment: register.authenticator_type
            },
            user: {
                "id": btoa(register.user.id),
                "name": register.user.name,
                "displayName": register.user.displayName
            },
            excludeCredentials: [],
            timeout: 30000
        }
        let publicKeyCredential: any;
        try {
            publicKeyCredential = await startRegistration(registerObj)
            console.log(JSON.stringify(publicKeyCredential, null, 2))
        }catch (error: any) {
            console.log(error, '------------register')
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setBioResultStatus("cancel");
            }else {
                setBioResultStatus("failed");
            }
            return;
        }
        await handleRegisterPasskeySave(publicKeyCredential,visitorId)
    }

    const handleRegisterPasskeySave = async (result: any, device_id: any) => {
        try {
            await registerPasskeySave({
                email: email,
                device_id: device_id,
                device_type: "Iphone",
                response: JSON.stringify(result)
            })
            setBioResultStatus("success");
            setTimeout(() => {
                history.replace("/login-passkey")
            }, 1000)
        }catch(error: any) {
            setBioResultStatus("failed");
            showErrorToast(error)
            return;
        }
    }

    const handleVerifyPasskey = async () => {
        const deviceId = localStorage.getItem('visitorId');
        const res = await checkPasskeyCreate({
            email: email,
            device_id: deviceId,
        })
        const verifyRes = JSON.parse(res.credentials_json);
        localStorage.setItem("allowCredentials", res.credential_id)
        const authentication = await startAuthentication({
            challenge: verifyRes.publicKey.challenge,
            rpId: verifyRes.publicKey.rpId,
            allowCredentials: [{
                "type": "public-key",
                "id": res.credential_id
            }]
        })
        let token: any;
        try {
            token = await checkPasskey({
                email: email,
                result: JSON.stringify(authentication),
                device_id: deviceId
            })
        }catch (error: any) {
            showErrorToast(error)
            return;
        }
        console.log(token)
        setToken(token);
    }

    const handleGetAddress = async () => {
        const password: any = localStorage.getItem('verify_code');
        const encryptPassword = sha256(password);
        const salt = generateRandomBytes(16);
        // @ts-ignore
        let axiomAccount = await AxiomAccount.fromPassword(encryptPassword, salt, window.accountSalt);
        window.axiom = axiomAccount;
        const private_key = axiomAccount.getEncryptedPrivateKey().toString();
        const address = axiomAccount.getAddress();
        await addPrivateKey({
            email: email,
            verify_code: password,
            enc_private_key: private_key,
            user_salt: salt
        })
        return address;
    }

    return (
        <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <div className={styles.keyTitle}>Authentication</div>
                    <div className={styles.keyMail}>{email}</div>
                    <a className='a_link' onClick={handleBack} style={{marginTop: 8, fontSize: 14}}>
                        Use a different account
                    </a>
                    {isBioOpen === 0 ? <Popover trigger="hover" strategy="fixed" placement="bottom-start">
                        <PopoverTrigger><div className={styles.keyBtn} onClick={handlePasskeyClick}><i className={styles.keyIcon}></i><span>{isRegister ? "Sign in with phone" : "Continue with phone"}</span></div></PopoverTrigger>
                        <PopoverContent style={{borderRadius: "32px", padding: "20px"}} width="auto">
                            <PopoverArrow />
                            <PopoverBody>
                                <div className={styles.passkeyContent}>
                                    <div className={styles.passkeyItem}>
                                        <img src={require("@/assets/login/ios.png")} alt="" />
                                        <span className={styles.passkeyItemTip}>For iPhone user</span>
                                        <span className={styles.passkeyItemScan}>scan by camera</span>
                                    </div>
                                    <div className={styles.passkeyItem}>
                                        <img src={require("@/assets/login/android.png")} alt="" />
                                        <span className={styles.passkeyItemTip}>For Android user</span>
                                        <span className={styles.passkeyItemScan}>scan by camera</span>
                                    </div>
                                </div>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover> : <div>
                        <div className={styles.keyBtn} onClick={handlePasskeyClick}><i className={styles.keyBioIcon}></i><span>Continue</span></div>
                    </div>}
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={() => setOpen(false)} />
          <BioResultModal isOpen={openBioResult} status={bioResultStatus} onClose={() => setOpenBioResult(false)} />
      </div>
    )
};

export default LoginPasskey;