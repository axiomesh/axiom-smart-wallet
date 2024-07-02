import styles from "./index.less";
import React, { useState, useEffect } from "react";
import Page from '@/components/Page';
import { history, connect } from 'umi';
import { passkeySecurityInfo } from "@/services/transfer";
import {getMail} from "@/utils/help";
import { convertTimestampToDate } from "@/utils/utils";
import Toast from "@/hooks/Toast";

const passkeySecurity = (props: any) => {
    const email: string | any = getMail();
    const { userInfo } = props;
    const [passkeyInfo, setPasskeyInfo] = useState<any>([]);
    const {showErrorToast} = Toast();

    useEffect(() => {
        handleGetPasskeyInfo()
    }, [userInfo])

    const handleGetPasskeyInfo = (async () => {
        try {
            const result = await passkeySecurityInfo({email: email, device_id: userInfo.device_id});
            setPasskeyInfo(result);
        }catch (error: any) {
            showErrorToast(error);
        }
    })

    const handleGetTipList = () => {
        return [
            "Safari on MacOS",
            "Chrome on MacOS",
            "Opera on Windows"
        ]
    }

    return (
        <Page needBack backFn={() => history.push('/security')}>
            <div>
                <h1 className='page-title' style={{marginTop: "20px"}}>Passkey Security</h1>
                <p className={styles.passkeyTip}>Your passkey information display here</p>
                <div className={styles.passkeyContent}>
                    {
                        passkeyInfo.map((item: any, index: number) => {
                            return (
                                <div className={styles.passkeyItem} key={index}>
                                    <div className={styles.passkeyItemTop}>
                                        <img src={require(`@/assets/passkey/${item.device_type}.png`)} alt="" />
                                        <div className={styles.passkeyItemTopRight}>
                                            <p>Key {convertTimestampToDate(item.active_time)}</p>
                                            <div className={styles.passkeyItemTopRightBtn}>
                                                <div className={styles.passkeyItemTopRightBtnLeft}>Passkey</div>
                                                <div className={styles.passkeyItemTopRightBtnRight}>{item.device_type === "Mac" || item.device_type === "Windows" ? "Seen from this device" : "From trusted phone"}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.passkeyItemTip}>
                                        <img src={require("@/assets/passkey/safe.png")} alt="" />
                                        <span>Your passkey is protected by biometrics and can never be obtained by Google, iCloud, or AxiomWallet</span>
                                    </div>
                                    <div className={styles.passkeyItemBottom}>
                                        <div className={styles.passkeyItemBottomTitle}>Supported device</div>
                                        <div className={styles.passkeyItemBottomTip}>Where you can log in current account with Passkey</div>
                                        <div className={styles.passkeyItemBottomContent}>
                                            {
                                                handleGetTipList().map((tip: string, tipIndex: number) => {
                                                    return (
                                                        <div key={tipIndex} className={styles.passkeyItemBottomContentItem}>{item.device_type === "Mac" || item.device_type === "Windows" ? <img src={require("@/assets/passkey/pc.png")} alt="" /> : <img src={require("@/assets/passkey/phone.png")} alt="" />}<span>{tip}</span></div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </Page>
    )
};

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(passkeySecurity)