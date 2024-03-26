import styles from "./index.less"
import React, { useState } from 'react';
import InputPassword from "@/components/InputPassword";
import TransferPassword from "@/components/TransferPassword";
import ContinueButton from "@/hooks/ContinueButton";
import Back from "@/components/Back";

const ResetTransfer = () => {
    const [isLock, setIsLock] = useState(true);
    const [setp, setStep] = useState(0);

    const { Button } = ContinueButton();

    const handleBack = () => {

    }

    return (
        <div className={styles.reset}>
            <Back onClick={handleBack} />
            {
                isLock && <div className={styles.resetToast}><img src={require("@/assets/reset/toast.png")} alt=""/><span>The current account has been frozen. Resetting the password will take effect immediately after the lock is removed.</span></div>
            }
            <h1>Reset Transfer Password</h1>
            <p className={styles.resetTip}>Please complete the email verification code first .</p>
            {setp === 0 && <div className={styles.resetVerify}>
                <span>Send a verify email</span>
            </div>}
            {setp === 1 && <div style={{marginTop: "20px"}}><InputPassword timer="120"/></div>}
            {setp === 2 && <div style={{marginTop: "20px"}}>
                <TransferPassword />
                <div style={{width: "320px",marginTop: "40px"}}><Button>Confirm</Button></div>
            </div>}
        </div>
    )
}

export  default ResetTransfer;
