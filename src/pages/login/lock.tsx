import styles from './index.less';
import ButtonPro from '@/components/Button'
import { history, useLocation } from 'umi';
import React, {useEffect, useState} from "react";
import Right from './componments/right';
import {getMail} from "@/utils/help";
import LogoutModal from './componments/logout-modal';
import Toast from "@/hooks/Toast";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
} from '@chakra-ui/react';
import { checkUnlockPasskeyCreate, checkUnlockPasskey, isOpenBio } from "@/services/login";
import { startAuthentication } from '@simplewebauthn/browser';
import { detectBrowser, getSafariVersion } from '@/utils/utils';
import BioResultModal from '@/components/BioResultModal';
import {connect} from "@@/exports";

function LockPage(props: any) {
    const { dispatch } = props;
    const email: string | any = getMail();
    const [open, setOpen] = useState(false);
    const [isBioOpen, setIsBioOpen] = useState(0);
    const [openBioResult, setOpenBioResult] = useState(false);
    const [bioResultStatus, setBioResultStatus] = useState('');
    const [auth, setAuth] = useState<any>("");
    const {showErrorToast} = Toast();
    const location = useLocation();

    const handleSubmit = async () => {
        history.push('/lock-password');
    }

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        handleGetAuth()
        if(!email) history.replace('/login')
        dispatch({
            type: 'global/setFreeForm',
            payload: "",
        })
        dispatch({
            type: 'global/setForm',
            payload: {},
        })
    }, [])

    useEffect(() => {
        console.log(location)
    }, [location])

    useEffect(() => {
        // @ts-ignore
        let unblock =  history.block((tx:any) => {
            if (tx.action === 'POP') {
                return false;
            } else {
                unblock();
                tx.retry()
            }
        });
        const deviceId = localStorage.getItem('visitorId');
        hanldeIsOpenBio(deviceId)
    }, [])

    const hanldeIsOpenBio = async (deviceId: string | null) => {
        const isOpen = await isOpenBio({
            email: email,
            device_id: deviceId,
        });
        setIsBioOpen(isOpen);
    }

    const handleGetAuth = async () => {
        const visitorId = localStorage.getItem('visitorId');
        const auth = await checkUnlockPasskeyCreate({email, device_id: visitorId});
        setAuth(auth);
    }

    const handlePasskeyClick = async() => {
        setOpenBioResult(true);
        setBioResultStatus("loading");
        const verifyRes = JSON.parse(auth.credentials_json);
        const visitorId = localStorage.getItem('visitorId');
        let transports = [verifyRes.transport];
        const browser = detectBrowser();
        if(browser === "safari") {
            const version = getSafariVersion();
            if(version && version.version == 16) {
                transports = ["internal", verifyRes.transport]
            }
        }
        let authentication: any;
        try {
            authentication = await startAuthentication({
                challenge: verifyRes.publicKey.challenge,
                rpId: verifyRes.publicKey.rpId,
                allowCredentials: [{
                    "type": "public-key",
                    "id": auth.credential_id,
                    "transports": [auth.transport]
                }],
                userVerification: "required"
            })
            localStorage.setItem("allowCredentials", auth.credential_id)
        }catch (error: any) {
            console.log(error, '------lock')
            setOpenBioResult(true);
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setBioResultStatus("cancel");
            }else {
                setBioResultStatus("failed");
            }
            return;
        }
        let token: any;
        try {
            token = await checkUnlockPasskey({
                email: email,
                result: JSON.stringify(authentication),
                device_id: visitorId
            })
            setBioResultStatus("back");
            setTimeout(() => {
                setOpenBioResult(false)
                history.replace('/home');
            }, 1000)
        }catch (error: any) {
            showErrorToast(error)
            return;
        }
    }

  return (
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <div className={styles.desc} style={{fontSize: 20, marginBottom: 8}}>Welcome back</div>
                    <div className={styles.title}>{email}</div>
                    <a className='a_link' onClick={() => setOpen(true)} style={{marginTop: 4, fontSize: 14}}>
                        Use a different account
                    </a>
                    {/* <ButtonPro mt="20px" onClick={handleSubmit}>Continue</ButtonPro> */}
                    {isBioOpen === 0 ? <Popover trigger="hover" strategy="fixed" placement="bottom-start">
                        <PopoverTrigger><div className={styles.keyBtn} onClick={handlePasskeyClick}><i className={styles.keyIcon}></i><span>Continue with phone</span></div></PopoverTrigger>
                        <PopoverContent style={{borderRadius: "32px", padding: "20px"}} width="auto">
                            <PopoverArrow />
                            <PopoverBody>
                                <div className={styles.passkeyContent}>
                                    <div className={styles.passkeyItem}>
                                        <img src={require("@/assets/login/ios.png")} alt="" />
                                        <span className={styles.passkeyItemTip}>For iPhone user</span>
                                        <span className={styles.passkeyItemScan}>scan by camera</span>
                                    </div>
                                    <div className={styles.passkeyItem}>
                                        <img src={require("@/assets/login/android.png")} alt="" />
                                        <span className={styles.passkeyItemTip}>For Android user</span>
                                        <span className={styles.passkeyItemScan}>scan by camera</span>
                                    </div>
                                </div>
                            </PopoverBody>
                        </PopoverContent>
                    </Popover> : <div>
                        <div className={styles.keyBtn} onClick={handlePasskeyClick}><i className={styles.keyBioIcon}></i><span>Continue</span></div>
                    </div>}
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={handleClose} />
          <BioResultModal isOpen={openBioResult} status={bioResultStatus} onClose={() => setOpenBioResult(false)} />
      </div>
  );
}
export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(LockPage)