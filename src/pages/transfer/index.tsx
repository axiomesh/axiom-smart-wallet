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
import { Field, Form, Formik } from 'formik';
import {token} from "@/utils/tokenList";
import TransferModal from "@/components/TransferModal";
import SetPayPasswordModal from "@/components/SetPayPasswordModal";

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


const Transfer = () => {
    const [isSetPassword, setIsSetPassword] = useState(true);
    const [buttonText, setButtonText] = useState("Transfer");
    const [tokenList, setTokenList] = useState<token[]>();
    const [isChangeSend, setIsChangeSend] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [toError, setToError] = useState<string>("")

    const {Button} = useContinueButton();

    const options: any = [
        {
            value: "Ethereum",
            label: "Ethereum",
            icon: <i className={styles.iconEth}></i>
        },
        {
            value: "Axiomesh",
            label: "Axiomesh",
            icon: <i className={styles.iconAxm}></i>
        }
    ];
    const handleTokenOption = (network: string) => {
        let arr = [];
        token.map((item: {name: string, network: string}, index: number) => {
            if(item.network === network) {
                arr.push({
                    value: item.name,
                    label: item.name,
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

        }else {
            setPasswordOpen(true)
        }
    }

    const validateName = (value) => {
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        const isValid = ethAddressRegex.test(value);
        if(!isValid) {
            return "Invalid address !"
        }
    }

    const handleFromChange = (e: any) => {
        handleTokenOption(e.value)
    }

    const handleSendChange = () => {
        setIsChangeSend(true)
    }

    const handlePasswordClose = () => {
        setPasswordOpen(false)
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
                <Formik
                    initialValues={{ from: options[0], to: '1' }}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            alert(JSON.stringify(values, null, 2))
                            actions.setSubmitting(false)
                        }, 1000)
                    }}
                >
                    {(props) => (
                        <Form>
                            <Field name='from' validate={validateName}>
                                {({ field, form }) => (
                                    <FormControl className={styles.formControl}>
                                        <FormLabel className={styles.formTitle}>From</FormLabel>
                                        <Select
                                            isDisabled={!isSetPassword}
                                            defaultValue={ options [0] }
                                            options={options}
                                            styles={customStyles(true)}
                                            placeholder=""
                                            components={{ Option: customOption, ValueContainer: customSingleValue }}
                                            onChange={handleFromChange}
                                        />
                                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
                            <div className={styles.formSend}>
                                <Field name='send'>
                                    {({ field, form }) => (
                                        <FormControl className={styles.formControl} style={{width: isChangeSend ? "auto" : "100%"}}>
                                            <FormLabel className={styles.formTitle}>Send</FormLabel>
                                            <Select
                                                options={tokenList}
                                                isDisabled={!isSetPassword}
                                                styles={customStyles(!isChangeSend)}
                                                placeholder="Select a token"
                                                components={{ Option: customOption, ValueContainer: customSingleValue }}
                                                onChange={handleSendChange}
                                            />
                                        </FormControl>
                                    )}
                                </Field>
                                {isChangeSend && <Field name='send'>
                                    {({ field, form }) => (
                                        <FormControl className={styles.formControl}>
                                            <FormLabel className={styles.formTitle}></FormLabel>
                                            <InputGroup>
                                                <Input
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
                                                />
                                                <InputRightElement style={{top: "10px", right: "20px"}}>
                                                    <div className={styles.formMax}>MAX</div>
                                                </InputRightElement>
                                            </InputGroup>
                                            <span className={styles.formGas}>Gas fee: 0.45 AXC</span>
                                            <span className={styles.formBalance}>Balance:100</span>
                                        </FormControl>
                                    )}
                                </Field>}
                            </div>

                            <Field name='to' validate={validateName}>
                                {({ field, form }) => (
                                    <FormControl className={styles.formControl} isInvalid={form.errors.to}>
                                        <FormLabel className={styles.formTitle}>To</FormLabel>
                                        <Input
                                            {...field}
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
                                        />
                                        <FormErrorMessage>{form.errors.to}</FormErrorMessage>
                                    </FormControl>
                                )}
                            </Field>
                        </Form>
                    )}
                </Formik>
                <Button onClick={confirmCallback} onMouseEnter={() => {!isSetPassword && setButtonText('Set transfer password first')}} onMouseLeave={() => {!isSetPassword && setButtonText('Transfer')}}>{buttonText}</Button>
            </div>
            <TransferModal />
            <SetPayPasswordModal isOpen={passwordOpen} onClose={handlePasswordClose} />
        </div>
    )
}

export default Transfer;
