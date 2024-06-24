import styles from "./index.less"
import InputPro from "../Input";
import React, { useEffect, useState } from "react";
import {
    FormControl,
    FormErrorMessage,
    Progress
} from "@chakra-ui/react";
import Toast from "@/hooks/Toast";
import {getMail, passWordReg, setToken} from '@/utils/help';
import useContinueButton from '@/hooks/ContinueButton';

interface Props {
    onSubmit: (password: string) => void;
    btnLoading: boolean;
    type: string;
}


const TransferPassword = (props: Props) => {
    const [errorText, setErrorText] = useState('');
    const [newErrorText, setNewErrorText] = useState('');
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [progress, setProgress] = useState(25);
    const [progressText, setProgressText] = useState('');
    const [loading, setLoading] = useState(false);
    const {showErrorToast} = Toast();
    const {Button}  = useContinueButton();

    useEffect(() => {
        setLoading(props.btnLoading);
    }, [props.btnLoading])

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

    const handleSubmit = () => {
        if(loading)
            return;
        if(!passWordReg.test(password)){
            setNewErrorText('Invalid password')
            return;
        }
        if(!password){
            setNewErrorText('Please enter a new password')
            return;
        }
        if(!passWordReg.test(rePassword)){
            setErrorText('Invalid password');
            return;
        }
        if(!rePassword){
            setErrorText('Please enter a repeat password')
            return;
        }
        if(!password || !rePassword || errorText || newErrorText) return
        props.onSubmit(password)
    }


    return (
        <div>
            <div style={{marginTop: 20}}>
                <FormControl isInvalid={newErrorText !==''}>
                    <InputPro
                        type="password"
                        placeholder='New password'
                        style={{height: 56}}
                        onChange={handleChangePassWord}
                        onBlur={handleBlurPassWord}
                        tabIndex="-1"
                    />

                    {password && !passWordReg.test(password) ? <>
                        <Progress value={progress} className='login-progress' size='xs' />
                        <div className={styles.progressText}>{progressText}</div>
                    </> : null}
                    <FormErrorMessage>{newErrorText}</FormErrorMessage>
                </FormControl>
            </div>
            <div style={{marginTop: 20}}>
                <FormControl isInvalid={errorText !==''}>
                    <InputPro
                        type="password"
                        placeholder='Repeat password'
                        style={{height: 56}}
                        onChange={handleChangeRePassWord}
                        onBlur={handleBlurRePassWord}
                        tabIndex="-1"
                    />
                    <FormErrorMessage>{errorText}</FormErrorMessage>
                </FormControl>
            </div>
            <div style={{marginTop: "40px", width: props.type === 'set' ? '100%' : '320px'}}><Button loading={loading} onClick={handleSubmit}>Confirm</Button></div>
        </div>
    )
}

export default TransferPassword;
