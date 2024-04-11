import styles from "./index.less"
import React, { useState } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import Back from "@/components/Back";
import { sendVerifyCode, checkVerifyCode, setNewPassword } from "@/services/transfer"
import {history} from "@@/core/history";
import {getMail} from "@/utils/help";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";
import { encrypt, deriveAES256GCMSecretKey } from "axiom-smart-account-test";
import { Wallet } from "ethers";
import Toast from "@/hooks/Toast";

const ResetTransfer = (props: any) => {
    const [isLock, setIsLock] = useState(true);
    const [step, setStep] = useState(0);
    const [password, setPassword] = useState('');
    const email = getMail();
    const { userInfo } = props;
    const { Button } = ContinueButton();
    const {showSuccessToast, showErrorToast} = Toast();

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

    const handleCallBack = (value: string) => {
        setPassword(value)
    }

    const handleSubmit = async () => {
        const salt = generateRandomBytes(16);
        const transferSalt = generateRandomBytes(16);
        const token = sessionStorage.getItem('token');
        const secretkey = await deriveAES256GCMSecretKey(token, transferSalt);
        const wallet = Wallet.createRandom();
        const privateKey = wallet.privateKey;
        const encrpty = encrypt(privateKey,secretkey.toString())
        setNewPassword(email,userInfo.enc_private_key,encrpty, "0x7493D54aF7beB0F75c44BCd3728905491D681fB1", salt, transferSalt).then((res: any) =>{
            showSuccessToast("Password reset successfully！");
            setStep(0)
        }).catch((err: any) => {
            showErrorToast(err)
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
                <TransferPassword onSubmit={handleCallBack} />
                <div style={{width: "320px",marginTop: "40px"}} onClick={handleSubmit}><Button>Confirm</Button></div>
            </div>}
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(ResetTransfer)
