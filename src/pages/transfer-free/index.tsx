import styles from "./index.less"
import React from "react";
import Back from "@/components/Back";
import { Switch } from '@chakra-ui/react'

const TransferFree = () => {
    return (
        <div className={styles.free}>
            <Back />
            <h1 className={styles.freeTitle}>Reset Transfer Password</h1>
            <p className={styles.freeTip}>once activated，you can enjoy the quick experience of transferring small amounts without the need for password verification .</p>
            <div className={styles.freeSwitch}>
                <span>Password-free transfer switch </span>
                <Switch id='email-alerts' size='lg' colorScheme='yellow' />
            </div>
        </div>
    )
}
export default TransferFree;
