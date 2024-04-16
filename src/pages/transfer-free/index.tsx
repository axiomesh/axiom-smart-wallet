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
import {passwordTimes, transferLockTime, wrongPassword} from "@/services/transfer";
import {getMail} from "@/utils/help";

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const TransferFree = (props: any) => {
    const email: string | any = getMail();
    const { userInfo } = props;
    const [isSwitch, setIsSwitch] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [maxNumber, setMaxNumber] = useState(5000);
    const [value, setValue] = useState<string>("");
    const [msg, setMsg] = useState<string>("");
    const [sessionKey, setSessionKey] = useState<string>("");
    const [freeLimit, setFreeLimit] = useState<string>("");
    const {showSuccessToast, showErrorToast} = Toast();
    const [info, setInfo] = useState<any>({});
    const [isLock, setIsLock] = useState(false);

    const { Button } = ContinueButton();

    useEffect(() => {
        if(sessionStorage.getItem("sessionKey")) {
            setSessionKey(sessionStorage.getItem("sessionKey"))
            setIsSwitch(true)
        }
        if(sessionStorage.getItem("freeLimit")) {
            setFreeLimit(sessionStorage.getItem("freeLimit"))
            setIsSwitch(true)
            setValue(sessionStorage.getItem("freeLimit"))
        }
        handleLockTimes()
    },[])

    const handleLockTimes = async () => {
        const times = await transferLockTime({email});
        if(times > 0) {
            setIsLock(true)
        }
    };

    useEffect(() => {
        setInfo(userInfo)
    }, [userInfo])

    const handleChange = (e: any) => {
        setIsSwitch(e.target.checked)
        if(!e.target.checked) {
            setSessionKey("");
            setFreeLimit("");
            setValue("");
            sessionStorage.setItem("sessionKey", "");
            sessionStorage.setItem("freeLimit", "");
        }
    }

    const handleSubmit = async (e: any) => {
        try {
            await AxiomAccount.fromEncryptedKey(sha256(e), info.transfer_salt, info.enc_private_key);
            sessionStorage.setItem("key", sha256(e));
            sessionStorage.setItem("freeLimit", value);
            setFreeLimit(value)
            showSuccessToast("Password-free transfer has been activated");
            setIsOpen(false)
        }catch (e) {
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                await wrongPassword({email});
                const times = await passwordTimes({email})
                if(times > 0) {
                    setMsg(`Invalid password ，only ${times} attempts are allowed today!`)
                }else {
                    setMsg("Invalid password ，your account is currently locked. Please try again tomorrow !")
                }
            }
            return;
        }
    }

    const handleConfirm = () => {
        if(isLock) {
            showErrorToast("Your account is currently frozen. Please try again tomorrow ！");
            return;
        }
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
                        <FormControl isInvalid={errorMessage !== ''}>
                            <InputGroup width="420px">
                                <InputLeftAddon height="56px" padding="0 8px" borderRadius="12px 0 0 12px"
                                                style={{border: errorMessage !== '' && "1px solid #E53E3E"}}>
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
                                    onChange={(e: any) => {
                                        setValue(e.target.value)
                                    }}
                                />
                                <InputRightElement style={{top: "8px", right: "20px"}}>
                                    <div className={styles.freeSettingCenterMax} onClick={() => {
                                        setValue("5000")
                                    }}>MAX
                                    </div>
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage style={{marginLeft: "16px"}}>{errorMessage}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div className={styles.freeSettingBottom}>
                        <Button onClick={handleConfirm}>{(sessionKey || freeLimit) ? "Update" : "Confirm"}</Button>
                    </div>
                </div>}
                <VerifyTransferModal onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false)}} errorMsg={msg} />
            </div>
        </ChakraProvider>
    )
}
export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(TransferFree)
