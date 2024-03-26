import styles from './index.less';
import logo from '@/assets/axiom.svg'
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
    Checkbox,
    useToast
} from '@chakra-ui/react';
import { history } from 'umi';
import {useState} from "react";
import Right from './componments/right';
import {checkLoginPassword, sendVerifyCode} from '@/services/login';
import InputPassword from "@/components/InputPassword";
import {getQueryParam} from "@/utils/help";
import LogoutModal from './componments/logout-modal';

export default function LoginPassword() {
    const email = getQueryParam('email');
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        history.push('/home');
    }

    const handleClose = () => {
        setOpen(false)
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
                    <ButtonPro mt="20px" onClick={handleSubmit}>Continue</ButtonPro>
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={handleClose} />
      </div>
  );
}
