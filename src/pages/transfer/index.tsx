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
import {connect, history} from "umi";
import {transaction, passwordTimes, wrongPassword, transferLockTime} from "@/services/transfer";
import {getTickerPrice} from "@/services/login";
import {getMail} from "@/utils/help";
import {ERC20_ABI, AxiomAccount, generateSigner} from "axiom-smart-account-test";
import {ethers, Wallet} from "ethers";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import TransferResultModal from "@/components/TransferResultModal";
import {msToTime} from "@/utils/utils";

interface token {
    value: string;
    label: string;
    contract: any;
    icon: JSX.Element;
}

interface transferProps {
    send: string;
    to: string;
    blockchain: string;
    value: string;
    gas: string;
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
    chain: any;
    to: string;
    value: string;
    send: any;
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
    const [isSetPassword, setIsSetPassword] = useState(false);
    const [buttonText, setButtonText] = useState("Transfer");
    const [tokenList, setTokenList] = useState<token[]>();
    const [isChangeSend, setIsChangeSend] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [toErrorsText, setToErrorsText] = useState("");
    const [sendError, setSendError] = useState("");
    const [valueError, setValueError] = useState("");
    const [resultStatus, setResultStatus] = useState("");
    const [resultName, setResultName] = useState("");
    const [form, setForm] = useState<FormProps>({chain: options[1], to: "", value: "", send: ""});
    const {showSuccessToast, showErrorToast} = Toast();
    const [gasFee, setGasFee] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [balance, setBalance] = useState(0);
    const [transferInfo, setTransferInfo] = useState<transferProps>();
    const [lockTimes, setLockTimes] = useState('');

    const {Button} = useContinueButton();

    let timer = null;

    useEffect(() => {
        if(userInfo.pay_password_set_status)
        setIsSetPassword(userInfo.pay_password_set_status === 0 ? false : true);
    }, [userInfo])

    const handleTokenOption = (network: string) => {
        let arr = [];
        token.map((item: {name: string, network: string, decimals: number, contract: string, symbol: string}, index: number) => {
            if(item.network === network) {
                arr.push({
                    value: item.name,
                    label: item.name,
                    decimals: item.decimals,
                    contract: item.contract,
                    symbol: item.symbol,
                    icon: <img src={require(`@/assets/token/${item.name}.png`)} />
                })
            }
        })
        setTokenList(arr)
    }


    const countdown = (milliseconds) => {
        timer = setInterval(() => {
            milliseconds -= 1000;
            if (milliseconds < 0) {
                clearInterval(timer);
                setLockTimes("");
            } else {
                setLockTimes(msToTime(milliseconds))
            }
        }, 1000)
    }

    const handleLockTimes = async () => {
        const times = await transferLockTime({email});
        if(times > 0) {
            countdown(times)
        }
    };

    useEffect(() => {
        handleLockTimes()
        handleTokenOption("Axiomesh")
        return () => {
            clearInterval(timer)
        };
    },[])

    useEffect(() => {
        if(form.value) {
            getGas(form.value).then((res: any) => {
                setGasFee(res);
            })
        }
    },[form.value])

    const getGas = async (amount: string) => {
        const signer = generateSigner();
        const value = ethers.utils.parseUnits(amount, form.send.decimals);
        const axiom = await AxiomAccount.voidSmartAccout();
        let calldata = "0x";
        let targetAddress = signer.address;
        let payMaster = "";
        let erc20Address = "";
        if(form.send.value !== "AXC") {
            const erc20 = new ethers.Contract(form.send.contract, ERC20_ABI);
            calldata = erc20.interface.encodeFunctionData('transfer',[signer.address, value]);
            targetAddress = form.send.contract;
            payMaster = window.PAYMASTER;
            erc20Address = form.send.contract;
        }
        const res = await axiom.estimateUserOperationGas(
            targetAddress,
            value,
            calldata,
            payMaster,
            erc20Address
        );
        return ethers.utils.formatEther(res);
    }

    const getSymbol = async (erc20:any, currentProvider:any) => {
        const symboldata = erc20.interface.encodeFunctionData('decimals');
        const symbolRes = await currentProvider.call({
            to: erc20.address,
            data: symboldata,
            // value: 0,
        })
        return  Math.pow(10, Number(symbolRes === '0x' ? 0 : BigInt(symbolRes).toString()))
    }

