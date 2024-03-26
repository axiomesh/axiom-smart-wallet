import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { history, useLocation } from 'umi';
import {useState} from "react";
import {checkLoginPassword, sendVerifyCode} from '@/services/login';
import {getQueryParam} from "@/utils/help";
import LogoutModal from "@/pages/login/componments/logout-modal";

export default function ResetUnlockPassword() {
    const email = getQueryParam('email');
    const [errorText, setErrorText] = useState('');
    const [password, setPassword] = useState('');

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

    // lock-password
  return (
      <div>
          <div>
              <div className='page-title'>Reset Unlock Password</div>
              <div className={styles.desc}>Please enter the old password for verification</div>
              <div style={{marginTop: 20}}>
                  <FormControl isInvalid={errorText !==''}>
                      <InputPro
                          type="password"
                          placeholder='Password'
                          style={{height: 56, width: 420}}
                          onChange={handleChangePassWord}
                          onBlur={handleBlurPassWord}
                      />
                      <FormErrorMessage>{errorText}</FormErrorMessage>
                  </FormControl>
              </div>

              <div style={{fontSize: 14, marginTop: 20}}>
                  <a target="_blank" href="/privacy" className="a_link">Forget it?</a>
              </div>
              <ButtonPro mt="20px" w="320px" onClick={handleSubmit}>Verify</ButtonPro>
          </div>
      </div>
  );
}
