import styles from "./index.less"
import React, { useState, useEffect } from "react";
import Back from "@/components/Back";
import {
    Switch,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react'
import { switchTheme } from "./theme"
import { extendTheme } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
import ContinueButton from "@/hooks/ContinueButton";
import VerifyTransferModal from "@/components/VerifyTransferModal";
import { history } from 'umi';
import { AxiomAccount, generateSigner } from "axiom-smart-account-test";
import { sha256 } from "js-sha256";
import {connect} from "@@/exports";
import Toast from "@/hooks/Toast";

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const TransferFree = (props: any) => {
    const { userInfo } = props;
    const [isSwitch, setIsSwitch] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [maxNumber, setMaxNumber] = useState(5000);
    const [value, setValue] = useState<string>("");
    const [sessionKey, setSessionKey] = useState<string>("");
    const {showSuccessToast} = Toast();

    const { Button } = ContinueButton();

    useEffect(() => {
        if(sessionStorage.getItem("sessionKey")) {
            setSessionKey(sessionStorage.getItem("sessionKey"))
            setIsSwitch(true)
        }
    },[])

    const handleChange = (e: any) => {
        setIsSwitch(e.target.checked)
    }

    const handleSubmit = async (e: any) => {
        const validAfter = Math.round(Date.now() / 1000);
        const validUntil = Math.round(Date.now() / 1000) + 60 * 60 * 24;
        const sessionSigner = generateSigner();
        try {
            const axiom = await AxiomAccount.fromEncryptedKey(sha256(e), userInfo.transfer_salt, userInfo.enc_private_key);
            await axiom.setSession(
                sessionSigner,
                value,
                validAfter,
                validUntil,
                {
                    onBuild: (op) => {
                        op.preVerificationGas = 60000;
                        console.log("Signed UserOperation:", op);
                    },
                }
            );
            sessionStorage.setItem("key", sha256(e))
            sessionStorage.setItem("sessionKey", sessionSigner.privateKey)
            showSuccessToast("Password-free transfer has been activated");
            setIsOpen(false)
        }catch (err) {
            console.log(err)
        }
    }

    const handleConfirm = () => {
        setIsOpen(true)
    }

    const validate = (value: string) => {
        if (!value) {
            setErrorMessage('please enter daily transfer limit');
            return
        } else if (Number(value) > maxNumber || Number(value) < 100) {
            setErrorMessage("Invalid Input");
            return
        }
        setErrorMessage("");
    }

    const handleBlur = (e: any) => {
        const { value } = e.target;
        validate(value);
    }

    return (
        <ChakraProvider theme={theme}>
            <div className={styles.free}>
                <Back onClick={() => {history.push('/security')}} />
                <h1 className={styles.freeTitle}>Password-free transfer</h1>
                <p className={styles.freeTip}>once activated，you can enjoy the quick experience of transferring small amounts without the need for password verification .</p>
                <div className={styles.freeSwitch}>
                    <span>Password-free transfer switch </span>
                    <Switch id='email-alerts' size='lg' colorScheme='yellow' isChecked={isSwitch} onChange={handleChange} />
                </div>
                {isSwitch && <div className={styles.freeSetting}>
                    <div className={styles.freeSettingTop}>
                        <span className={styles.freeSettingTopTitle}>Settings</span>
                        <span className={styles.freeSettingTopTip}>Set your password-free transfer limit and validity period</span>
                    </div>
                    <div className={styles.freeSettingCenter}>
                        <span className={styles.freeSettingCenterTitle}>Daily transfer limit</span>
                        <FormControl isInvalid={errorMessage !==''}>
                            <InputGroup width="420px">
                                <InputLeftAddon height="56px" padding="0 8px" borderRadius="12px 0 0 12px" style={{border: errorMessage !=='' && "1px solid #E53E3E"}}>
                                    <span className={styles.freeSettingCenterBefore}>HK$</span>
                                </InputLeftAddon>
                                <Input
                                    type='number'
                                    value={value}
                                    placeholder='100-5000'
                                    fontSize="14px"
                                    fontWeight="400"
                                    color="gray.700"
                                    height="56px"
                                    borderRadius="12px"
                                    _placeholder={{
                                        color: "#A0AEC0"
                                    }}
                                    _invalid={{
                                        border: "1px solid #E53E3E"
                                    }}
                                    onBlur={handleBlur}
                                    onChange={(e: any) => {setValue(e.target.value)}}
                                />
                                <InputRightElement style={{top: "8px", right: "20px"}}>
                                    <div className={styles.freeSettingCenterMax} onClick={() => {setValue("5000")}}>MAX</div>
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage style={{marginLeft: "16px"}}>{errorMessage}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div className={styles.freeSettingBottom}>
                        <Button onClick={handleConfirm}>{sessionKey ? "Update" : "Confirm"}</Button>
                    </div>
                </div>}
                <VerifyTransferModal onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false)}} />
            </div>
        </ChakraProvider>
    )
}
export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(TransferFree)