    const initBalance = async (type:string | any) => {
        // @ts-ignore
        const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
        // @ts-ignore
        const provider = new ethers.providers.JsonRpcProvider(window.ETH_RPC);
        const address = '0xc7F999b83Af6DF9e67d0a37Ee7e900bF38b3D013';
        if(type === 'AXC'){
            const balance = await rpc_provider.getBalance(userInfo.address);
            // const balance = await rpc_provider.getBalance(address);
            // @ts-ignore
            return balance.toBigInt().toString() / Math.pow(10, window.AXC_SYMBOL)
        } else {
            const allList = tokenList;
            const filterData = allList.filter((item: token) => item.value === type)[0];
            console.log(allList)
            const currentProvider = filterData.value === 'ETH' ? provider : rpc_provider;
            // return 0
            const erc20 = new ethers.Contract(filterData.contract, ERC20_ABI);
            const calldata = erc20.interface.encodeFunctionData('balanceOf',[userInfo.address]);
            // const calldata = erc20.interface.encodeFunctionData('balanceOf',[address]);

            const res = await currentProvider.call({
                to: erc20.address,
                data: calldata,
            })
            const decimals = await getSymbol(erc20, currentProvider)
            // @ts-ignore
            return (res === '0x' ? 0 : BigInt(res).toString() / decimals)
        }
    }


