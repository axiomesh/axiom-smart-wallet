import styles from './index.less';
import ButtonPro from '@/components/Button'
import { history } from 'umi';

export default function ForgetPassword() {
    const handleSubmit = async () => {
        history.push('/home');
    }

    // lock-password
  return (
      <div>
          <div>
              <div className='page-title'>Reset Unlock Password</div>
              <div className={styles.desc}>Please complete the email verification code first .</div>
              <ButtonPro mt="20px" w="320px" onClick={handleSubmit}>Send a verify email</ButtonPro>
          </div>
      </div>
  );
}
