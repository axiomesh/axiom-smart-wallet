import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import {history, useLocation} from 'umi';
import {getMail, getQueryParam} from '@/utils/help';
import Right from "./componments/right";
import {useEffect, useState} from "react";
import {sendVerifyCode, checkVerifyCode, resendVerifyCode, checkResendVerifyCode} from '@/services/login';

let loadTimer:any = null;

// //为重置支付密码 reset-verify-code验证码页面 。老用户，新用户登陆的验证码页面
export default function VerifyCode() {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);
    const loaction = useLocation();

    const runTimer = (cm = 120) => {
        if(cm > 0) {
            if(cm >= 10){
                setTimer(`${cm}s` )
            } else {
                setTimer(`0${cm}s` )
            }
            loadTimer = setTimeout(() => {
                cm -=1;
                runTimer(cm)
            }, 1000)
        } else {
            setTimer('');
        }
    }

    useEffect(() => {
        if(!email) history.replace('/login')
    }, [email])

    const initData = async () => {
        // resendVerifyCode
        let lastTime = 0;
        if(loaction.pathname === '/reset-verify-code'){
            lastTime = await resendVerifyCode(email)
        } else {
            lastTime = await sendVerifyCode(email)
        }
        runTimer((lastTime / 1000).toFixed(0))
    }

    useEffect(() => {
        initData();
        // runTimer()

        return () => {
            if(loadTimer){
                clearTimeout(loadTimer)
            }
        }
    }, []);

    const handleVerify = async (code: string) => {
        try{
            setLoading(true)
            if(loaction.pathname === '/reset-verify-code'){
                await checkResendVerifyCode(email)
                history.replace(`/reset-password`)
            } else {
                const data = await checkVerifyCode({email, verify_code: code})
                //0未注册，1已注册
                if(data === 0) {
                     history.replace(`/set-password`)
                } else {
                    history.replace(`/login-password`)
                }
            }
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
                            needTimer={true}
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
