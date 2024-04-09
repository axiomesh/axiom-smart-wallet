import styles from './index.less'
import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    InputRightElement,
    InputGroup
} from '@chakra-ui/react';
import Select, {components} from 'react-select';
import useContinueButton from "@/hooks/ContinueButton";
import React, {useState, useEffect} from "react";
import {token} from "@/utils/tokenList";
import TransferModal from "@/components/TransferModal";
import SetPayPasswordModal from "@/components/SetPayPasswordModal";
import {connect} from "umi";
import {transaction} from "@/services/transfer"
import {getMail} from "@/utils/help";
import {ERC20_ABI} from "axiom-smart-account-test";
import {ethers} from "ethers";

interface token {
    value: string;
    label: string;
    icon: JSX.Element;
}

const customOption = ({ innerProps, data }) => (
    <div {...innerProps} className={styles.formOption}>
        {data.icon?data.icon:null}
        {data.label}
    </div>
);

const customSingleValue = ({ getValue, children }) => (
    <div className={styles.formSingle}>
        {getValue().length > 0 && getValue()[0].icon}
        {children}
    </div>
);

const customStyles = (isFirstSelect: boolean) => ({
    singleValue: (provided, state) => ({
        ...provided,
        color: state.isDisabled ? "#D1D5DB" : "#292D32",
    }),
    control: (provided, state) => ({
        ...provided,
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "0 12px",
        height: "56px",
        "&:focus": {},
        "&:hover": {},
        "&:select": {},
        outline: "none",
        fontSize: "14px",
        fontFamily: "Inter",
        fontWeight: "400",
        backgroundColor: state.isDisabled ? "#E2E8F0" : "white",
        color: state.isDisabled ? "#D1D5DB" : "#292D32",
        width: isFirstSelect ? "100%" : "190px",
        // 添加任何其他所需的样式
    }),
    menu: (provided, state) => ({
        ...provided,
        borderRadius: "20px",
        padding: "10px"
    }),
    indicatorSeparator: () => ({
        display: "none"
    }),
    placeholder: (provided, state) => ({
        ...provided,
        color: "#A0AEC0", // 修改 placeholder 文本颜色
    }),

});

interface FormProps {
    chain: any,
    to: string,
    value: string,
    send: any
}

const options: any = [
    {
        value: 1,
        label: "Ethereum",
        icon: <i className={styles.iconEth}></i>
    },
    {
        value: 0,
        label: "Axiomesh",
        icon: <i className={styles.iconAxm}></i>
    }
];

