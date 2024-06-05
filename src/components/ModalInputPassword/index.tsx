import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';
import InputPro from "../Input";
import {history} from "umi";
import useContinueButton from '@/hooks/ContinueButton';


const ModalInputPassword = (props: any) => {
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {Button}  = useContinueButton();

    useEffect(() => {
        setError(props.isError)
    }, [props.isError])

    useEffect(() => {
        setLoading(props.isLoading)
    }, [props.isLoading])

    const handleChangePassWord = (e:any) => {
        setError('');
        setPassword(e.target.value);
    }

    const handleBlurPassWord = (e:any) => {
        if(e.target.value === ""){
            setError('Please enter a password')
        } else {
            setError('');
        }
    }

    const handleToReset = () => {
        history.push('/reset-transfer')
    }

    const handleSubmit = () => {
        props.onSubmit(password)
    }
    

    return (
        <div className={styles.PinInput}>
            <FormControl isInvalid={error !== ""}>
                <InputPro
                    type="password"
                    placeholder='Please enter transfer password'
                    style={{height: 56, width: "100%"}}
                    onChange={handleChangePassWord}
                    onBlur={handleBlurPassWord}
                />
                <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
            <p className={styles.transferForget} onClick={handleToReset}>Forget it?</p>
            <div style={{marginTop: "20px"}}><Button loading={loading} onClick={handleSubmit}>Confirm</Button></div>
        </div>
    )

}


export default ModalInputPassword;
