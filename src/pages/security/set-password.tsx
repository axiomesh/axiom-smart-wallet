import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { history } from 'umi';
import {useState} from "react";
import {checkLoginPassword, sendVerifyCode} from '@/services/login';
import {getMail, passWordReg} from "@/utils/help";
import Page from '@/components/Page';
import Toast from "@/hooks/Toast";

export default function ResetUnlockPassword() {
    const email: string | any = getMail();
    const [errorText, setErrorText] = useState('');
    const [password, setPassword] = useState('');
    const {showErrorToast} = Toast();

    const handleSubmit = async () => {
        if(errorText) return;
        if(!passWordReg.test(password)){
            setErrorText('Invalid password')
        }

        if(!password){
            setErrorText('Please enter a password');
        }

        if(!password || !passWordReg.test(password)) return
        try{
            await checkLoginPassword({
                email,
                login_password: password,
            })
            sessionStorage.setItem('Old_Password', password)
            history.push('/security/update-password');
        } catch (e){
            // @ts-ignore
            showErrorToast(e);
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

    const handleForget = () => {
        history.push('/security/forget-password')
    }

    // lock-password
  return (
      <Page needBack>
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
                  <a onClick={handleForget} className="a_link">Forget it?</a>
              </div>
              <ButtonPro mt="20px" w="320px" onClick={handleSubmit}>Verify</ButtonPro>
          </div>
      </Page>
  );
}
