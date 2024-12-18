import styles from './index.less';
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import { history } from 'umi';
import {useState} from "react";
import {checkPassword} from '@/services/login';
import {getMail, passWordReg} from "@/utils/help";
import Page from '@/components/Page';
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";

export default function ResetUnlockPassword() {
    const email: string | any = getMail();
    const [errorText, setErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
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
            setLoading(true)
            const data = await checkPassword({
                email,
                login_password: sha256(password),
            })
            if(data){
                sessionStorage.setItem('Old_Password', sha256(password))
                history.push('/security/update-password');
            } else {
                setErrorText('Invalid password')
            }
        } catch (e){
            // @ts-ignore
            showErrorToast(e);
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

    const handleForget = () => {
        history.push('/security/forget-password')
    }

    const handleKeyDown = (e:any) => {
        if(e.key === 'Enter'){
            handleBlurPassWord(e);
            handleSubmit();
        }
    }

    // lock-password
  return (
      <Page needBack backFn={() => history.push('/security')}>
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
                          onKeyDown={handleKeyDown}
                      />
                      <FormErrorMessage>{errorText}</FormErrorMessage>
                  </FormControl>
              </div>

              <div style={{fontSize: 14, marginTop: 20}}>
                  <a onClick={handleForget} className="a_link">Forget it?</a>
              </div>
              <ButtonPro isLoading={loading} mt="20px" w="320px" onClick={handleSubmit}>Verify</ButtonPro>
          </div>
      </Page>
  );
}
