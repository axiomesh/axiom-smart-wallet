import InputPassword from '@/components/InputPassword'
import styles from './index.less';
// import { history, useLocation } from 'umi';
import { getQueryParam } from '@/utils/help';
import Right from "./componments/right";
import {useState} from "react";

export default function HomePage() {
    const email = getQueryParam('email');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSend = () => {

    }

    const handleVerify = (code: string) => {

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
                            onSend={handleSend}
                            onVerify={handleVerify}
                        />
                    </div>
                </div>
            </div>
            <Right />
        </div>
      </div>
  );
}
