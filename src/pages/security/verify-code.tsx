import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import {history} from 'umi';
import {getMail} from '@/utils/help';
import {useEffect, useState} from "react";
import {resendVerifyCode, checkResendVerifyCode} from '@/services/login';
import Page from '@/components/Page'
import Toast from "@/hooks/Toast";

let loadTimer:any = null;
export default function SecurityVerifyCode() {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);
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

    const handleVerify = async (code: string) => {
        try{
            setLoading(true);
            await checkResendVerifyCode({email, verify_code: code})
            history.replace(`/security/update-reset-password`)
        } catch (e) {
            setIsError(true)
        } finally {
            setLoading(false)
        }
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
