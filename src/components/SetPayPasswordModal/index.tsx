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
import {passWordReg, getMail} from "@/utils/help";
import {checkPassword, getUserInfo, getPrivateKey} from "@/services/login";
import {connect} from "@@/exports";
const {crypto} = require("crypto-js")
import {generateRandomBytes} from "@/utils/utils";
import {AxiomAccount, deriveAES256GCMSecretKey, decrypt, encrypt} from "axiom-smart-account-test"
import {sha256} from "js-sha256";

interface Props {
    isOpen: boolean;
    onClose: (isSuccess: Boolean | null) => void;
    userInfo: any;
    dispatch: any;
}

const SetPayPasswordModal = (props: Props) => {
    const email: string | any = getMail();
    const { userInfo, dispatch } = props;
    const [open, setOpen] = useState<Boolean>(props.isOpen);
    const [isVerify, setIsVerify] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorTxt, setErrorTxt] = useState('');
    const [password, setPassword] = useState('');
    const {Button}  = useContinueButton();
    const {showSuccessToast, showErrorToast} = Toast();

    useEffect(() => {
        setErrorTxt('');
        setOpen(props.isOpen)
    },[props.isOpen])

    const onClose = () => {
        props.onClose(false)
    }

    const handleSubmit = async (e: string) => {
        if(!loading) 
            setLoading(true);
        const salt = generateRandomBytes(16);
        try {
            const tokenInfo = await getPrivateKey(email);
            const token = sha256(tokenInfo.verify_code);
            const secretKey = await deriveAES256GCMSecretKey(token, tokenInfo.user_salt);
            const decryptKey = decrypt(userInfo.enc_private_key, secretKey.toString());
            const paySecretKey = await deriveAES256GCMSecretKey(sha256(e), salt);
            const encryptKey = encrypt(decryptKey, paySecretKey.toString());
            await setFirstPassword(email, userInfo.enc_private_key, encryptKey, salt);
            const deviceId = localStorage.getItem('visitorId');
            const userRes = await getUserInfo(email, deviceId);
            if(userRes){
                dispatch({
                    type: 'global/setUser',
                    payload: userRes,
                })
            }
            setLoading(false);
            showSuccessToast("Password set successfully!");
            props.onClose(true);
        }catch (error) {
            setLoading(false);
            console.log(error)
        }
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
            const data = await checkPassword({
                email,
                login_password: sha256(password),
            })
            if(data){
                setIsVerify(true)
            } else {
                setErrorTxt('Invalid password')
            }
        }catch (e){
            console.log(e);
            // @ts-ignore
            showErrorToast(e)
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
                        <div><TransferPassword type="set" btnLoading={loading} onSubmit={handleSubmit} /></div>
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
