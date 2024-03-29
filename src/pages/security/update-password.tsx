import styles from './index.less';
import { history } from 'umi';
import {getQueryParam, passWordReg} from '@/utils/help';
import {useState} from "react";
import {resetPassword, updatePassword} from '@/services/login';
import InputPro from "@/components/Input";
import {FormControl, FormErrorMessage, Progress} from "@chakra-ui/react";
import ButtonPro from "@/components/Button";
import Prompt from "@/components/Prompt";
import Page from '@/components/Page'
import {connect, useLocation} from "@@/exports";
import Toast from "@/hooks/Toast";

// /security/update-password更新密码
// /security/update-reset-password 重置密码

interface ParamsItem {
    email: string | any;
    old_login_password?: string | any,
    old_enc_private_key?: string,
    login_password: string;
    enc_private_key: string;
    owner_address?: string;
}
function SecurityUpdatePassword(props: any) {
    const { userInfo } = props;
    const location = useLocation();
    const {showErrorToast} = Toast();
    const email = getQueryParam('email');
    const [errorText, setErrorText] = useState('');
    const [newErrorText, setNewErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [progress, setProgress] = useState(25);
    const [progressText, setProgressText] = useState('');


    const handleSubmit = async () => {
        if(!passWordReg.test(password)){
            setNewErrorText('Invalid password')
        }
        if(!password){
            setNewErrorText('Please enter a new password')
        }
        if(!passWordReg.test(rePassword)){
            setErrorText('Invalid password')
        }
        if(!rePassword){
            setErrorText('Please enter a repeat password')
        }
        if(!password || !passWordReg.test(password) || !rePassword || !passWordReg.test(rePassword)) return;
        if(password === rePassword && passWordReg.test(password)){
            const params: ParamsItem = {
                email,
                login_password: password,
                enc_private_key: '', //登录密码对私钥进行对称加密-加密后的密钥
            }
            if(location.pathname === '/security/update-reset-password'){
                params.owner_address = ''
                await resetPassword({
                    email,
                    login_password: password,
                    enc_private_key: '', //登录密码对私钥进行对称加密-加密后的密钥
                })
            } else {
                const oldPassword = sessionStorage.getItem('Old_Password');
                if(!oldPassword){
                    showErrorToast("Please enter a password");
                    history.replace('/security/reset-unlock-password');
                    return;
                }
                params.old_login_password = oldPassword;
                params.old_enc_private_key = userInfo.enc_private_key;
                await updatePassword(params);
            }

            // owner_address

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

                            {password && !passWordReg.test(password) ? <>
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

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(SecurityUpdatePassword)
