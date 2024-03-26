import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { history, useLocation } from 'umi';
import {useState} from "react";
import Right from './componments/right';
import {checkLoginPassword, sendVerifyCode} from '@/services/login';
import {getQueryParam} from "@/utils/help";
import LogoutModal from "@/pages/login/componments/logout-modal";

export default function LoginPassword() {
    const location = useLocation();
    const email = getQueryParam('email');
    const [errorText, setErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        if(errorText) return;
        if(!password){
            setErrorText('Please enter a password')
            return
        }
        await checkLoginPassword({
            email,
            address: '',
            login_password: password,
        })
        history.push('/home');
    }

    const handleChangePassWord = (e:any) => {
        setErrorText('');
        setPassword(e.target.value);
    }

    const handleBlurPassWord = (e:any) => {
        if(e.target.value === ""){
            setErrorText('Please enter a password')
        } else {
            setErrorText('');
        }
    }

    const handleBack = () =>{
        if(location.pathname === '/lock-password'){
            setOpen(true);
        } else {
            history.replace('/login')
        }
    }

    // lock-password
  return (
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <div className={styles.desc} style={{fontSize: 20, marginBottom: 8}}>Enter your password</div>
                    <div className={styles.title}>{email}</div>
                    <a className='a_link' onClick={handleBack} style={{marginTop: 4, fontSize: 14}}>
                        Use a different account
                    </a>
                    <div style={{marginTop: 32}}>
                        <FormControl isInvalid={errorText !==''}>
                            <InputPro
                                type="password"
                                placeholder='Password'
                                style={{height: 56}}
                                onChange={handleChangePassWord}
                                onBlur={handleBlurPassWord}
                            />
                            <FormErrorMessage>{errorText}</FormErrorMessage>
                        </FormControl>
                    </div>

                    <div style={{fontSize: 14, marginTop: 20}}>
                        <a target="_blank" href="/privacy" className="a_link">Forget it?</a>
                    </div>
                    <ButtonPro mt="20px" onClick={handleSubmit}>Continue</ButtonPro>
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={() => setOpen(false)} />
      </div>
  );
}
