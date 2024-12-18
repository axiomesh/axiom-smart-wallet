import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import {history, useLocation} from 'umi';
import {getMail, getQueryParam} from '@/utils/help';
import Right from "./componments/right";
import {useEffect, useState} from "react";
import {sendVerifyCode, checkVerifyCode, resendVerifyCode, checkResendVerifyCode, checkUser} from '@/services/login';
import Toast from "@/hooks/Toast";

let loadTimer:any = null;

// //为重置支付密码 reset-verify-code验证码页面 。老用户，新用户登陆的验证码页面
export default function VerifyCode() {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);
    const [endTime, setEndTime] = useState(0);
    const loaction = useLocation();
    const {showErrorToast} = Toast();

    const runTimer = (cm:number = 120) => {
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
        try{
            let lastTime = 0;
            if(loaction.pathname === '/reset-verify-code'){
                lastTime = await resendVerifyCode(email)
            } else {
                lastTime = await sendVerifyCode(email)
            }
            // @ts-ignore
            sessionStorage.setItem('EndTime', (new Date()).getTime() + lastTime)
            runTimer(Number((lastTime / 1000).toFixed(0)))
        } catch (e){
            // @ts-ignore
            showErrorToast(e)
        }
    }

    useEffect(() => {
        initData();

        return () => {
            if(loadTimer){
                clearTimeout(loadTimer)
            }
        }
    }, []);

    const handleVisibilityChange = () => {
        if (document.hidden) {
            if(loadTimer){
                clearTimeout(loadTimer)
            }
        } else {
            const endTime  = sessionStorage.getItem('EndTime')
            const newDate = Number(((Number(endTime) - (new Date()).getTime())/ 1000).toFixed(0))
            if(newDate <= 0 ){
                runTimer(0)
            } else {
                runTimer(newDate);
            }
        }
    }


    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    }, []);

    const handleVerify = async (code: string) => {
        try{
            setLoading(true)
            if(loaction.pathname === '/reset-verify-code'){
                await checkResendVerifyCode({email, verify_code: code})
                history.replace(`/reset-password`)
            } else {
                const data = await checkVerifyCode({email, verify_code: code})
                const userType = await checkUser(email);
                //0未注册，1已注册
                if(userType === 0) {
                    localStorage.setItem('verify_code', code)
                    history.replace(`/register-passkey`)
                } else {
                    history.replace(`/login-passkey`)
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
