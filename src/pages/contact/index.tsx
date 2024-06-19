import styles from "@/pages/security/index.less";
import React, { useState } from "react";
import { ReactComponent as Email } from '@/assets/security/email.svg'
import { ReactComponent as Discord } from '@/assets/security/discord.svg'
import { ReactComponent as Copy } from '@/assets/security/copy.svg'
import handleClipboard from "@/utils/clipboard"


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
    const [isCopy, setIsCopy] = useState<boolean>(false);
    const axiomEmail = "support@axiomesh.io";

    const toUrl = (item: listItem,e: any) => {
        if(item.label === "discord") {
            window.open("https://discord.com/invite/jsa3chGSzU");
        }else if(item.label === "email") {
            handleClipboard(axiomEmail, e)
            setIsCopy(true);
            setTimeout(() => {
                setIsCopy(false)
            },300)
        }
    }

    const handleCopy = (e: any) => {
        e.stopPropagation();
        handleClipboard(axiomEmail, e)
        setIsCopy(true);
        setTimeout(() => {
            setIsCopy(false)
        },300)
    }

    return (
        <div className={styles.security}>
            <h1 className={styles.securityTitle}>Contact</h1>
            <div className={styles.securityList}>
                {
                    list.map((item: listItem, index: number) => (
                        <div onClick={(e) => {toUrl(item,e)}} className={`${styles.securityListItem} ${item.label === "discord" ? styles.securityListDiscord: null}`} onMouseEnter={() => {setIsHover(index)}} onMouseLeave={() => {setIsHover(null)}}>
                            {index === isHover ? <div className={styles.securityListItemHover}></div> : null}
                            {item.label === "email" ? <Email fill={index === isHover ? "#ECC94B" : "#171923"}/> : <Discord stroke={index === isHover ? "#ECC94B" : "#171923"}/>}
                            <span>{item.tip}</span>
                            {item.label === "email" && <div className={styles.securityListItemCopy} onClick={handleCopy}>
                                <span>{axiomEmail}</span>
                                {isCopy ? <img style={{width: "16px", height: "11px"}} src={require("@/assets/security/copy-success.png")} alt="" /> : <Copy fill={index === isHover ? "#ECC94B" : "#718096"}/>}
                            </div>}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Contact;