    const confirmCallback = async () => {
        if(lockTimes)
            return;
        if(isSetPassword) {
            try {
                ethers.utils.getAddress(form.to);
                setToErrorsText("");
            }catch (e: any) {
                setToErrorsText("Invalid address !");
                return;
            }
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
            const gas = await getGas(form.value);
            const priceList = await getTickerPrice();
            let price: number;
            priceList.map((item: any) => {
                if(item.symbol === form.send.symbol) {
                    price = item.price * gas;
                }
            })
            console.log(price)
            setTransferInfo({
                send: form.send.value,
                to: form.to,
                blockchain: form.chain.label,
                value: form.value,
                gas: gas,
                gasPrice: price,
            })
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

    const handleSendChange = async (e: any) => {
        setForm({...form, send: e})
        setBalance(await initBalance(e.value))
        setSendError("")
        setIsChangeSend(true)
    }

    const handlePasswordClose = (isSuccess: Boolean) => {
        isSuccess && setIsSetPassword(true);
        setPasswordOpen(false)
    }

    const handleValueChange = async (e: any) => {
        setForm({ ...form, value: e.target.value })
    }

    const handleMax = async () => {
        const gas = await getGas(balance.toString());
        const max = balance - gas;
        setForm({ ...form, value: max.toString() })
    }

    const handleToChange = async (e: any) => {
        setForm({...form, to: e.target.value});
    }

    const handleSubmit = async (password: string) => {
        const value = ethers.utils.parseUnits(form.value, form.send.decimals);
        const sessionKey = sessionStorage.getItem("sessionKey");
        const key = sessionStorage.getItem("key");
        const freeLimit = sessionStorage.getItem("freeLimit");
        let axiom: any;
        try {
            axiom = (sessionKey || freeLimit) ? await AxiomAccount.fromEncryptedKey(key, userInfo.transfer_salt, userInfo.enc_private_key) : await AxiomAccount.fromEncryptedKey(sha256(password), userInfo.transfer_salt, userInfo.enc_private_key);
        }catch (e: any) {
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                await wrongPassword({email});
                const times = await passwordTimes({email})
                console.log(times)
                if(times > 0) {
                    setPasswordError(`Invalid password ，only ${times} attempts are allowed today!`)
                }else {
                    setPasswordError("Invalid password ，your account is currently locked. Please try again tomorrow !")
                }
            }
            return;
        }
        let currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999)
        const validAfter = Math.round(Date.now() / 1000);
        const validUntil = currentDate.getTime();
        const sessionSigner = generateSigner();
        setTransferOpen(false);
        setResultOpen(true);
        setResultStatus("loading")
        try {
            let ev: any;
            if(sessionKey) {
                const key = sessionStorage.getItem("sessionKey");
                const signer = new Wallet(key);
                axiom.updateSigner(signer)
            }
            if(form.send.value === "AXC") {
                if(!sessionKey && freeLimit) {
                    const session = await axiom.setSession(
                        sessionSigner,
                        value,
                        validAfter,
                        validUntil,
                        "",
                        "",
                        {}
                    );
                    const signer = new Wallet(sessionSigner.privateKey);
                    axiom.updateSigner(signer)
                    sessionStorage.setItem("sessionKey", sessionSigner.privateKey);
                }
                const callData = "0x"
                const res = await axiom.sendUserOperation(form.to, value, callData, "", "", {
                    onBuild: (op) => {
                        console.log("Signed UserOperation:", op);
                    }
                })
                ev = await res.wait();
            }else {
                if(!sessionKey && freeLimit) {
                    await axiom.setSession(
                        sessionSigner,
                        value,
                        validAfter,
                        validUntil,
                        window.PAYMASTER,
                        form.send.contract,
                        {}
                    );
                    const signer = new Wallet(sessionSigner.privateKey);
                    axiom.updateSigner(signer)
                    sessionStorage.setItem("sessionKey", sessionSigner.privateKey);
                }
                // @ts-ignore
                const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
                // @ts-ignore
                const erc20 = new ethers.Contract(window.PAYMASTER, ERC20_ABI);
                // @ts-ignore
                const calldata = erc20.interface.encodeFunctionData('allowance',[userInfo.address, window.PAYMASTER]);
                const res = await rpc_provider.call({
                    to: form.send.contract,
                    data: calldata,
                })
                const allow = parseInt(res, 16);
                if(allow === 0) {
                    const to = [form.send.contract, form.send.contract];
                    const erc20 = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
                    const calldata = [
                        erc20.interface.encodeFunctionData("approve", [window.PAYMASTER, ethers.constants.MaxUint256]),
                        erc20.interface.encodeFunctionData("transfer", [form.to, value]),
                    ];
                    const res = await axiom.sendBatchedUserOperation(to, calldata, window.PAYMASTER, form.send.contract, {
                        onBuild: (op) => {
                            console.log("Signed UserOperation:", op);
                        },
                    });
                    ev = await res.wait();
                    console.log(ev)
                }else {
                    const callData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [form.to, value])
                    const res = await axiom.sendUserOperation(form.send.contract, value, callData, window.PAYMASTER, form.send.contract, {
                        onBuild: (op) => {
                            console.log("Signed UserOperation:", op);
                        }
                    })
                    ev = await res.wait();
                }
            }

            await transaction({
                email,
                transaction_hash: ev.transactionHash,
                value: form.value,
                chain_type: Number(form.chain.value),
                token_name: form.send.value,
                to_address: form.to,
            })
            setResultName(form.send.value)
            setResultStatus("success")
            setTimeout(() => {
                window.location.reload()
            },3000)
        }catch (e) {
            setResultStatus("failed")
            console.log(e)
        }
    }

    return (
        <>
            {lockTimes && <div className={styles.toast}><img src={require("@/assets/reset/toast.png")} alt=""/><span>Your account has been frozen for 24 hours and transactions cannot be sent normally. {lockTimes}</span></div>}
            <div className={styles.transfer}>
                <div className={styles.transferTitle}>
                    <h1>Transfer</h1>
                    <div className={styles.transferHistory} onClick={() => history.push('/transfer-history')}>
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
                                        onChange={handleValueChange}
                                    />
                                    <InputRightElement style={{top: "10px", right: "20px"}}>
                                        <div className={styles.formMax} onClick={handleMax}>MAX</div>
                                    </InputRightElement>
                                </InputGroup>
                                {valueError === "" &&
                                    <div>
                                        {gasFee && <span className={styles.formGas}>Gas fee: {gasFee} {form.send.value}</span>}
                                        <span className={styles.formBalance}>Balance:{balance}</span>
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
                            onChange={handleToChange}
                        />
                        <FormErrorMessage>{toErrorsText}</FormErrorMessage>
                    </FormControl>
                    <Button onClick={confirmCallback} disabled={lockTimes !== "" ? true : false} onMouseEnter={() => {!isSetPassword && setButtonText('Set transfer password first')}} onMouseLeave={() => {!isSetPassword && setButtonText('Transfer')}}>{buttonText}</Button>
                </div>
                <TransferModal open={transferOpen} onSubmit={handleSubmit} onClose={() => {setTransferOpen(false)}} info={transferInfo} errorMsg={passwordError} />
                <SetPayPasswordModal isOpen={passwordOpen} onClose={handlePasswordClose} />
                <TransferResultModal isOpen={resultOpen} onClose={() => {setResultOpen(false);window.location.reload();}} status={resultStatus} name={resultName} />
            </div>
        </>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Transfer)
