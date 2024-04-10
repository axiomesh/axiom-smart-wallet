import styles from "./index.less"
import React, { useState } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import Back from "@/components/Back";
import { sendVerifyCode, checkVerifyCode, setNewPassword } from "@/services/transfer"
import {history} from "@@/core/history";
const CryptoJS = require("crypto-js")
import {getMail} from "@/utils/help";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";

const ResetTransfer = (props: any) => {
    const [isLock, setIsLock] = useState(true);
    const [step, setStep] = useState(0);
    const email = getMail();
    const { userInfo } = props;
    const { Button } = ContinueButton();

    const handleBack = () => {
        history.push('/security')
    }

    const handleSendEmail = () => {
        sendVerifyCode(email).then((res: any) => {
            setStep(1);
        })
    }

    const handleVerify = (code: string) => {
        checkVerifyCode(email, code).then((res: any) => {
            setStep(2);
        })
    }

    const handleSubmit = (value: string) => {
        const salt = generateRandomBytes(16).join("");
        const transferSalt = generateRandomBytes(16).join("");
        setNewPassword(email,userInfo.enc_private_key,value, "0xb14252d0C4e2d3B39c49dEb4DA5631C9dD575c22", salt, transferSalt).then((res: any) =>{

        })
    }

    return (
        <div className={styles.reset}>
            <Back onClick={handleBack} />
            {
                isLock && <div className={styles.resetToast}><img src={require("@/assets/reset/toast.png")} alt=""/><span>The current account has been frozen. Resetting the password will take effect immediately after the lock is removed.</span></div>
            }
            <h1>Reset Transfer Password</h1>
            <p className={styles.resetTip}>Please complete the email verification code first .</p>
            {step === 0 && <div className={styles.resetVerify} onClick={handleSendEmail}>
                <span>Send a verify email</span>
            </div>}
            {step === 1 && <div style={{marginTop: "20px"}}><InputPassword onVerify={handleVerify} needTimer={false} timer="120"/></div>}
            {step === 2 && <div style={{marginTop: "20px"}}>
                <TransferPassword onSubmit={handleSubmit} />
                <div style={{width: "320px",marginTop: "40px"}}><Button>Confirm</Button></div>
            </div>}
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(ResetTransfer)
