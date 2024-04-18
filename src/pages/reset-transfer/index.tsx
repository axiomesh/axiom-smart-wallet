import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import Back from "@/components/Back";
import {sendVerifyCode, checkVerifyCode, setNewPassword, transferLockTime, passwordTimes} from "@/services/transfer"
import {history} from "@@/core/history";
import {getMail} from "@/utils/help";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";
import { encrypt, deriveAES256GCMSecretKey, generateSigner } from "axiom-smart-account-test";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import {getUserInfo} from "@/services/login";
import Prompt from "@/components/Prompt";

let loadTimer:any = null;
const ResetTransfer = (props: any) => {
    const {dispatch} = props;
    const [isLock, setIsLock] = useState(false);
    const [step, setStep] = useState(0);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState('');
    const [info, setInfo] = useState<any>({});
    const [isError, setIsError] = useState(false);
    const email = getMail();
    const { userInfo } = props;
    const { Button } = ContinueButton();
    const {showSuccessToast, showErrorToast} = Toast();
    const [toastMsg, setToastMsg] = useState("");

    useEffect(() => {
        async function times() {
            const times = await transferLockTime({email});
            console.log(times)
            if(times > 0) {
                setToastMsg("The current account has been frozen. Resetting the password will take effect immediately after the lock is removed.")
            }else {
                setToastMsg('Your account will be locked for 24 hours after resetting your password, and transactions cannot be sent normally.')
            }
        }
        times();
    }, [])

    useEffect(() => {
        setInfo(userInfo)
        if(userInfo && userInfo.pay_password_set_status === 2)
            setIsLock(true)
    },[userInfo])

    const runTimer = (cm = 120) => {
        if(cm > 0) {
            if(cm >= 10){
                setTimer(`${cm} s` )
            } else {
                setTimer(`0${cm} s` )
            }
            loadTimer = setTimeout(() => {
                cm -=1;
                runTimer(cm)
            }, 1000)
        } else {
            setTimer('');
        }
    }

    const handleBack = () => {
        history.push('/security')
    }

    const handleSendEmail = () => {
        sendVerifyCode(email).then((res: any) => {
            runTimer(Number((res / 1000).toFixed(0)))
            setStep(1);
        })
    }

    const handleVerify = (code: string) => {
        checkVerifyCode(email, code).then((res: any) => {
            setMessage("Are you sure to cancel password reset?")
            setStep(2);
        }).catch((error: any) => {
            setIsError(true)
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
            const encryptedPrivateKey = encrypt(signer.privateKey, secretKey.toString());
            setNewPassword(email,info.enc_private_key,encryptedPrivateKey, signer.address, salt, transferSalt).then(async (res: any) =>{
                const userRes = await getUserInfo(email);
                if(userRes){
                    dispatch({
                        type: 'global/setUser',
                        payload: userRes,
                    })
                }
                setInfo(userRes);
                showSuccessToast("Password reset successfully！");
                setMessage("")
                setStep(0)
            }).catch((err: any) => {
                showErrorToast(err)
            })
        }catch (error) {
            console.log(error)
            showErrorToast("failed")
        }
    }

    return (
        <div className={styles.reset}>
            <Prompt message={message} />
            <Back onClick={handleBack} />
            <div className={styles.resetToast}><img src={require("@/assets/reset/toast.png")} alt=""/><span>{toastMsg}</span></div>
            <h1>Reset Transfer Password</h1>
            <p className={styles.resetTip}>Please complete the email verification code first .</p>
            {step === 0 && <div className={styles.resetVerify} onClick={handleSendEmail}>
                <span>Send a verify email</span>
            </div>}
            {step === 1 && <div style={{marginTop: "20px"}}><InputPassword isError={isError} setIsError={setIsError} onSend={handleSendEmail} onVerify={handleVerify} needTimer={false} timer={timer}/></div>}
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
