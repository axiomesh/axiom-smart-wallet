import styles from "./index.less"
import React, { useState, useEffect } from "react";
import {
    Switch,
    Flex
    // Input,
    // InputGroup,
    // InputLeftAddon,
    // InputRightElement,
    // FormControl,
    // FormErrorMessage,
    // Popover,
    // PopoverTrigger,
    // PopoverContent,
    // PopoverBody,
    // PopoverArrow,
} from '@chakra-ui/react'
import { switchTheme } from "./theme"
import { extendTheme } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
// import ContinueButton from "@/hooks/ContinueButton";
import VerifyTransferModal from "@/components/VerifyTransferModal";
import { DatePicker, Form, Input, Tooltip } from 'antd';
import {DateIcon, EditIcon, TimerIcon} from '@/components/Icons';
import AntdButton from '@/components/Button/antd-button';
import { history } from 'umi';
import { Axiom } from 'axiomwallet';
import { sha256 } from "js-sha256";
import {connect} from "@@/exports";
import Toast from "@/hooks/Toast";
import {passwordTimes, transferLockTime, wrongPassword} from "@/services/transfer";
import {getMail} from "@/utils/help";
import {detectBrowser, generateRandomBytes, getSafariVersion, removeTransferFee} from "@/utils/utils";
import useCancelModal from "@/hooks/CancelModal";
import Page from '@/components/Page'
import { startAuthentication } from "@simplewebauthn/browser";
import BioResultModal from "@/components/BioResultModal";
import dayjs from "dayjs";
import {checkBioPasskeyCreate} from "@/services/login";
const dayFormat = 'YYYY-MM-DD';

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const TransferFree = (props: any) => {
    const email: string | any = getMail();
    const { userInfo, dispatch, freeForm } = props;
    const [isSwitch, setIsSwitch] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [msg, setMsg] = useState<string>("");
    // const [sessionKey, setSessionKey] = useState<string | null>("");
    const [freeLimit, setFreeLimit] = useState<string | null>("");
    const {showSuccessToast, showErrorToast} = Toast();
    const [info, setInfo] = useState<any>({});
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [isLimitDisabled, setIsLimitDisabled] = useState<boolean>(false);
    const [pinLoading, setPinLoading] = useState<boolean>(false);
    const [isOpenBio, setIsOpenBio] = useState<boolean>(false);
    const [bioResultOpen, setBioResultOpen] = useState<boolean>(false);
    const [bioStatus, setBioStatus] = useState<string>("");
    const [dateEdit, setDateEdit] = useState(false);
    const [form] = Form.useForm();

    const isFreeTransfer = () => {
        const status = sessionStorage.getItem("freeStatus")
        const timer = sessionStorage.getItem("limit_timer")
        if((status === '1' || status === '2') && timer && Number(timer) >= Math.round(new Date().getTime()/ 1000)) {
            return true
        }
        return false
    }

    // 免密 2--
    // 生物
    // 密码 1---

    // const { Button } = ContinueButton();
    const [ModalComponent, openModal, closeModal] = useCancelModal();

    useEffect(() => {
        if(isFreeTransfer()) {
            // setSessionKey(sessionStorage.getItem("sk"))
            setIsSwitch(true)
        }

        // const limit = sessionStorage.getItem("freeLimit");
        const freeLimit = sessionStorage.getItem("freeLimit")
        const timer = sessionStorage.getItem("limit_timer");
        if(freeLimit) {
            setFreeLimit(freeLimit)
            // setOldLimit(limit)
            // limit_timer

            form.setFields([{ name: 'max', errors: [], value: freeLimit }])
            if(timer){
                form.setFields([
                    { name: 'timer', errors: [], value: dayjs(dayjs(Number(timer)).format(dayFormat), dayFormat) }
                ]);
                if(new Date().getTime() >= Number(timer)){
                    setIsSwitch(false)
                } else {
                    setIsSwitch(true)
                }

                setDateEdit(true);
            }
            setIsLimitDisabled(true);
            setIsDisabled(true)
        }
        if(freeForm.timer){
            form.setFields([
                { name: 'timer', errors: [], value: dayjs(dayjs(Number(freeForm.timer)).format(dayFormat), dayFormat) }
            ]);
            if(timer && freeForm.timer.toString() === timer){
                setDateEdit(true);
            } else {
                setDateEdit(false);
            }
        }

        if(freeForm.max){
            form.setFields([{ name: 'max', errors: [], value: freeForm.max}]);
            if(freeLimit && freeForm.max === freeLimit){
                setIsLimitDisabled(true);
            } else {
                setIsLimitDisabled(false);
            }

        }
        // handleLockTimes()
        if(freeForm.timer || freeForm.max) {
            setIsSwitch(true);
            setIsDisabled(false);
        }
        const unlisten = history.listen(async (location: any) => {
            if(location.location.pathname === "/security") {
                dispatch({
                    type: 'global/setFreeForm',
                    payload: {},
                })
            } else {
                const {max, timer} =  await form.getFieldsValue();
                dispatch({
                    type: 'global/setFreeForm',
                    payload: {max, timer: dayjs(timer).endOf('date').valueOf()},
                })
            }
        });

        return () => {
            unlisten();
        };
    },[])


    useEffect(() => {
        setInfo(userInfo)
        if(userInfo?.bio_payment_status === 1) {
            setIsOpenBio(true)
        }else {
            setIsOpenBio(false)
        }
    }, [userInfo])

    const handleCancel = () => {
        setIsSwitch(false);
        // setSessionKey("");
        setFreeLimit("");
        // setValue("");
        form.resetFields();
        // setOldLimit("");
        setIsDisabled(false);
        setDateEdit(false);
        setIsLimitDisabled(false);
        removeTransferFee();
        dispatch({
            type: 'global/setFreeForm',
            payload: {},
        })

        closeModal();
    }

    const handleChange = (e: any) => {
        if(!e.target.checked) {
            openModal('Attention', handleCancel)
        } else {
            setIsSwitch(e.target.checked)
        }
    }

    const generateRandomSixDigits = () => {
        const min = 100000; // 最小值为 100000
        const max = 999999; // 最大值为 999999
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const getAuth = async (verifyRes, transports, id) => {
        return await startAuthentication({
            challenge: verifyRes.publicKey.challenge,
            rpId: verifyRes.publicKey.rpId,
            allowCredentials: [{
                "type": "public-key",
                "id": id,
                "transports": transports
            }],
            userVerification: "required"
        })
    }

    const handleSaveFree = async (axiom: any, isBio: boolean) => {
        const { max, timer } = await form.getFieldsValue();
        if(isBio) {

            const res = await checkBioPasskeyCreate({
                email: email,
                device_id: userInfo.device_id,
            })
            const verifyRes = JSON.parse(res.credentials_json);
            let transports = [res.transport];
            const browser = detectBrowser();
            if(browser === "safari") {
                const version = getSafariVersion();
                if(version && version.version == 16) {
                    transports = ["internal", res.transport]
                }
            }

            try{
                if(res?.credential_ids?.length === 1){
                    await getAuth(verifyRes, transports, res.credential_ids[0]);
                } else if(res?.credential_ids?.length === 2) {
                    await Promise.allSettled(res?.credential_ids.map(item => getAuth(verifyRes, transports,item)));
                }
                setBioStatus("success");
            } catch (error){
                const string = error.toString(), expr = /The operation either timed out or was not allowed/;
                if(string.search(expr) > 0) {
                    setBioStatus("cancel");
                }else {
                    setBioStatus("failed");
                }
            }
            localStorage.setItem("sessionType", "passkey");
        }else {
            localStorage.setItem("sessionType", "password");
        }

        setIsOpen(false);
        setPinLoading(false);

        // setFreeStep("0");
        setIsLimitDisabled(true);
        setIsDisabled(true);
        setDateEdit(true);
        showSuccessToast('Password-free transfer update successfully!')
        const current = new Date().getTime();
        sessionStorage.setItem("freeLimit", max || "");
        sessionStorage.setItem("freeStatus", '1')
        sessionStorage.setItem("freeStep", freeLimit ? '1' : '0')
        sessionStorage.setItem("limit_timer", Math.round(dayjs(timer).endOf('date').valueOf() / 1000));
        sessionStorage.setItem("validAfter", Math.round(current.toString() / 1000));
        // sessionStorage.setItem("validUntil", validUntil.toString());
    }

    const handleSubmit = async (password: any) => {
        setPinLoading(true);
        setMsg("");
        let axiom:any;
        const {max} = form.getFieldsValue();
        try {
            axiom = await Axiom.Wallet.AxiomWallet.fromEncryptedKey(sha256(password), info.transfer_salt, info.enc_private_key, info.address);
            setFreeLimit(max)
        }catch (e: any) {
            console.log('308',e);
            setPinLoading(false);
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/,  expr3 = /invalid private key/;
            if(string.search(expr) > 0 || string.search(expr2) > 0 || string.search(expr3) > 0) {
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
        handleSaveFree(axiom, false);
    }

    const handleBioPay = async() => {
        setIsOpen(false);
        setBioResultOpen(true);
        setBioStatus("loading");
        const axiom = await Axiom.Wallet.AxiomWallet.fromPasskey(userInfo.address);
        await handleSaveFree(axiom, true);
    }

    const handleConfirm = async () => {
        await form.validateFields();
        const times = await transferLockTime({email});
        if(times.lock_type >= 0) {
            showErrorToast("Your account is currently frozen. Please try again tomorrow ！");
            return;
        }
        setMsg("");
        setIsOpen(true);
    }

    // const handlePassword = () => {
    //     setIsOpen(true);
    //     setMsg("");
    //     closeModal();
    // };

    const validatorInput = (rule: any, value: any, callback: any) => {
        const activeValue = Number(value);
        if (value && (activeValue || activeValue === 0)) {
            const strList = value.split('.');
            if (strList.length > 1 && strList[1].length > 18) {
                callback('Please enter a correct amount');
            } else {
                if (activeValue < 100 || activeValue > 5000) {
                    callback('Invalid Input');
                }else {
                    callback();
                }
            }
        } else {
            callback('please enter daily transfer limit');
        }
        callback();
    };

    const disabledDay = (current) => current && current < dayjs().startOf('day');
    const handleDate = (date) => {
        const timer = sessionStorage.getItem("limit_timer");
        const limit = sessionStorage.getItem("freeLimit");
        if(timer){
            if(date){
                const dateString = dayjs(date).endOf('date').valueOf().toString();
                if(timer === dateString && limit){
                    setIsDisabled(true)
                } else {
                    setIsDisabled(false)
                }
            } else {
                setIsDisabled(true)
            }
        } else {
            setIsDisabled(false)
        }

    }

    const handleInputBlur = (e) => {
        const limit = sessionStorage.getItem("freeLimit");
        const limit_timer = sessionStorage.getItem("limit_timer");
        if(limit){
            const { timer } = form.getFieldsValue();
            if(e.target.value === limit && dayjs(timer).endOf('date').valueOf().toString() === limit_timer){
                setIsDisabled(true)
            } else {
                setIsDisabled(false)
            }
        } else{
            setIsDisabled(false)
        }
    }

    return (
        <ChakraProvider theme={theme}>
            <Page needBack backFn={() => history.push('/security')}>
                <div>
                    <h1 className='page-title'>Password-free transfer</h1>
                <p className={styles.freeTip}>Once activated, you can enjoy the quick experience of transferring small amounts without the need for password verification. <i></i> Support for other blockchains is coming soon！</p>
                <div className={styles.freeSwitch}>
                    <Flex align="center">
                        <Switch id='email-alerts' size='lg' colorScheme='yellow' isChecked={isSwitch} onChange={handleChange} />
                        {sessionStorage.getItem("freeStatus" ) === '1' && sessionStorage.getItem("limit_timer") && Number(sessionStorage.getItem("limit_timer")) >= new Date().getTime()? <Tooltip overlayInnerStyle={{background: '#171923', borderRadius: 4, width: 322, textAlign: 'center'}} title='Password-free payment will be activated after your next successful transfer transaction.'>
                            <Flex align="center"  className={styles.pending}><TimerIcon fontSize={24} /><div>Pending activation</div></Flex>
                        </Tooltip>: null}
                    </Flex>
                </div>
                {isSwitch && <div className={styles.freeSetting}>
                    <div className={styles.freeSettingTop}>
                        <span className={styles.freeSettingTopTitle}>Settings</span>
                        <span className={styles.freeSettingTopTip}>Set your password-free transfer limit and validity period</span>
                    </div>
                    <div className={styles.freeSettingCenter}>
                        <Form
                            colon={false}
                            hideRequiredMark
                            form={form} layout="vertical">
                            <Form.Item
                                validateFirst
                                validateTrigger="onBlur"
                                name="max"
                                placeholder='100-5000'
                                label={<span className={styles.freeSettingCenterTitle}>Daily transfer limit</span>}
                                rules={[{ validator: validatorInput }]}
                            >
                                <Input
                                    autoComplete="off"
                                    placeholder='100-5000'
                                    prefix='HK$'
                                    style={{width: 420}}
                                    disabled={isLimitDisabled}
                                    suffix={
                                        isLimitDisabled ? <EditIcon
                                            cursor='pointer'
                                            fontSize={24}
                                            className='icon'
                                            onClick={() => setIsLimitDisabled(false)}
                                        /> : <div className={styles.freeSettingCenterMax} onClick={() => form.setFields([{ name: 'max', errors: [], value: '5000' }])}>
                                            MAX
                                        </div>
                                    }
                                    onBlur={handleInputBlur}
                                />
                            </Form.Item>
                            <div className='date-block'>
                                <Form.Item
                                    name="timer"
                                    rules={[{required: true, message: 'please enter validity date'}]}
                                    label={<span className={styles.freeSettingCenterTitle}>Validity date</span>}
                                >
                                    <DatePicker
                                        disabledDate={disabledDay}
                                        disabled={dateEdit}
                                        style={{width: 420, height: 56}}
                                        format={dayFormat}
                                        suffixIcon={dateEdit ? null: <DateIcon fontSize={24} />}
                                        onChange={handleDate}
                                        placeholder='Please enter validity date'
                                    />
                                </Form.Item>
                                {dateEdit ? <EditIcon
                                    className='icon'
                                    onClick={() => {
                                        setDateEdit(false);
                                    }}
                                    cursor='pointer' fontSize={24}
                                    allowClear={false}
                                /> : null}
                            </div>
                        </Form>
                        <AntdButton
                            style={{width: 320}}
                            disabled={isDisabled}
                            onClick={handleConfirm}
                        >{freeLimit ? "Update" : "Confirm"}</AntdButton>
                    </div>
                </div>}
                <VerifyTransferModal bioPay={handleBioPay} tip="Password-free payment will be activated after your next successful transfer transaction." isOpenBio={isOpenBio} pinLoading={pinLoading} onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false)}} errorMsg={msg} />
                <ModalComponent buttonText="I understand, proceed to confirm">After turning off the password-free payments, you'll need to initiate a new activation transaction to enable it again.</ModalComponent>
                <BioResultModal status={bioStatus} isOpen={bioResultOpen} onClose={() => {setBioResultOpen(false)}} />
            </div>
            </Page>
        </ChakraProvider>
    )
}
export default connect(({ global }) => ({
    userInfo: global.userInfo,
    freeForm: global.freeForm
}))(TransferFree)
