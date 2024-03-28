import styles from "./index.less"
import ModalInputPassword from "@/components/ModalInputPassword";
import React from "react";

const TransferPassword = () => {
    return (
        <div>
            <div className={styles.setPassTitle}><span className={styles.setPassText}>Transfer password</span><span className={styles.setPassTip}>（Supports numbers from 0 to 9）</span></div>
            <ModalInputPassword />
            <div className={styles.setPassTitle}><span className={styles.setPassText}>Transfer password</span></div>
            <ModalInputPassword />
        </div>
    )
}

export default TransferPassword;
