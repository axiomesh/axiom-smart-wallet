import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import { history } from 'umi';
import { getQueryParam } from '@/utils/help';
import Right from "./componments/right";
import {useEffect, useState} from "react";
import {checkVerifyCode} from "@/services/login";
import { sendVerifyCode } from '@/services/login';

let loadTimer:any = null;
export default function VerifyCode() {
    const email = getQueryParam('email');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);

    const runTimer = (cm = 120) => {
        if(cm > 0) {
            if(cm >= 10){
                setTimer(`${cm} s` )
            } else {
                setTimer(`0${cm} s` )
            }
            loadTimer = setTimeout(() => {
                cm -=1;
                runTimer(cm)
            }, 1000)
        } else {
            setTimer('');
        }
    }

    const initData = async () => {
        const lastTime = await sendVerifyCode(email);
        runTimer(lastTime)
    }

    useEffect(() => {
        // initData();
        runTimer()

        return () => {
            if(loadTimer){
                clearTimeout(loadTimer)
            }
        }
    }, []);

    const handleVerify = async (code: string) => {
        try{
            setLoading(true)
            // const data =await checkVerifyCode({email, verify_code: code})
            ////0未注册，1已注册
            // if(data === 0) {
            //     history.push(`/set-password?email=${email}`)
            // } else {
            //     history.push(`/login-password?email=${email}`)
            // }

            history.push(`/set-password?email=${email}`)
        } catch (e) {
            setIsError(true)
        } finally {
            setLoading(false)
        }
    }

  return (
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <div className={styles.desc} style={{fontSize: 20, marginBottom: 8}}>Enter the code we send to</div>
                    <div className={styles.title}>{email}</div>
                    <a className='a_link' href='/login' style={{marginTop: 4, fontSize: 14}}>
                        Use a different account
                    </a>
                    <div style={{marginTop: 32}}>
                        <InputPassword
                            type='text'
                            loading={loading}
                            timer={timer}
                            isError={isError}
                            onSend={initData}
                            onVerify={handleVerify}
                            setIsError={setIsError}
                        />
                    </div>
                </div>
            </div>
            <Right />
        </div>
      </div>
  );
}
