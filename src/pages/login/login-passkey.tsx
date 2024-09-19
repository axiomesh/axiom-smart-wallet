import React from 'react';
import styles from './index.less';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
} from '@chakra-ui/react';
import { history } from 'umi';
import {useEffect, useState} from "react";
import Right from './componments/right';
import {
    registerAddress,
    registerPasskey,
    registerPasskeySave,
    checkPasskeyCreate,
    checkPasskey,
    isTrustedDevice,
    checkUser
} from '@/services/login';
import {getMail, setToken} from "@/utils/help";
import LogoutModal from "@/pages/login/componments/logout-modal";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import BioResultModal from '@/components/BioResultModal';
import { Axiom } from 'axiomwallet';
import { sha256 } from 'js-sha256'
import {
    generateRandomBytes,
    getDeviceType,
    detectBrowser,
    getSafariVersion,
    getBrowserName,
    getTransportType
} from "@/utils/utils";
import Toast from "@/hooks/Toast";
import {getDeviceVersion} from "@/utils/system";



const LoginPasskey: React.FC = () => {
    const email: string | any = getMail();
    const [open, setOpen] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const [isTrustOpen, setIsTrustOpen] = useState(0);
    const [openBioResult, setOpenBioResult] = useState(false);
    const [bioResultStatus, setBioResultStatus] = useState('');
    const [deviceId, setDeviceId] = useState('');

    const {showErrorToast} = Toast();

    useEffect(() => {
        const deviceId = localStorage.getItem('visitorId');
        if(deviceId) {
            setDeviceId(deviceId);
            hanldeIsOpenBio(deviceId);
        }else {
            const fpPromise = import('@/utils/v3')
            .then(FingerprintJS => FingerprintJS.load())
            fpPromise.then(fp => fp.get()).then(async (result) => {
                const visitorId = result.visitorId;
                console.log('FingerprintJS', visitorId)
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
        const isOpen = await isTrustedDevice({
            email: email,
            device_id: deviceId,
            device_name: navigator.platform,
            device_version: getDeviceVersion(),
        });
        setIsTrustOpen(isOpen);
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
                const string = error.toString(), expr = /The operation either timed out or was not allowed/, expr1 = /The request is not allowed by the user agent or the platform in the current context/;
                if(string.search(expr) > 0 || string.search(expr1) > 0) {
                    setBioResultStatus("cancel");
                }else {
                    setBioResultStatus("failed");
                }
            }
        }else {
            try {
                const res = await handleVerifyPasskey();
                const userType = sessionStorage.getItem('userType');
                if(res) {
                    if(userType === '0'){
                        const code = localStorage.getItem('verify_code');
                        if(code) {
                            // const salt = generateRandomBytes(16);
                            const pwd = new Date().getTime().toString() + 'a';
                            const transferSalt = generateRandomBytes(16);
                            let axiomAccount = await Axiom.Wallet.AxiomWallet.fromPassword(sha256(pwd), transferSalt);
                            window.axiom = axiomAccount;
                            const address = await axiomAccount.getAddress();
                            const device_id = localStorage.getItem('visitorId');
                            const hash = await axiomAccount.deployWalletAccout();
                            try {
                                // 上链
                                if(hash){
                                    await registerAddress({
                                        email: email,
                                        address: address,
                                        device_id: device_id,
                                        enc_private_key: axiomAccount.getEncryptedPrivateKey(),
                                        user_salt: window.accountSalt,
                                        transfer_pwd: pwd,
                                        transfer_salt: transferSalt,
                                    })
                                    setBioResultStatus("first");
                                    localStorage.removeItem('verify_code');
                                }
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
                    } else {
                        setBioResultStatus("back");
                        setTimeout(() => {
                            history.replace('/home');
                        }, 1000)
                    }
                }

            }catch (error: any) {
                console.log(error, '------verify')
                setOpenBioResult(true);
                const string = error.toString(), expr = /The operation either timed out or was not allowed/, expr1 = /The request is not allowed by the user agent or the platform in the current context/;
                if(string.search(expr) > 0 || string.search(expr1) > 0) {
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
                device_id: visitorId,
                device_name: navigator.platform,
                device_version: getDeviceVersion(),
            })
        }catch(error: any) {
            setOpenBioResult(false);
            showErrorToast(error)
            return;
        }
        let type = register.authenticator_type;
        const browser = detectBrowser();
        if(browser.toLowerCase()  === "safari") {
            const version = getSafariVersion();
            if(version && version.version == 16) {
                type = 'cross-platform'
            }
        }
        const registerObj: any = {
            challenge: register.challenge,
            rp: register.rp[0],
            pubKeyCredParams: [register.pub_key_cred_param],
            authenticatorSelection: {
                authenticatorAttachment: type,
                residentKey: 'preferred',
                userVerification: 'required',
                requireResidentKey: false,
            },
            user: {
                "id": btoa(register.user.id),
                "name": register.user.name,
                "displayName": register.user.displayName
            },
            excludeCredentials: [],
            timeout: 30000,
            attestation: "none"
        }
        console.log(JSON.stringify(registerObj), '--------registerObj')
        let publicKeyCredential: any;
        try {
            publicKeyCredential = await startRegistration(registerObj)
        }catch (error: any) {
            console.log(error, '------------register')
            const string = error.toString(), expr = /The operation either timed out or was not allowed/, expr1 = /The request is not allowed by the user agent or the platform in the current context/;
            if(string.search(expr) > 0 || string.search(expr1) > 0) {
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
                response: JSON.stringify(result),
                device_name: navigator.platform,
                device_version: getDeviceVersion(),
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

    const handleVerifyPasskey = async () => {
        const deviceId = localStorage.getItem('visitorId');
        const res = await checkPasskeyCreate({
            email: email,
            device_id: deviceId,
        })
        const verifyRes = JSON.parse(res.credentials_json);
        let transports = [getTransportType(res.transport_type)];
        const browser = detectBrowser();
        if(browser.toLowerCase()  === "safari") {
            const version = getSafariVersion();
            if(version && version.version == 16) {
                transports = ["internal", getTransportType(res.transport_type)]
            }
        }
        let authentication = '';
        let credential_id = '';
        try{
            if(res?.credential_ids?.length === 1){
                credential_id = res.credential_ids[0];
                console.log('transports', transports);
                authentication = await getAuth(verifyRes, transports, res.credential_ids[0]);
                console.log('271', authentication);
            } else if(res?.credential_ids?.length > 1) {
                const list = await Promise.allSettled(res?.credential_ids.map(item => getAuth(verifyRes, transports,item)));
                console.log(list);
                const index = list.findIndex(li => li.status === "fulfilled");
                credential_id = res.credential_ids[index];
                authentication = list[index].value;
            }
        } catch (e){
            const string = e.toString(), expr = /The operation either timed out or was not allowed/, expr1 = /The request is not allowed by the user agent or the platform in the current context/;
            if(string.search(expr) > 0 || string.search(expr1) > 0) {
                setBioResultStatus("cancel");
            }else {
                setBioResultStatus("failed");
            }
            return ;
        }
        let token: any;
        try {
            token = await checkPasskey({
                credential_id,
                email: email,
                result: JSON.stringify(authentication),
                device_id: deviceId,
                device_type: isTrustOpen === 1 ?  getDeviceType() : "Iphone",
                device_name: navigator.platform,
                device_version: getDeviceVersion(),
                browser_type: getBrowserName(),
            })
            // if(credential_id) {
            //     localStorage.setItem("allowCredentials", credential_id)
            // }
        }catch (error: any) {
            setBioResultStatus("failed");
            showErrorToast(error)
            return;
        }
        setToken(token);

        return token
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
                    {isTrustOpen === 1 ? <div>
                        <div className={styles.keyBtn} onClick={handlePasskeyClick}><i className={styles.keyBioIcon}></i><span>Continue</span></div>
                    </div> : <Popover trigger="hover" strategy="fixed" placement="bottom-start">
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
                    </Popover>}
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
