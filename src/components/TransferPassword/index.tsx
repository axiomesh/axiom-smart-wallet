import styles from "./index.less"
import ModalInputPassword from "@/components/ModalInputPassword";
import React, { useState } from "react";

interface Props {
    onSubmit: (password: string) => void;
}


const TransferPassword = (props: Props) => {
    const [firstValue, setFirstValue] = useState<string>('');
    const [error, setError] = useState<Boolean>(false);

    const getSecondValue = (e: string) => {
        if(firstValue === e) {
            setError(false)
            props.onSubmit(e)
        }else {
            setError(true)
        }
    }

    const getFirstValue = (e: string) => {
        setFirstValue(e);
    }

    return (
        <div>
            <div className={styles.setPassTitle}><span className={styles.setPassText}>Transfer password</span><span className={styles.setPassTip}>（Supports numbers from 0 to 9）</span></div>
            <ModalInputPassword onSubmit={getFirstValue} />
            <div className={styles.setPassTitle}><span className={styles.setPassText}>Transfer password</span></div>
            <ModalInputPassword onSubmit={getSecondValue} isError={error} />
        </div>
    )
}

export default TransferPassword;
