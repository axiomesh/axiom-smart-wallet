import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import {history, useLocation} from 'umi';
import { getQueryParam } from '@/utils/help';
import {useEffect, useState} from "react";
import {sendVerifyCode, resendVerifyCode, checkResendVerifyCode} from '@/services/login';
import Page from '@/components/Page'

let loadTimer:any = null;
export default function VerifyCode() {
    const email = getQueryParam('email');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);
    const loaction = useLocation();

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
        // resendVerifyCode
        let lastTime = 0;
        if(loaction.pathname === '/reset-verify-code'){
            lastTime = await resendVerifyCode({email, address: ''})
        } else {
            lastTime = await sendVerifyCode(email)
        }
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
            if(loaction.pathname === '/reset-verify-code'){
                await checkResendVerifyCode({email, verify_code: code, address: ''})
                history.push(`/reset-password?email=${email}`)
            } else {
                // const data =await checkVerifyCode({email, verify_code: code})
                ////0未注册，1已注册
                // if(data === 0) {
                //     history.push(`/set-password?email=${email}`)
                // } else {
                //     history.push(`/login-password?email=${email}`)
                // }
            }


            history.push(`/set-password?email=${email}`)
        } catch (e) {
            setIsError(true)
        } finally {
            setLoading(false)
        }
    }

    const handleResend = () => {
        if(timer) return
        initData();
    }

  return (
      <Page needBack>
          <div>
              <div className='page-title'>Reset Unlock Password</div>
              <div className={styles.desc}>Please complete the email verification code first .</div>
              <div style={{marginTop: 20}}>
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
      </Page>
  );
}
