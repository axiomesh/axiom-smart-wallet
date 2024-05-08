import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import {sendVerifyCode, checkVerifyCode, setNewPassword, transferLockTime} from "@/services/transfer"
import {history} from "@@/core/history";
import {getMail} from "@/utils/help";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";
import { encrypt, deriveAES256GCMSecretKey, generateSigner } from "axiom-smart-account-test";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import {getUserInfo} from "@/services/login";
import Prompt from "@/components/Prompt";
import Page from '@/components/Page'
import AlertPro from "@/components/Alert";

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
    const [btnLoading, setBtnLoading] = useState(false);

    useEffect(() => {
        async function times() {
            const times = await transferLockTime({email});
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
        if(!btnLoading) {
            setBtnLoading(true);
        sendVerifyCode(email).then((res: any) => {
            sessionStorage.setItem('EndTime', (new Date()).getTime() + res)
            runTimer(Number((res / 1000).toFixed(0)))
            setMessage('Are you sure to cancel password reset?')
            setStep(1);
                setBtnLoading(false);
        }).catch((error: any) =>{
                showErrorToast(error);
        })
        }
    }

    const handleVerify = (code: string) => {
        checkVerifyCode(email, code).then((res: any) => {
            setMessage("Are you sure to cancel password reset?")
            setStep(2);
        }).catch((error: any) => {
            setIsError(true)
        })
    }

    const handleVisibilityChange = () => {
        if (document.hidden) {
            if(loadTimer){
                clearTimeout(loadTimer)
            }
        } else {
            const endTime  = sessionStorage.getItem('EndTime')
            const newDate = Number(((Number(endTime) - (new Date()).getTime())/ 1000).toFixed(0))
            if(newDate <= 0 ){
                runTimer(0)
            } else {
                runTimer(newDate);
            }
        }
    }


    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    }, []);

    const handleCallBack = (value: string) => {
        setPassword(value)
    }

    const handleSubmit = async () => {
        if(password === ""){
            return;
        }
        if(!btnLoading) {
            setBtnLoading(true);
        const salt = generateRandomBytes(16);
        const transferSalt = generateRandomBytes(16);
        try {
            const signer = generateSigner();
            const secretKey = await deriveAES256GCMSecretKey(sha256(password), transferSalt);
            const encryptedPrivateKey = encrypt(signer.privateKey, secretKey.toString());
            console.log(signer.privateKey);
            console.log(signer.address);
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
                setToastMsg("The current account has been frozen. Resetting the password will take effect immediately after the lock is removed.");
                setBtnLoading(false);
                setMessage("")
                setMessage('')
                setStep(0)
            }).catch((err: any) => {
                    setBtnLoading(false);
                showErrorToast(err)
            })
        }catch (error) {
            console.log(error)
                setBtnLoading(false);
            showErrorToast("failed")
        }
    }
    }

    return (
        <>
            <Prompt message={message} />
            <Page needBack backFn={() => history.push('/security')}>
               <div>
                   <div style={{marginBottom: 20}}>
                       <AlertPro title={toastMsg} />
                   </div>
                   <div className='page-title'>Reset Transfer Password</div>
                   <p className={styles.resetTip}>Please complete the email verification code first .</p>
                   {step === 0 && <div className={styles.resetVerify} onClick={handleSendEmail}>
                       <Button loading={btnLoading}>Send a verify email</Button>
                   </div>}
                   {step === 1 && <div style={{marginTop: "20px"}}><InputPassword isError={isError} setIsError={setIsError} onSend={handleSendEmail} onVerify={handleVerify} needTimer={false} timer={timer}/></div>}
                   {step === 2 && <div style={{marginTop: "20px"}}>
                       <TransferPassword onSubmit={handleCallBack} />
                       <div style={{width: "320px",marginTop: "40px"}} onClick={handleSubmit}><Button loading={btnLoading}>Confirm</Button></div>
                   </div>}
               </div>
            </Page>
        </>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(ResetTransfer)
