import styles from './index.less'
import React, {useState, useEffect} from "react";
import { ReactComponent as Free } from '@/assets/security/free.svg'
import { ReactComponent as Unlock } from '@/assets/security/unlock.svg'
import { ReactComponent as Transfer } from '@/assets/security/transfer.svg'
import { history } from 'umi';
import {lockPage} from "@/services/login";
import {getMail} from "@/utils/help";
import Toast from "@/hooks/Toast";
import {connect} from "@@/exports";

interface listItem {
    label: string,
    tip: string
}

const primitiveList: listItem[] = [
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

const Security = (props: any) => {
    const email: string | any = getMail();
    const [isHover, setIsHover] = useState<number | any>(null);
    const [list, setList] = useState<listItem[]>([]);
    const {showErrorToast} = Toast();
    const { userInfo } = props;

    useEffect(() => {
        if(userInfo.pay_password_set_status === 0) {
            let arr = [];
            primitiveList.map((item: listItem, index: number) => {
                if(index === 0){
                    arr.push(item)
                }
            })
            setList(arr)
        }else {
            setList(primitiveList)
        }
    }, [userInfo])

    const handleClickItem = async (i: number) => {
        if(i === 0){
            try{
                history.push('/security/reset-unlock-password')
            } catch (e){
                // @ts-ignore
                showErrorToast(e)
            }

        }
        if(i === 1) {
            history.push('/reset-transfer')
        }
        if(i === 2) {
            history.push('/transfer-free')
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

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Security)
