import styles from "./index.less"
import React, { useState } from 'react';

const ResetTransfer = () => {
    const [isLock, setIsLock] = useState(true);

    return (
        <div className={styles.reset}>
            <div className={styles.resetBack}>
                <img src={require("@/assets/reset/back.png")} alt=""/>
                <span>Back</span>
            </div>
            {
                isLock && <div className={styles.resetToast}><img src={require("@/assets/reset/toast.png")} alt=""/><span>The current account has been frozen. Resetting the password will take effect immediately after the lock is removed.</span></div>
            }
            <h1>Reset Transfer Password</h1>
            <p className={styles.resetTip}>Please complete the email verification code first .</p>
            <div className={styles.resetVerify}>
                <span>Send a verify email</span>
            </div>
        </div>
    )
}

export  default ResetTransfer;
