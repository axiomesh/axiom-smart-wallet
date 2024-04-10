import styles from "./index.less";
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    FormControl,
    FormLabel,
    FormErrorMessage,
} from '@chakra-ui/react';
import Input from '@/components/Input';
import useContinueButton from '@/hooks/ContinueButton';
import TransferPassword from "@/components/TransferPassword";
import { setFirstPassword } from '@/services/transfer';
import Toast from "@/hooks/Toast";
import {passWordReg, setToken, getMail} from "@/utils/help";
import {checkLoginPassword} from "@/services/login";
import {connect} from "@@/exports";
const {crypto} = require("crypto-js")
import {generateRandomBytes} from "@/utils/utils";

interface Props {
    isOpen: boolean;
    onClose: (isSuccess: Boolean | null) => void;
}

const SetPayPasswordModal = (props: Props) => {
    const email: string | any = getMail();
    const { userInfo } = props;
    const [open, setOpen] = useState<Boolean>(props.isOpen);
    const [isVerify, setIsVerify] = useState(false);
    const [errorTxt, setErrorTxt] = useState('');
    const [password, setPassword] = useState('');
    const {Button}  = useContinueButton();
    const {showSuccessToast} = Toast();

    useEffect(() => {
        setOpen(props.isOpen)
    },[props.isOpen])

    const onClose = () => {
        props.onClose(false)
    }

    const handleSubmit = async (e: string) => {
        const salt = generateRandomBytes(16).join("");
        await setFirstPassword(email, userInfo.enc_private_key, e, salt);
        showSuccessToast("Password set successfully!");
        props.onClose(true);
    }

    const handleVerify = async () => {
        if(errorTxt) return;
        if(!passWordReg.test(password)){
            setErrorTxt('Invalid password')
        }
        if(!password){
            setErrorTxt('Please enter a password')
        }
        if(!password || !passWordReg.test(password)) return
        try{
            const res = await checkLoginPassword({
                email,
                login_password: password,
            })
            setToken(res);
            setIsVerify(true)
        }catch (e){
            console.log(e);
            // @ts-ignore
            showErrorToast(e)
        }
    }

    const handleBlurPassWord = (e:any) => {
        if(e.target.value === ""){
            setErrorTxt('Please enter a password')
        } else {
            setErrorTxt('');
        }
    }

    const handleChangePassWord = (e:any) => {
        setErrorTxt('');
        setPassword(e.target.value);
    }

    return (
        <>
            <Modal isOpen={open} onClose={onClose} closeOnOverlayClick={false}>
                <ModalOverlay />
                <ModalContent rounded="32px" maxWidth="500px">
                    <ModalHeader padding="40px 40px 0 40px" display="flex" alignItems="center" justifyContent="space-between">
                        <div className={styles.payPassTitle}><span>Set Transfer Password</span><span className={styles.payPassInstructions}>Set your quick transfer password for transfer operations.</span></div>
                        <i className={styles.payPassClose} onClick={onClose}></i>
                    </ModalHeader>
                    <ModalBody padding="20px 40px 0 40px">
                        {!isVerify && <div>
                            <span className={styles.payPassTip}>Please enter your unlock password to complete the verification</span>
                            <FormControl isInvalid={errorTxt !==''} style={{marginBottom: "40px"}}>
                                <Input
                                    type='password'
                                    value={password}
                                    placeholder='Unlock password'
                                    style={{height: "56px", marginTop: "8px"}}
                                    _placeholder={{
                                        fontSize: "14px",
                                        fontFamily: "Inter",
                                        fontWeight: "400",
                                        color: "#A0AEC0"
                                    }}
                                    onBlur={handleBlurPassWord}
                                    onChange={handleChangePassWord}
                                />
                                <FormErrorMessage>{errorTxt}</FormErrorMessage>
                            </FormControl>
                            <Button onClick={handleVerify}>Verify</Button>
                        </div>}
                        {isVerify && <TransferPassword onSubmit={handleSubmit} />}
                    </ModalBody>
                    <ModalFooter>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(SetPayPasswordModal)
