import styles from './index.less';
import { history, useLocation } from 'umi';
import {getMail, passWordReg, setToken} from '@/utils/help';
import Right from "./componments/right";
import {useEffect, useState} from "react";
import { resetPassword, registerUser } from '@/services/login';
import InputPro from "@/components/Input";
import {FormControl, FormErrorMessage, Progress} from "@chakra-ui/react";
import ButtonPro from "@/components/Button";
import Toast from "@/hooks/Toast";
// @ts-ignore
import { AxiomAccount, generateSigner } from 'axiom-smart-account-test'
import { sha256 } from 'js-sha256'
import {generateRandomBytes} from "@/utils/utils";


interface ParamsItem {
    email: string | any;
    address?: string;
    login_password: string;
    enc_private_key: string;
    owner_address?: string;
    salt?: string | number;
    user_salt: string;
}
// 设置登陆密码需要调用sdk
// 老用户的重置密码， 新用户设置密码共用这个页面
export default function SetPassword() {
    const email: string | any = getMail();
    const location = useLocation();
    const [errorText, setErrorText] = useState('');
    const [newErrorText, setNewErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [progress, setProgress] = useState(25);
    const [progressText, setProgressText] = useState('');
    const [loading, setLoading] = useState(false)
    const {showErrorToast} = Toast();


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

        if(!password || !rePassword || errorText || newErrorText) return
        try{
            setLoading(true)
            if(password === rePassword && passWordReg.test(password)){
                const encryptPassword = sha256(rePassword);
                const salt = generateRandomBytes(16);
                // const salt = generateRandomBytes(16).join("");
                // @ts-ignore
                let axiomAccount = await AxiomAccount.fromPassword(encryptPassword, salt, window.accountSalt);
                window.axiom = axiomAccount;
                const private_key = axiomAccount.getEncryptedPrivateKey().toString();
                const address = axiomAccount.getAddress()
                // const secretKey = await deriveAES256GCMSecretKey(password, window.sault);
                // const encryptPassword = encrypt(secretKey)

                const params:ParamsItem = {
                    email,
                    login_password: encryptPassword,
                    enc_private_key: private_key, //登录密码对私钥进行对称加密-加密后的密钥
                    user_salt: salt
                }

                if(location.pathname === '/set-password'){
                    params.address = address; //从sdk中获取
                    const res = await registerUser(params);
                    setToken(res);
                    history.replace('/home');
                } else {
                    const signer = generateSigner();
                    console.log(signer)
                    // @ts-ignore
                    params.salt = window.accountSalt;
                    params.owner_address = signer.address; //从sdk中获取
                    // @ts-ignore
                    await resetPassword(params)
                    history.replace('/lock');
                }


            }
        } catch (e) {
            // @ts-ignore
            showErrorToast(e)
        } finally {
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     initData()
    // }, []);

    useEffect(() => {
      if(!email) history.replace('/login')
    }, [])
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
            setErrorText('Passwords do not match')
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
                setErrorText('Passwords do not match')
            } else {
                setErrorText('');
            }
        }else {
            setNewErrorText('');
        }
    }


    const handleKeyDown = (e:any) => {
        if(e.key === 'Enter'){
            handleBlurPassWord(e);
            handleSubmit();
        }
    }

    const handleRePassWordKeyDown = (e:any) => {
        if(e.key === 'Enter'){
            handleBlurRePassWord(e);
            handleSubmit();
        }
    }
    return (
        <div className={styles.loginPage}>
            <div className={styles.loginContainer}>
                <div className={styles.loginLeft}>
                    <div className={styles.loginLeftContainer}>
                        <div className={styles.title}>{location.pathname === '/set-password' ? 'Set a password' : 'Reset your password'}</div>
                        <div className={styles.desc} style={{marginTop: 20, fontSize: 16}}>This will protect and unlock your account </div>
                        <div className={styles.desc} style={{fontSize: 16}}>{email}</div>
                        <div style={{marginTop: 32}}>
                            <FormControl isInvalid={newErrorText !==''}>
                                <InputPro
                                    type="password"
                                    placeholder='New password'
                                    style={{height: 56}}
                                    onChange={handleChangePassWord}
                                    onBlur={handleBlurPassWord}
                                    onKeyDown={handleKeyDown}
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
                                    onKeyDown={handleRePassWordKeyDown}
                                />
                                <FormErrorMessage>{errorText}</FormErrorMessage>
                            </FormControl>
                        </div>
                        <div>
                            <ButtonPro mt="24px" isLoading={loading} onClick={handleSubmit}>Continue</ButtonPro>
                        </div>
                    </div>
                </div>
                <Right />
            </div>
        </div>
    );
}
