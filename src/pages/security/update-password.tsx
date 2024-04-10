import styles from './index.less';
import { history } from 'umi';
import {getMail, passWordReg} from '@/utils/help';
import {useState} from "react";
import {resetPassword, updatePassword} from '@/services/login';
import InputPro from "@/components/Input";
import {FormControl, FormErrorMessage, Progress} from "@chakra-ui/react";
import ButtonPro from "@/components/Button";
import Prompt from "@/components/Prompt";
import Page from '@/components/Page'
import {connect, useLocation} from "@@/exports";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
// @ts-ignore
import { AxiomAccount } from 'axiom-smart-account-test'

// /security/update-password更新密码
// /security/update-reset-password 重置密码

interface ParamsItem {
    email: string | any;
    old_login_password?: string | any,
    old_enc_private_key?: string,
    login_password: string;
    enc_private_key: string;
    owner_address?: string;
    salt?: string | number;
}
function SecurityUpdatePassword(props: any) {
    const { userInfo } = props;
    const location = useLocation();
    const {showErrorToast} = Toast();
    const email: string | any = getMail();
    const [errorText, setErrorText] = useState('');
    const [newErrorText, setNewErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [progress, setProgress] = useState(25);
    const [progressText, setProgressText] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('Are you sure to cancel password reset?')


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
            try{
                setLoading(true)
                const encryptPassword = sha256(password);
                // @ts-ignore
                let axiomAccount = await AxiomAccount.fromPassword(encryptPassword, window.salt, window.accountSalt);
                const private_key = axiomAccount.getEncryptedPrivateKey().toString();
                const params: ParamsItem = {
                    email,
                    login_password: encryptPassword,
                    enc_private_key: private_key, //登录密码对私钥进行对称加密-加密后的密钥
                }
                if(location.pathname === '/security/update-reset-password'){
                    params.owner_address = userInfo.address;
                    // @ts-ignore
                    params.salt = window.salt;
                    await resetPassword(params)
                    setMessage('');
                    setTimeout(() => {
                        history.replace('/lock');
                    }, 10)
                } else {
                    const oldPassword = sessionStorage.getItem('Old_Password');
                    if(!oldPassword){
                        showErrorToast("Please enter a password");
                        setMessage('');

                        setTimeout(() => {
                            history.replace('/security/reset-unlock-password');
                        }, 10)
                        return;
                    }
                    params.old_login_password = oldPassword;
                    params.old_enc_private_key = userInfo.enc_private_key;
                    await updatePassword(params);
                    setMessage('');
                    setTimeout(() => {
                        history.replace('/lock');
                    }, 10)
                }
            } catch (e){
                // @ts-ignore
                showErrorToast(e);
            } finally {
                setLoading(false)
            }
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

        if(rePassword){
            setErrorText("");
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
        } else if(rePassword !== ''){
            if(e.target.value !== rePassword){
                setErrorText('Password do not match')
            } else {
                setErrorText('');
            }
        }else {
            setNewErrorText('');
        }
    }



    return (
        <>
            <Prompt message={message} />
            <Page needBack>
                <div>
                    <div className='page-title'>Reset Unlock Password</div>
                    <div className={styles.desc} style={{marginTop: 20, fontSize: 16}}>Please update your unlock password</div>
                    <div style={{marginTop: 32, width: 420}}>
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
                    <div style={{marginTop: 32, width: 420}}>
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
                        <ButtonPro mt="24px" w="320px" isLoading={loading} onClick={handleSubmit}>Continue</ButtonPro>
                    </div>
                </div>
            </Page>
        </>
    );
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(SecurityUpdatePassword)
