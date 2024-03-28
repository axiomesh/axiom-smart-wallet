import styles from './index.less'
import React, { useState } from "react";
import { ReactComponent as Free } from '@/assets/security/free.svg'
import { ReactComponent as Unlock } from '@/assets/security/unlock.svg'
import { ReactComponent as Transfer } from '@/assets/security/transfer.svg'
import { history } from 'umi';

interface listItem {
    label: string,
    tip: string
}

const list: listItem[] = [
    {
        label: "unlock",
        tip: "Reset Unlock Password"
    },
    {
        label: "transfer",
        tip: "Reset Transfer Password"
    },
    {
        label: "free",
        tip: "Password-free Transfer"
    }
]

const Security = () => {
    const [isHover, setIsHover] = useState<number>(null);
    const handleClickItem = (i: number) => {
        if(i === 2){
            history.push('/security/reset-unlock-password')
        }
    }


    return (
        <div className={styles.security}>
            <h1 className={styles.securityTitle}>Security</h1>
            <div className={styles.securityList}>
                {
                    list.map((item: listItem, index: number) => (
                        <div className={styles.securityListItem} onClick={() => handleClickItem(index)} onMouseEnter={() => {setIsHover(index)}} onMouseLeave={() => {setIsHover(null)}}>
                            {index === isHover ? <div className={styles.securityListItemHover}></div> : null}
                            {item.label === "unlock" ? <Unlock fill={index === isHover ? "#ECC94B" : "#171923"}/> : item.label === "transfer" ? <Transfer stroke={index === isHover ? "#ECC94B" : "#171923"}/> : <Free fill={index === isHover ? "#ECC94B" : "#171923"}/>}
                            <span>{item.tip}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Security;
