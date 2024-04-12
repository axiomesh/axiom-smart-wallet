import styles from "./index.less"
import React, { useState } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import Back from "@/components/Back";
import {sendVerifyCode, checkVerifyCode, setNewPassword, setFirstPassword} from "@/services/transfer"
import {history} from "@@/core/history";
import {getMail} from "@/utils/help";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";
import { encrypt, deriveAES256GCMSecretKey, decrypt, AxiomAccount, generateSigner } from "axiom-smart-account-test";
import { Wallet } from "ethers";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import {getUserInfo} from "@/services/login";

const ResetTransfer = (props: any) => {
    const {dispatch} = props;
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
        try {
            const signer = generateSigner();
            const secretKey = await deriveAES256GCMSecretKey(sha256(password), transferSalt);
            const encryptedPrivateKey = encrypt(signer.privateKey, secretKey);
            setNewPassword(email,userInfo.enc_private_key,encryptedPrivateKey, signer.address, salt, transferSalt).then(async (res: any) =>{
                const userRes = await getUserInfo(email);
                if(userRes){
                    dispatch({
                        type: 'global/setUser',
                        payload: res,
                    })
                }
                showSuccessToast("Password reset successfully！");
                setStep(0)
            }).catch((err: any) => {
                showErrorToast(err)
            })
        }catch (error) {
            console.log(error)
        }
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
