import styles from './index.less';
import ButtonPro from '@/components/Button'
import { history } from 'umi';
import Page from '@/components/Page'
import {resendVerifyCode} from "@/services/login";
import {getMail} from "@/utils/help";
import {useState} from "react";

export default function ForgetPassword() {
    const email: string | any = getMail();
    const [loading, setLoading] = useState(false);
    const handleSubmit = async () => {
        try{
            setLoading(true)
            await resendVerifyCode(email);
            history.push('/security/verify');
        } finally {
            setLoading(false)
        }

    }

    // lock-password
  return (
      <Page needBack>
          <div>
              <div className='page-title'>Reset Unlock Password</div>
              <div className={styles.desc}>Please complete the email verification code first .</div>
              <ButtonPro isLoading={loading} mt="20px" w="320px"  onClick={handleSubmit}>Send a verify email</ButtonPro>
          </div>
      </Page>
  );
}
