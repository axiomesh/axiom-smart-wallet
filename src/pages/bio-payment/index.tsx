import styles from "./index.less";
import React, { useState, useEffect } from "react";
import { switchTheme } from "@/pages/transfer-free/theme/index";
import Page from '@/components/Page';
import AlertPro from "@/components/Alert";
import {bioCreate, transferLockTime, bioCheck, bioClose, wrongPassword, passwordTimes} from "@/services/transfer";
import { history } from 'umi';
import { 
    extendTheme,
    ChakraProvider,
    Switch,
} from '@chakra-ui/react';
import Toast from "@/hooks/Toast";
import {getMail} from "@/utils/help";
import BioResultModal from "@/components/BioResultModal";
import {connect} from "@@/exports";
import { getDeviceType } from "@/utils/utils";
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import {AxiomAccount,isoBase64URL} from "axiom-smart-account-test";
import VerifyTransferModal from "@/components/VerifyTransferModal";
import { sha256 } from "js-sha256";
import BioAxiomResultModal from "@/components/BioAxiomResultModal";
import { getUserInfo, deviceIsOpenBio, isReplaceBioPayment, checkBioPasskeyCreate, checkBioPasskey } from "@/services/login";

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const BioPayment = (props: any) => {
    const email: string | any = getMail();
    const { userInfo, dispatch } = props;
    const [isSwitch, setIsSwitch] = useState(false);
    const [message, setMessage] = useState('Please only enable Bio-Payment on secure devices');
    const [isLock, setIsLock] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState("");
    const [axiomResultOpen, setAxiomResultOpen] = useState(false);
    const [axiomResultStatus, setAxiomResultStatus] = useState("");
    const {showSuccessToast, showErrorToast} = Toast();
    const [isOpen, setIsOpen] = useState(false);
    const [pinLoading, setPinLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [publicKey, setPublicKey] = useState<any>({});

    useEffect(() => {
        if(userInfo.bio_payment_status === 1) {
            setIsSwitch(true);
        }
    }, [props.userInfo])

    const handleChange = async (e: any) => {
        const times = await transferLockTime({email});
        const deviceId = localStorage.getItem("visitorId");

        if(times > 0) {
            showErrorToast("Your account is currently frozen. Please try again tomorrow ！");
            return;
        }
        if(!e.target.checked) {
            setResultOpen(true);
            setResultStatus("loading");
            const isdevice = await deviceIsOpenBio({email, device_id: deviceId});
            if(isdevice === 0) {
                await createPasskey();
            }else {
                const isRepalce = await isReplaceBioPayment({email, device_id: deviceId});
                if(isRepalce === 1) {
                    await verifyPasskey(true);
                }else {
                    await verifyPasskey(false);
                }
            }
        }else {
            try{
                await bioClose({email, device_id: deviceId});
                setIsSwitch(false);
                const userRes = await getUserInfo(email, deviceId);
                if(userRes){
                    dispatch({
                        type: 'global/setUser',
                        payload: userRes,
                    })
                }
            }catch(error: any) {
                showErrorToast(error)
            }
        }
    }

    const verifyPasskey = async (isRepalce: boolean) => {
        const deviceId = localStorage.getItem("visitorId");
        const res = await checkBioPasskeyCreate({
            email: email,
            device_id: deviceId,
        })
        const verifyRes = JSON.parse(res.credentials_json);
        let publicKey: any;
        try {
            publicKey = await startAuthentication({
                challenge: verifyRes.publicKey.challenge,
                rpId: verifyRes.publicKey.rpId,
                allowCredentials: [verifyRes.publicKey.allowCredentials[0]]
            })
            setResultStatus("success");
            localStorage.setItem("allowCredentials", publicKey.id)
        }catch(error: any) {
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setResultStatus("cancel");
            }else {
                setResultStatus("failed");
            }
            return;
        }

        try {
            await checkBioPasskey({
                email: email,
                result: JSON.stringify(publicKey),
                device_id: deviceId
            })
        }catch (error: any) {
            showErrorToast(error)
            return;
        }

        if(isRepalce) {
            setTimeout(async () => {
                setAxiomResultOpen(true);
                setIsOpen(false);
                setAxiomResultStatus("loading");
                try {
                    const axiom = await AxiomAccount.fromPasskey(userInfo.address);
                    await axiom.updatePasskey({response: publicKey, expectedChallenge: "", expectedOrigin: ""}, {})
                    setAxiomResultStatus("success");
                    setIsSwitch(true);
                    const userRes = await getUserInfo(email, deviceId);
                    if(userRes){
                        dispatch({
                            type: 'global/setUser',
                            payload: userRes,
                        })
                    }
                }catch(err: any) {
                    console.log(err, '-------updatepasskey')
                    setAxiomResultStatus("failed");
                    return;
                }
            }, 1000)
        }else {
            setIsSwitch(true);
            const userRes = await getUserInfo(email, deviceId);
            if(userRes){
                dispatch({
                    type: 'global/setUser',
                    payload: userRes,
                })
            }
        }
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
            publicKeyCredential = await startRegistration(registerObj);
            setPublicKey(publicKeyCredential);
            setResultStatus("opened");
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
    }

    const handleResultClose = async () => {
        setResultOpen(false);
    }

    const handleSubmit = async (password: any) => {
        setPinLoading(true);
        setMsg("");
        let axiom:any;
        try {
            axiom = await AxiomAccount.fromEncryptedKey(sha256(password), userInfo.transfer_salt, userInfo.enc_private_key, userInfo.address);
        }catch (e: any) {
            setPinLoading(false);
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                wrongPassword({email}).then(async () => {
                    const times = await passwordTimes({email})
                    if(times > 0) {
                        if(times < 4) {
                            setMsg(`Invalid password , only ${times} attempts are allowed today!`)
                        }else {
                            setMsg(`Invalid password`)
                        }
                    }else {
                        setMsg("Invalid password , your account is currently locked. Please try again tomorrow !")
                    }
                }).catch((err: any) => {
                    setMsg(err)
                })
            }
            return;
        }
        setAxiomResultOpen(true);
        setIsOpen(false);
        setAxiomResultStatus("loading");
        try {
            await axiom.updatePasskey({response: publicKey, expectedChallenge: "", expectedOrigin: ""}, {})
            setAxiomResultStatus("success");
        }catch(err: any) {
            console.log(err, '-------updatepasskey')
            setAxiomResultStatus("failed");
            return;
        }
        const visitorId = userInfo.device_id;
        localStorage.setItem("allowCredentials", publicKey.id)
        try {
            await bioCheck({email, device_id: visitorId, result: JSON.stringify(publicKey)});
            setIsSwitch(true);
            const deviceId = localStorage.getItem('visitorId');
            const userRes = await getUserInfo(email, deviceId);
            if(userRes){
                dispatch({
                    type: 'global/setUser',
                    payload: userRes,
                })
            }
        }catch (error: any) {
            showErrorToast(error);
            setResultStatus("failed");
            return;
        }
    }

    const handleVerifyOpen = () => {
        setResultOpen(false);
        setIsOpen(true);
    }

    return (
        <ChakraProvider theme={theme}>
            <Page needBack backFn={() => history.push('/security')}>
                <div>
                    <AlertPro title={message} />
                    <h1 className='page-title' style={{marginTop: "20px"}}>Bio Payment</h1>
                    <p className={styles.freeTip}>After enabling bio payment , you can use Passkey for quick identity verification during transactions and other operations.</p>
                    <div className={styles.freeSwitch}>
                        <span>Bio payment</span>
                        <div><Switch id='email-alerts' size='lg' colorScheme='yellow' isChecked={isSwitch} onChange={handleChange} /></div>
                    </div>
                </div>
            </Page>
            <BioResultModal isOpen={resultOpen} status={resultStatus} onVerify={handleVerifyOpen} onClose={handleResultClose} loadingTip="Only use it on a safety device" />
            <VerifyTransferModal pinLoading={pinLoading} onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false);}} errorMsg={msg} />
            <BioAxiomResultModal isOpen={axiomResultOpen} onClose={() => {setAxiomResultOpen(false)}} status={axiomResultStatus} name={""} />
        </ChakraProvider>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(BioPayment)