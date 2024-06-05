import styles from "./index.less";
import React, { useState, useEffect } from "react";
import { switchTheme } from "@/pages/transfer-free/theme/index";
import Page from '@/components/Page';
import AlertPro from "@/components/Alert";
import {bioCreate, transferLockTime, bioCheck, bioClose} from "@/services/transfer";
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

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const BioPayment = (props: any) => {
    const email: string | any = getMail();
    const { userInfo } = props;
    const [isSwitch, setIsSwitch] = useState(false);
    const [message, setMessage] = useState('Please only enable Bio-Payment on secure devices');
    const [isLock, setIsLock] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultStatus, setResultStatus] = useState("");
    const {showSuccessToast, showErrorToast} = Toast();

    useEffect(() => {
        console.log(userInfo)
        if(userInfo.bio_payment_status === 1) {
            setIsSwitch(true);
        }
    }, [props.userInfo])

    const handleChange = async (e: any) => {
        const times = await transferLockTime({email});
        if(times > 0) {
            showErrorToast("Your account is currently frozen. Please try again tomorrow ！");
            return;
        }
        console.log(e.target.checked)
        // setIsSwitch(e.target.checked)
        if(!e.target.checked) {
            setResultOpen(true);
            setResultStatus("loading");
            await createPasskey();
        }else {
            try{
                await bioClose({email, device_id: userInfo.device_id});
                setIsSwitch(false);
            }catch(error: any) {
                showErrorToast(error)
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
            setIsSwitch(true);
            setResultStatus("opened");
        }catch (error: any) {
            showErrorToast(error);
            return;
        }
    }

    const handleResultClose = async () => {
        setResultOpen(false);
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
            <BioResultModal isOpen={resultOpen} status={resultStatus} onClose={handleResultClose} loadingTip="Only use it on a safety device" />
        </ChakraProvider>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(BioPayment)