const Transfer = (props: any) => {
    const { userInfo } = props;
    const email: string | any = getMail();
    const [isSetPassword, setIsSetPassword] = useState(userInfo.pay_password_set_status === 0 ? false : true);
    const [buttonText, setButtonText] = useState("Transfer");
    const [tokenList, setTokenList] = useState<token[]>();
    const [isChangeSend, setIsChangeSend] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [toErrorsText, setToErrorsText] = useState("");
    const [sendError, setSendError] = useState("");
    const [valueError, setValueError] = useState("");
    const [form, setForm] = useState<FormProps>({chain: options[1], to: "", value: "", send: ""});

    const {Button} = useContinueButton();

    useEffect(() => {
        setIsSetPassword(userInfo.pay_password_set_status === 0 ? false : true)
    }, [userInfo])

    const handleTokenOption = (network: string) => {
        let arr = [];
        token.map((item: {name: string, network: string, decimals: number}, index: number) => {
            if(item.network === network) {
                arr.push({
                    value: item.name,
                    label: item.name,
                    decimals: item.decimals,
                    icon: <img src={require(`@/assets/token/${item.name}.png`)} />
                })
            }
        })
        setTokenList(arr)
    }

    useEffect(() => {
        handleTokenOption("Ethereum")
    },[])


    const confirmCallback = () => {
        if(isSetPassword) {
            if(toErrorsText !== "") {
                return;
            }
            if(!form.send){
                setSendError("Please Select a token");
                return;
            }
            if(!form.value){
                setValueError("Invalid balance");
                return;
            }
            setTransferOpen(true)
        }else {
            setPasswordOpen(true)
        }
    }

    const validateName = (e: any) => {
        const value = e.target.value;
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        const isValid = ethAddressRegex.test(value);
        if(!isValid) {
            setToErrorsText("Invalid address !")
        }else {
            setToErrorsText("")
        }
    }

    const handleFromChange = (e: any) => {
        setForm({...form, chain: e})
        handleTokenOption(e.label)
    }

    const handleSendChange = (e: any) => {
        setForm({...form, send: e})
        setSendError("")
        setIsChangeSend(true)
    }

    const handlePasswordClose = (isSuccess: Boolean) => {
        isSuccess && setIsSetPassword(true);
        setPasswordOpen(false)
    }

    const handleSubmit = async (password: string) => {
        console.log(window.axiom.getAddress())
        console.log(window.axiom.getEncryptedPrivateKey())
        const value = ethers.utils.parseUnits(form.value, form.send.decimals);
        const callData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [form.to, value])
        const res = await window.axiom.sendUserOperation(form.to, form.value, callData, {})
        console.log(res)
        const ev = await res.wait();
        console.log(ev)
        const transactionRes = await transaction({
            email,
            transaction_hash: ev.transactionHash,
            value: form.value,
            chain_type: Number(form.chain.value),
            token_name: form.send.value,
            to_address: form.to,
        })
        console.log(transactionRes)
    }

    return (
        <div className={styles.transfer}>
            <div className={styles.transferTitle}>
                <h1>Transfer</h1>
                <div className={styles.transferHistory}>
                    <img src={require('@/assets/transfer/history.png')} alt=""/>
                    <span>History</span>
                </div>
            </div>
            <div className={styles.transferContent}>
                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formTitle}>From</FormLabel>
                    <Select
                        value={form.chain}
                        isDisabled={!isSetPassword}
                        defaultValue={ options [1] }
                        options={options}
                        styles={customStyles(true)}
                        placeholder=""
                        components={{ Option: customOption, ValueContainer: customSingleValue }}
                        onChange={handleFromChange}
                    />
                    {/*<FormErrorMessage>{form.errors.name}</FormErrorMessage>*/}
                </FormControl>
                <div className={styles.formSend}>
                    <FormControl className={styles.formControl} style={{width: isChangeSend ? "auto" : "100%"}} isInvalid={sendError !== ""}>
                        <FormLabel className={styles.formTitle}>Send</FormLabel>
                        <Select
                            value={form.send}
                            options={tokenList}
                            isDisabled={!isSetPassword}
                            styles={customStyles(!isChangeSend)}
                            placeholder="Select a token"
                            components={{ Option: customOption, ValueContainer: customSingleValue }}
                            onChange={handleSendChange}
                        />
                        <FormErrorMessage>{sendError}</FormErrorMessage>
                    </FormControl>
                    {isChangeSend &&
                        <FormControl className={styles.formControl} isInvalid={valueError !== ""}>
                            <FormLabel className={styles.formTitle}></FormLabel>
                            <InputGroup>
                                <Input
                                    value={form.value}
                                    isDisabled={!isSetPassword}
                                    fontSize="14px"
                                    fontWeight="400"
                                    color="gray.700"
                                    height="56px"
                                    borderRadius="12px"
                                    _disabled={{
                                        color: "#D1D5DB",
                                        bg: "gray.200", // 修改禁用状态的背景色
                                        cursor: "not-allowed" // 修改禁用状态的鼠标样式
                                    }}
                                    _placeholder={{
                                        color: "#A0AEC0"
                                    }}
                                    onChange={(e: any) => { setForm({ ...form, value: e.target.value }) }}
                                />
                                <InputRightElement style={{top: "10px", right: "20px"}}>
                                    <div className={styles.formMax}>MAX</div>
                                </InputRightElement>
                            </InputGroup>
                            {valueError === "" &&
                                <div>
                                    <span className={styles.formGas}>Gas fee: 0.45 AXC</span>
                                    <span className={styles.formBalance}>Balance:100</span>
                                </div>
                            }
                            <FormErrorMessage style={{position: "absolute"}}>{valueError}</FormErrorMessage>
                        </FormControl>}
                </div>

                <FormControl className={styles.formControl} isInvalid={toErrorsText !== ""}>
                    <FormLabel className={styles.formTitle}>To</FormLabel>
                    <Input
                        value={form.to}
                        isDisabled={!isSetPassword}
                        fontSize="14px"
                        fontWeight="400"
                        color="gray.700"
                        height="56px"
                        borderRadius="12px"
                        placeholder="e.g. 0x1de3... or destination.eth"
                        _disabled={{
                            color: "#D1D5DB",
                            bg: "gray.200", // 修改禁用状态的背景色
                            cursor: "not-allowed" // 修改禁用状态的鼠标样式
                        }}
                        _placeholder={{
                            color: "#A0AEC0"
                        }}
                        onBlur={validateName}
                        onChange={(e: any) => {setForm({...form, to: e.target.value})}}
                    />
                    <FormErrorMessage>{toErrorsText}</FormErrorMessage>
                </FormControl>
                <Button onClick={confirmCallback} onMouseEnter={() => {!isSetPassword && setButtonText('Set transfer password first')}} onMouseLeave={() => {!isSetPassword && setButtonText('Transfer')}}>{buttonText}</Button>
            </div>
            <TransferModal open={transferOpen} onSubmit={handleSubmit} onClose={() => {setTransferOpen(false)}} />
            <SetPayPasswordModal isOpen={passwordOpen} onClose={handlePasswordClose} />
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Transfer)
