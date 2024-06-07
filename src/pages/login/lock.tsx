import styles from './index.less';
import ButtonPro from '@/components/Button'
import { history } from 'umi';
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
import { checkUnlockPasskeyCreate, checkUnlockPasskey } from "@/services/login";
import { startAuthentication } from '@simplewebauthn/browser';

export default function LockPage() {
    const email: string | any = getMail();
    const [open, setOpen] = useState(false);
    const [auth, setAuth] = useState<any>("");
    const {showErrorToast} = Toast();

    const handleSubmit = async () => {
        history.push('/lock-password');
    }

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        handleGetAuth()
        if(!email) history.replace('/login')
    }, [])

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

    }, [])

    const handleGetAuth = async () => {
        const visitorId = localStorage.getItem('visitorId');
        const auth = await checkUnlockPasskeyCreate({email, device_id: visitorId});
        setAuth(auth);
    }

    const handlePasskeyClick = async() => {
        const verifyRes = JSON.parse(auth.credentials_json);
        const visitorId = localStorage.getItem('visitorId');
        const authentication = await startAuthentication({
            challenge: verifyRes.publicKey.challenge,
            rpId: verifyRes.publicKey.rpId,
            allowCredentials: [{
                "type": "public-key",
                "id": auth.credential_id
            }]
        })
        localStorage.setItem("allowCredentials", auth.credential_id)
        let token: any;
        try {
            token = await checkUnlockPasskey({
                email: email,
                result: JSON.stringify(authentication),
                device_id: visitorId
            })
            setTimeout(() => {
                history.replace('/home');
            }, 10)
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
                    <Popover trigger="hover" strategy="fixed" placement="bottom-start">
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
                    </Popover>
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={handleClose} />
      </div>
  );
}
