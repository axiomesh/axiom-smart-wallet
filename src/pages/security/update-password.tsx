import styles from './index.less';
import { history, useLocation } from 'umi';
import { getQueryParam } from '@/utils/help';
import {useState} from "react";
import { addOrUpdatePassword } from '@/services/login';
import InputPro from "@/components/Input";
import {FormControl, FormErrorMessage, Progress} from "@chakra-ui/react";
import ButtonPro from "@/components/Button";
import Prompt from "@/components/Prompt";
import Page from '@/components/Page'

let loadTimer:any = null;
export default function SetPassword() {
    const email = getQueryParam('email');
    const location = useLocation();
    const [errorText, setErrorText] = useState('');
    const [newErrorText, setNewErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [progress, setProgress] = useState(25);
    const [progressText, setProgressText] = useState('');
    const reg = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;


    const handleSubmit = async () => {
        if(!password){
            setNewErrorText('Please enter a new password')
            return
        }
        if(!reg.test(password)){
            setNewErrorText('Invalid password')
            return
        }
        if(!rePassword){
            setErrorText('Please enter a repeat password')
            return
        }
        if(!reg.test(rePassword)){
            setErrorText('Invalid password')
            return
        }
        if(password === rePassword && reg.test(password)){
            await addOrUpdatePassword({
                email,
                address: '',
                login_password: password,
                enc_private_key: '', //登录密码对私钥进行对称加密-加密后的密钥
            })

            history.replace('/lock');
        }
    }
    const handleChangePassWord = (e: any) => {
        setPassword(e.target.value);
        const newValue = e.target.value;
        const numRegex = /\d/;
        const stringRegex = /[a-zA-Z]/;
        const regex = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
        setNewErrorText('');
        if(e.target.value.length >= 8){

            if(regex.test(newValue)){
                setProgress(100);
                setProgressText('')
            } else if(!stringRegex.test(newValue)){
                setProgress(50);
                setProgressText('Add a letter to improve!')
            } else if(!numRegex.test(newValue)){
                setProgress(50);
                setProgressText('Add a number to improve!')
            } else {
                setProgress(50);
                setProgressText('Add a letter to improve!')
            }

        } else {
            if(regex.test(newValue)){
                setProgress(75);
            }else if(!stringRegex.test(newValue) && !numRegex.test(newValue)){
                setProgress(25);
            }else if(!stringRegex.test(newValue)){
                setProgress(50);
            } else if(!numRegex.test(newValue)){
                setProgress(50);
            } else {
                setProgress(25);
            }

            setProgressText('Password is too short !')
        }

    }

    const handleChangeRePassWord = () => {
        setErrorText("");
    }

    const handleBlurRePassWord = (e: any) => {
        if(e.target.value === ""){
            setErrorText('Please enter a repeat password')
        }else if(e.target.value !== password){
            setErrorText('Password do not match')
        } else {
            setErrorText('');
        }
        setRePassword(e.target.value);
    }

    const handleBlurPassWord = (e:any) => {
        if(e.target.value === ""){
            setNewErrorText('Please enter a new password')
        } else {
            setNewErrorText('');
        }
    }



    return (
        <>
            <Prompt message='Are you sure to cancel password reset?' />
            <Page needBack>
                <div>
                    <div className='page-title'>Reset Unlock Password</div>
                    <div className={styles.desc} style={{marginTop: 20, fontSize: 16}}>Please update your unlock password</div>
                    <div style={{marginTop: 32}}>
                        <FormControl isInvalid={newErrorText !==''}>
                            <InputPro
                                type="password"
                                placeholder='New password'
                                style={{height: 56}}
                                onChange={handleChangePassWord}
                                onBlur={handleBlurPassWord}
                            />

                            {password && !reg.test(password) ? <>
                                <Progress value={progress} className='login-progress' size='xs' />
                                <div className={styles.progressText}>{progressText}</div>
                            </> : null}
                            <FormErrorMessage>{newErrorText}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div style={{marginTop: 32}}>
                        <FormControl isInvalid={errorText !==''}>
                            <InputPro
                                type="password"
                                placeholder='Repeat password'
                                style={{height: 56}}
                                onChange={handleChangeRePassWord}
                                onBlur={handleBlurRePassWord}
                            />
                            <FormErrorMessage>{errorText}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div>
                        <ButtonPro mt="24px" w="320px" onClick={handleSubmit}>Continue</ButtonPro>
                    </div>
                </div>
            </Page>
        </>
    );
}
