import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { history, useLocation } from 'umi';
import {useEffect, useState} from "react";
import Right from './componments/right';
import {checkLoginPassword, sendVerifyCode} from '@/services/login';
import {getMail, passWordReg, setToken} from "@/utils/help";
import LogoutModal from "@/pages/login/componments/logout-modal";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import {getUserInfo} from "@/services/login";
import {AxiomAccount} from "axiom-smart-account-test";

export default function LoginPassword() {
    const location = useLocation();
    const email: string | any = getMail();
    const [errorText, setErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const {showErrorToast} = Toast();


    const handleSubmit = async () => {
        if(errorText) return;
        if(!passWordReg.test(password)){
            setErrorText('Invalid password')
        }
        if(!password){
            setErrorText('Please enter a password')
        }
        if(!password || !passWordReg.test(password)) return
        try{
            setLoading(true)
            const login_password = sha256(password);
            const res = await checkLoginPassword({
                email,
                login_password,
                // login_password: password,
            })
            setToken(res);
            history.replace('/home');
        } catch (e){
            // @ts-ignore
            showErrorToast(e)
        } finally {
            setLoading(false)
        }
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

    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

    const handleForget = () => {
        history.push('/reset-verify-code')
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
                                autoFocus
                            />
                            <FormErrorMessage>{errorText}</FormErrorMessage>
                        </FormControl>
                    </div>

                    <div style={{fontSize: 14, marginTop: 20}}>
                        <a onClick={handleForget} className="a_link">Forget it?</a>
                    </div>
                    <ButtonPro mt="20px" isLoading={loading} onClick={handleSubmit}>Continue</ButtonPro>
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={() => setOpen(false)} />
      </div>
  );
}
