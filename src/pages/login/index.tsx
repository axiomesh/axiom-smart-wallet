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
import { history, connect, Navigate } from 'umi';
import React, {useEffect, useState} from "react";
import Right from './componments/right';
import {sendVerifyCode, checkUser, isNewDevice} from '@/services/login';
import {setMail} from "@/utils/help";
import Toast from "@/hooks/Toast";
import { getToken } from "@/utils/help";
import {detectBrowser, getSafariVersion, getChromeVersion, removeTransferFee, getIsActiveBrowser} from "@/utils/utils";
import DeviceSupport from "@/components/DeviceSupport";
import {getDeviceVersion} from "@/utils/system";

function Login(props: any) {
    const { dispatch } = props;
    const toast = useToast();
    const [errorText, setErrorText] = useState('');
    const [isCheck, setIsCheck] = useState(false);
    const [mail, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const {showErrorToast} = Toast();

    const validateName = (value: string) => {
        const reg =  /^(.+)@(.+)$/;
        if (!value) {
            setErrorText('Please enter your email address');
            return false
        } else if (!reg.test(value)) {
            setErrorText("Invalid email address");
            return false
        }
        setErrorText("");
        return true
    }

    // useEffect(() => {
    //     clearSessionData(dispatch);
    // }, []);

    useEffect(() => {
        removeTransferFee();
        dispatch({
            type: 'global/setForm',
            payload: {},
        })
        dispatch({
            type: 'global/setUser',
            payload: {},
        })
    }, [])


    React.useEffect(() => {
        // @ts-ignore
        if(!getIsActiveBrowser()){
            setIsOpen(true);
        }
        let unblock =  history.block((tx:any, action:any) => {
            if (tx.action === 'POP') {
                return false;
            } else {
                unblock();
                tx.retry()
            }
        });
    }, [])

    // const getDeviceId = () => {
    //     const fpPromise = import('@/utils/v3')
    //         .then(FingerprintJS => FingerprintJS.load())
    //     fpPromise.then(fp => fp.get()).then(async (result) => {
    //         const visitorId = result.visitorId;
    //         setDeviceId(visitorId);
    //         localStorage.setItem('visitorId', visitorId);
    //     })
    // }
    //
    //
    // useEffect(() => {
    //     getDeviceId();
    // }, [])

    const handleSubmit = async () => {
        if(!validateName(mail)) return

        if(!isCheck){
            toast({
                position: 'top',
                title: 'Please agree to the user agreement',
                status: 'error',
                containerStyle:{bg: 'red.400', borderRadius: 20},
                duration: 1500,
            })
            return
        }
        setLoading(true)
        setMail(mail);
        try {
            const userType = await checkUser(mail);
            if(userType === 0) {
                try{
                    setLoading(true)
                    await sendVerifyCode(mail)
                    history.push(`/verify-code`);
                } catch (e){
                    console.log(e);
                    // @ts-ignore
                    showErrorToast(e);
                } finally {
                    setLoading(false)
                }
            }else {
                const res = await isNewDevice({
                    email: mail,
                    device_name: navigator.platform,
                    device_version: getDeviceVersion(),
                    // device_id: deviceId,
                })
                if(res){
                    history.replace(`/register-passkey`)
                } else {
                    setLoading(false)
                    history.push(`/login-passkey`);
                }
            }

        } catch (e){
            showErrorToast(e);
        } finally {
            setLoading(false)
        }

    }


    const handleBlur = (e: any) => {
        const { value } = e.target;
        validateName(value);
    }

    const handleKeyDown = (e:any) => {
        if(e.key === 'Enter'){
            handleBlur(e);
            handleSubmit();
        }
    }

    const handleChangeMail = (e:any) => {
        const { value } = e.target;
        setEmail(value);
        setErrorText('');
    }

    if(getToken()){
        return <Navigate to="/lock" />
    }
  return (
      <div className={styles.loginPage}>
          <div className={styles.loginContainer}>
              <div className={styles.loginLeft}>
                  <div className={styles.loginLeftContainer}>
                      <img src={logo} alt="logo"/>
                      <div className={styles.title}>Axiomesh Smart Account</div>
                      <div className={styles.desc} style={{marginTop: 8, marginBottom: 32}}>
                          Get started with your email address
                      </div>
                      <div>
                          {/*<InputPro placeholder='Enter your email address' style={{height: 56}} />*/}
                          <FormControl isInvalid={errorText !==''}>
                              <InputPro
                                  placeholder='Enter your email address'
                                  style={{height: 56}}
                                  onChange={handleChangeMail}
                                  onKeyDown={handleKeyDown}
                                  onBlur={handleBlur}
                                  autoComplete='off'
                              />
                              <FormErrorMessage>{errorText}</FormErrorMessage>
                          </FormControl>
                          <FormControl mt="40px">
                              <Checkbox
                                  colorScheme='red'
                                  borderRadius="50%"
                                  onChange={(e) => {setIsCheck(e.target.checked)}}
                              >
                                <span style={{fontSize: 14}}>
                                    I agree with <a
                                    target="_blank"
                                    href="/privacy"
                                    className="a_link"
                                    style={{fontStyle: 'italic'}}
                                >Axiomesh Smart Account User Agreement</a>
                                </span>
                              </Checkbox>
                          </FormControl>
                          <ButtonPro mt="24px" isLoading={loading} onClick={handleSubmit}>Continue</ButtonPro>
                      </div>
                  </div>
              </div>
              <Right />
              <DeviceSupport isOpen={isOpen} />
          </div>
      </div>
  );
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Login)
