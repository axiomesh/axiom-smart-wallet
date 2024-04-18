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
import { AxiomAccount, generateSigner, deriveAES256GCMSecretKey, encrypt, decrypt } from "axiom-smart-account-test";
import { sha256 } from "js-sha256";
import {connect} from "@@/exports";
import Toast from "@/hooks/Toast";
import {passwordTimes, transferLockTime, wrongPassword} from "@/services/transfer";
import {getMail} from "@/utils/help";
import {generateRandomBytes} from "@/utils/utils";
import {ethers} from "ethers";

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
    const [oldLimit, setOldLimit] = useState<string>("");

    const { Button } = ContinueButton();

    useEffect(() => {
        if(sessionStorage.getItem("sk")) {
            setSessionKey(sessionStorage.getItem("sk"))
            setIsSwitch(true)
        }
        if(sessionStorage.getItem("freeLimit")) {
            setFreeLimit(sessionStorage.getItem("freeLimit"))
            setOldLimit(sessionStorage.getItem("freeLimit"))
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
            sessionStorage.removeItem("sk");
            sessionStorage.removeItem("a");
            sessionStorage.removeItem("b");
            sessionStorage.removeItem("op");
            sessionStorage.removeItem("freeLimit");
        }
    }

    const generateRandomSixDigits = () => {
        const min = 100000; // 最小值为 100000
        const max = 999999; // 最大值为 999999
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const handleSubmit = async (e: any) => {
        let axiom:any;
        try {
            axiom = await AxiomAccount.fromEncryptedKey(sha256(e), info.transfer_salt, info.enc_private_key);
            setFreeLimit(value)
        }catch (e) {
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                await wrongPassword({email});
                const times = await passwordTimes({email})
                if(times > 0) {
                    if(times < 4) {
                        setMsg(`Invalid password ，only ${times} attempts are allowed today!`)
                    }else {
                        setMsg(`Invalid password`)
                    }
                }else {
                    setMsg("Invalid password ，your account is currently locked. Please try again tomorrow !")
                }
            }
            return;
        }
        const skPassword = generateRandomSixDigits().toString();
        const salt = generateRandomBytes(16);
        const limit = ethers.utils.parseUnits(value, 18);
        let currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999)
        const validAfter = Math.round(Date.now() / 1000);
        const validUntil = currentDate.getTime();
        const sessionSigner = generateSigner();
        const sessionResult = await axiom.setSession(
            sessionSigner,
            limit,
            validAfter,
            validUntil,
            "",
            ""
        );
        console.log(skPassword, 'skPassword')
        console.log(sha256(skPassword), salt, 'sha256(skPassword), salt')
        sessionStorage.setItem("ow", axiom.getOwnerAddress())
        sessionStorage.setItem("a", sha256(skPassword));
        sessionStorage.setItem("b", salt);
        sessionStorage.setItem("op", JSON.stringify(sessionResult));
        const secretKey = await deriveAES256GCMSecretKey(sha256(skPassword), salt);
        console.log(secretKey, sessionSigner.privateKey,'secretKey, sessionSigner.privateKey')
        const encryptKey = encrypt(secretKey.toString(), sessionSigner.privateKey);
        console.log(encryptKey,'encryptKey')
        const decryptKey = decrypt(encryptKey, secretKey.toString());
        console.log(decryptKey,'decryptKey')
        sessionStorage.setItem("sk", encryptKey);
        sessionStorage.setItem("freeLimit", value);
        showSuccessToast("Password-free transfer has been activated");
        setIsOpen(false)
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
                <p className={styles.freeTip}>once activated，you can enjoy the quick experience of transferring small amounts without the need for password verification on AXIOMESH .Other blockchains are coming soon!</p>
                <div className={styles.freeSwitch}>
                    <span>Password-free transfer switch </span>
                    <div><Switch id='email-alerts' size='lg' colorScheme='yellow' isChecked={isSwitch} onChange={handleChange} /></div>
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
                                        setValue("5000");
                                        setErrorMessage("");
                                    }}>MAX
                                    </div>
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage style={{marginLeft: "16px"}}>{errorMessage}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div className={styles.freeSettingBottom}>
                        <Button disabled={oldLimit && (oldLimit === freeLimit)} onClick={handleConfirm}>{(sessionKey || freeLimit) ? "Update" : "Confirm"}</Button>
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
