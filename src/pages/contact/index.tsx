import styles from "@/pages/security/index.less";
import React, { useState } from "react";
import { ReactComponent as Email } from '@/assets/security/email.svg'
import { ReactComponent as Discord } from '@/assets/security/discord.svg'
import { ReactComponent as Copy } from '@/assets/security/copy.svg'


interface listItem {
    label: string,
    tip: string
}

const list: listItem[] = [
    {
        label: "email",
        tip: "Official Email"
    },
    {
        label: "discord",
        tip: "Discord"
    }
]

const Contact = () => {
    const [isHover, setIsHover] = useState<number>(null);

    const toUrl = (item: listItem) => {
        if(item.label === "discord") {
            window.open("https://discord.com/invite/jsa3chGSzU");
        }
    }

    return (
        <div className={styles.security}>
            <h1 className={styles.securityTitle}>Contact</h1>
            <div className={styles.securityList}>
                {
                    list.map((item: listItem, index: number) => (
                        <div onClick={() => {toUrl(item)}} className={`${styles.securityListItem} ${item.label === "discord" ? styles.securityListDiscord: null}`} onMouseEnter={() => {setIsHover(index)}} onMouseLeave={() => {setIsHover(null)}}>
                            {index === isHover ? <div className={styles.securityListItemHover}></div> : null}
                            {item.label === "email" ? <Email fill={index === isHover ? "#ECC94B" : "#171923"}/> : <Discord stroke={index === isHover ? "#ECC94B" : "#171923"}/>}
                            <span>{item.tip}</span>
                            {item.label === "email" && <div className={styles.securityListItemCopy}><span>support@axiomesh.io</span><Copy
                                fill={index === isHover ? "#ECC94B" : "#718096"}/></div>}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Contact;
