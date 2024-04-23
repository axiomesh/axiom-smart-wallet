import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import {history} from 'umi';
import {getMail} from '@/utils/help';
import {useEffect, useState} from "react";
import {resendVerifyCode, checkResendVerifyCode} from '@/services/login';
import Page from '@/components/Page'
import Toast from "@/hooks/Toast";
import Prompt from "@/components/Prompt";

let loadTimer:any = null;
export default function SecurityVerifyCode() {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);
    const [message, setMessage] = useState('Are you sure to cancel password reset?');
    const {showErrorToast} = Toast();

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
        try {
            const lastTime = await resendVerifyCode(email);
            sessionStorage.setItem('EndTime', (new Date()).getTime() + lastTime)
            runTimer(Number((lastTime / 1000).toFixed(0)))
        }catch (e){
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
            setLoading(true);
            await checkResendVerifyCode({email, verify_code: code})
            setMessage('');
            setTimeout(() => {
                history.replace(`/security/update-reset-password`)
            }, 10)
        } catch (e) {
            setIsError(true)
        } finally {
            setLoading(false)
        }
    }

  return (
      <>
          <Prompt message={message} />
          <Page needBack backFn={() => history.push('/security')}>
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
      </>
  );
}
