import styles from "./index.less";
import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
} from '@chakra-ui/react';
import TransferPassword from "@/components/TransferPassword";
import {getDefaultPwd, setNewPassword} from '@/services/transfer';
import Toast from "@/hooks/Toast";
import {passWordReg, getMail} from "@/utils/help";
import {checkPassword, getUserInfo, getPrivateKey} from "@/services/login";
import {connect} from "@@/exports";
import {generateRandomBytes} from "@/utils/utils";
import { Axiom } from 'axiomwallet'
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
    const [loading, setLoading] = useState(false);
    const {showSuccessToast, showErrorToast} = Toast();

    useEffect(() => {
        setOpen(props.isOpen)
    },[props.isOpen])

    const onClose = () => {
        props.onClose(false, "")
    }

    const handleSubmit = async (password: string) => {
        if(!loading)
            setLoading(true);
        const salt = generateRandomBytes(16);
        const transferSalt = generateRandomBytes(16);
        try {
            console.log(password)
            const pwd = await getDefaultPwd({email});
            const de = await  Axiom.Utility.deriveAES256GCMSecretKey(sha256(pwd), userInfo.transfer_salt);
             const decryptKey =  Axiom.Utility.decrypt(userInfo.enc_private_key, de.toString("utf-8"));
            const secretKey = await  Axiom.Utility.deriveAES256GCMSecretKey(sha256(password), transferSalt);
            const encryptedPrivateKey =  Axiom.Utility.encrypt(decryptKey, secretKey.toString());
            // salt 字段去掉
            await setNewPassword(email,userInfo.enc_private_key,encryptedPrivateKey, userInfo.address, salt, transferSalt);
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
            props.onClose(true, password);
        }catch (error) {
            setLoading(false);
            console.log(error)
        }
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
