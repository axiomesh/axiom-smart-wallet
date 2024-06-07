import styles from "./index.less"
import React, { useState, useEffect } from "react";
import {
    Switch,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    FormControl,
    FormErrorMessage,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    PopoverArrow,
} from '@chakra-ui/react'
import { switchTheme } from "./theme"
import { extendTheme } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
import ContinueButton from "@/hooks/ContinueButton";
import VerifyTransferModal from "@/components/VerifyTransferModal";
import { history } from 'umi';
import { AxiomAccount, generateSigner, deriveAES256GCMSecretKey, encrypt, decrypt, isoBase64URL } from "axiom-smart-account-test";
import { sha256 } from "js-sha256";
import {connect} from "@@/exports";
import Toast from "@/hooks/Toast";
import {passwordTimes, transferLockTime, wrongPassword} from "@/services/transfer";
import {getMail} from "@/utils/help";
import {generateRandomBytes} from "@/utils/utils";
import {ethers, Wallet} from "ethers";
import useCancelModal from "@/hooks/CancelModal";
import Page from '@/components/Page'
import { startAuthentication } from "@simplewebauthn/browser";
import BioResultModal from "@/components/BioResultModal";

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
    const [value, setValue] = useState<string | null>("");
    const [msg, setMsg] = useState<string>("");
    const [sessionKey, setSessionKey] = useState<string | null>("");
    const [freeLimit, setFreeLimit] = useState<string | null>("");
    const {showSuccessToast, showErrorToast} = Toast();
    const [info, setInfo] = useState<any>({});
    const [isLock, setIsLock] = useState(false);
    const [oldLimit, setOldLimit] = useState<string | null>("");
    const [btnLoading, setBtnLoading] = useState(false);
    const [freeStep, setFreeStep] = useState<string | null>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [isLimitDisabled, setIsLimitDisabled] = useState<boolean>(false);
    const [pinLoading, setPinLoading] = useState<boolean>(false);
    const [isOpenBio, setIsOpenBio] = useState<boolean>(false);
    const [bioResultOpen, setBioResultOpen] = useState<boolean>(false);
    const [bioStatus, setBioStatus] = useState<string>("");

    const { Button } = ContinueButton();
    const [ModalComponent, openModal, closeModal] = useCancelModal();

    useEffect(() => {
        if(sessionStorage.getItem("sr")) {
            setFreeStep(sessionStorage.getItem("sr"))
        }
        if(sessionStorage.getItem("sk")) {
            setSessionKey(sessionStorage.getItem("sk"))
            setIsSwitch(true)
        }
        if(sessionStorage.getItem("freeLimit")) {
            setFreeLimit(sessionStorage.getItem("freeLimit"))
            setOldLimit(sessionStorage.getItem("freeLimit"))
            setIsSwitch(true)
            setValue(sessionStorage.getItem("freeLimit"))
            setIsLimitDisabled(true)
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
        if(userInfo?.bio_payment_status === 1) {
            setIsOpenBio(true)
        }else {
            setIsOpenBio(false)
        }
    }, [userInfo])

    useEffect(() => {
        if(freeStep === "0") {
            setIsLimitDisabled(true)
            setIsDisabled(true);
        }else {
            setIsDisabled(false);
        }
    }, [freeStep])

    useEffect(() => {
        if(oldLimit) {
            oldLimit === value ? setIsDisabled(true) : setIsDisabled(false)
        }
    }, [value])

    const handleChange = (e: any) => {
        setIsSwitch(e.target.checked)
        if(!e.target.checked) {
            setErrorMessage("");
            setSessionKey("");
            setFreeLimit("");
            setFreeStep("");
            setValue("");
            setOldLimit("");
            setIsDisabled(false);
            setIsLimitDisabled(false);
            sessionStorage.removeItem("sk");
            sessionStorage.removeItem("a");
            sessionStorage.removeItem("b");
            sessionStorage.removeItem("op");
            sessionStorage.removeItem("freeLimit");
            sessionStorage.removeItem("sr");
            sessionStorage.removeItem("validAfter");
            sessionStorage.removeItem("validUntil");
            sessionStorage.removeItem("ow");
        }
    }

    const generateRandomSixDigits = () => {
        const min = 100000; // 最小值为 100000
        const max = 999999; // 最大值为 999999
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const handleSaveFree = async (axiom: any) => {
        const skPassword = generateRandomSixDigits().toString();
        const salt = generateRandomBytes(16);
        const limit = ethers.utils.parseUnits(value, 18);
        let currentDate = new Date();
        // prod 0
        currentDate.setHours(23, 59, 59, 999)
        const validAfter = Math.round(Date.now() / 1000);
        const validUntil = currentDate.getTime();
        // test 5min
        // let currentTimestamp: number = currentDate.getTime();
        // const validUntil: number = currentTimestamp + (5 * 60 * 1000);

        const sessionSigner = generateSigner();
        setFreeStep("0")
        const secretKey = await deriveAES256GCMSecretKey(sha256(skPassword), salt);
        const encryptKey = encrypt(sessionSigner.privateKey, secretKey.toString());
        console.log(sessionSigner.address, 'sessionSigner.address')

        sessionStorage.setItem("ow", axiom.getAddress())
        sessionStorage.setItem("a", sha256(skPassword));
        sessionStorage.setItem("b", salt);
        sessionStorage.setItem("sr", "0");
        sessionStorage.setItem("sk", encryptKey);
        sessionStorage.setItem("freeLimit", value ? value : "");
        sessionStorage.setItem("validAfter", validAfter.toString());
        sessionStorage.setItem("validUntil", validUntil.toString());
        showSuccessToast("Password-free transfer has been activated");
        setIsOpen(false);
        setBtnLoading(false);
        setPinLoading(false);
        if(sessionKey || freeLimit) {
            setIsUpdate(true);
        }
    }

    const handleSubmit = async (password: any) => {
        setPinLoading(true);
        setMsg("");
        let axiom:any;
        try {
            axiom = await AxiomAccount.fromEncryptedKey(sha256(password), info.transfer_salt, info.enc_private_key, info.address);
            setFreeLimit(value)
        }catch (e: any) {
            setBtnLoading(false);
            setPinLoading(false);
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                wrongPassword({email}).then(async () => {
                    const times = await passwordTimes({email})
                    if(times > 0) {
                        if(times < 4) {
                            setMsg(`Invalid password , only ${times} attempts are allowed today!`)
                        }else {
                            setMsg(`Invalid password`)
                        }
                    }else {
                        setMsg("Invalid password , your account is currently locked. Please try again tomorrow !")
                    }
                }).catch((err: any) => {
                    setMsg(err)
                })
            }
            return;
        }
        handleSaveFree(axiom);
    }

    const handleBioPay = async() => {
        setBioResultOpen(true);
        setBioStatus("loading");
        const allowCredentials = localStorage.getItem("allowCredentials");
        const randomChallange = new Uint8Array(32);
        const obj: any = {
            challenge: isoBase64URL.fromBuffer(randomChallange),
            rpId: "localhost",
            allowCredentials: [{
                "id": allowCredentials,
                "type": "public-key"
            }]
        }
        try {
            await startAuthentication(obj);
            setBioStatus("success");
        }catch(error: any) {
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setBioStatus("cancel");
            }else {
                setBioStatus("failed");
            }
            return;
        }
        const axiom = await AxiomAccount.fromPasskey(userInfo.address);
        await handleSaveFree(axiom);
    }

    const handleConfirm = async () => {
        if (!value) {
            setErrorMessage('please enter daily transfer limit');
            return
        } else if (Number(value) > maxNumber || Number(value) < 100) {
            setErrorMessage("Invalid Input");
            return
        }
        if(isDisabled) {
            return;
        }
        if(errorMessage !== "") {
            return;
        }
        const times = await transferLockTime({email});
        if(times > 0) {
            showErrorToast("Your account is currently frozen. Please try again tomorrow ！");
            return;
        }
        if(freeStep === "0") {
            return ;
        }
        if(!btnLoading) {
            setBtnLoading(true);
            openModal('Attention', handlePassword)
            setBtnLoading(false);
        }
    }

    const handlePassword = () => {
        setIsOpen(true);
        setMsg("");
        closeModal();
    };

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
            <Page needBack backFn={() => history.push('/security')}>
                <div>
                    <h1 className='page-title'>Password-free transfer</h1>
                <p className={styles.freeTip}>Once activated, you can enjoy the quick experience of transferring small amounts without the need for password verification. <i></i> Support for other blockchains is coming soon！</p>
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
                                                style={{border: errorMessage !== '' ? "1px solid #E53E3E" : ""}}>
                                    <span className={styles.freeSettingCenterBefore}>HK$</span>
                                </InputLeftAddon>
                                <Input
                                    type='number'
                                    value={value?value:""}
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
                                    _disabled={{
                                        color: "#A0AEC0",
                                        backgroundColor: "#EDF2F7"
                                    }}
                                    onBlur={handleBlur}
                                    onChange={(e: any) => {
                                        setValue(e.target.value)
                                    }}
                                    disabled={isLimitDisabled}
                                />
                                {
                                    !isLimitDisabled && <InputRightElement style={{top: "8px", right: "20px"}}>
                                        <div className={styles.freeSettingCenterMax} onClick={() => {
                                            setValue("5000");
                                            setErrorMessage("");
                                        }}>MAX
                                        </div>
                                    </InputRightElement>
                                }
                                {
                                    (isLimitDisabled && freeStep === "") && <InputRightElement style={{top: "8px", right: "16px"}}>
                                        <div className={styles.freeSettingCenterEdit} onClick={() => {
                                            setIsLimitDisabled(false);
                                        }}></div>
                                    </InputRightElement>
                                }
                            </InputGroup>
                            <FormErrorMessage style={{marginLeft: "16px"}}>{errorMessage}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div className={styles.freeSettingBottom}>
                        {freeStep !== "0" && <Button disabled={isDisabled} loading={btnLoading} onClick={handleConfirm}>{freeStep === "0" ? "Pending activation" : (sessionKey || freeLimit) ? "Update" : "Confirm"}</Button>}
                        {freeStep === "0" && <div style={{position: "relative"}}><Popover trigger="hover" placement="top">
                            <PopoverTrigger>
                                <div><Button disabled={isDisabled} loading={btnLoading} onClick={handleConfirm}>{freeStep === "0" ? "Pending activation" : (sessionKey || freeLimit) ? "Update" : "Confirm"}</Button></div>
                            </PopoverTrigger>
                            <PopoverContent style={{background: "#171923",color:"#fff",fontSize: "14px",boxShadow:"none"}}>
                                <PopoverArrow bg="#171923" />
                                <PopoverBody style={{padding: "2px 8px 2px 8px",textAlign:"center"}}>{isUpdate?"Password-free payment update will be activated after this transfer transaction.":"Password-free payment will be activated after your next successful transfer transaction."}</PopoverBody>
                            </PopoverContent>
                        </Popover></div>}
                    </div>
                </div>}
                <VerifyTransferModal bioPay={handleBioPay} tip="Password-free payment will be activated after your next successful transfer transaction." isOpenBio={isOpenBio} pinLoading={pinLoading} onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false);setBtnLoading(false);handleLockTimes()}} errorMsg={msg} />
                <ModalComponent buttonText="I understand, proceed to confirm">Password-free payment will be activated after your next successful transfer transaction.</ModalComponent>
                <BioResultModal status={bioStatus} isOpen={bioResultOpen} onClose={() => {setBioResultOpen(false)}} />
            </div>
            </Page>
        </ChakraProvider>
    )
}
export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(TransferFree)
