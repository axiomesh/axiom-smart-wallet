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
import {ERC20_ABI, AxiomAccount, generateSigner, deriveAES256GCMSecretKey, encrypt, decrypt} from "axiom-smart-account-test";
import {BigNumber, ethers, Wallet} from "ethers";
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import TransferResultModal from "@/components/TransferResultModal";
import {msToTime, formatAmount, generateRandomBytes} from "@/utils/utils";
import { EntryPoint__factory } from "userop/dist/typechain";

function Loading (props: any) {
    return <div className='loader' {...props}></div>
}

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
    gasPrice: string | number;
}

const customOption: React.FC<{ innerProps: any; data: any; }>  = ({ innerProps, data }) => (
    <div {...innerProps} className={`${styles.formOption} ${data.isDisabled ? styles.formOptionDisabled : ""}`}>
        {data.icon?data.icon:null}
        {data.label}
    </div>
);

const customSingleValue: React.FC<{ getValue: any; children: any; }> = ({ getValue, children }) => (
    <div className={styles.formSingle}>
        {getValue().length > 0 && getValue()[0].icon}
        {children}
    </div>
);

const customStyles = (isFirstSelect: boolean) => ({
    singleValue: (provided: any, state: any) => ({
        ...provided,
        color: state.isDisabled ? "#D1D5DB" : "#292D32",
    }),
    control: (provided: any, state: any) => ({
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
    menu: (provided: any) => ({
        ...provided,
        borderRadius: "20px",
        padding: "10px"
    }),
    indicatorSeparator: () => ({
        display: "none"
    }),
    placeholder: (provided: any) => ({
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
        value: 0,
        label: "Axiomesh",
        icon: <i className={styles.iconAxm}></i>,
        isDisabled: false
    },
    {
        value: 1,
        label: "Ethereum",
        icon: <i className={styles.iconEth}></i>,
        isDisabled: true
    }
];

const Transfer = (props: any) => {
    const { userInfo } = props;
    const email: string | any = getMail();
    const [isSetPassword, setIsSetPassword] = useState(true);
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
    const [form, setForm] = useState<FormProps>({chain: options[0], to: "", value: "", send: null});
    const [sessionForm, setSessionForm] = useState<FormProps>();
    const {showSuccessToast, showErrorToast} = Toast();
    const [gasFee, setGasFee] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [balance, setBalance] = useState(0);
    const [transferInfo, setTransferInfo] = useState<transferProps>();
    const [lockTimes, setLockTimes] = useState('');
    const [isLock, setIsLock] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [gasLoading, setGasLoading] = useState(false);

    const {Button} = useContinueButton();

    let timer: any = null;

    useEffect(() => {
        if(userInfo.pay_password_set_status)
        setIsSetPassword(userInfo.pay_password_set_status === 0 ? false : true);
    }, [userInfo])

    const handleTokenOption = (network: string) => {
        let arr: any = [];
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


    const countdown = (milliseconds: number) => {
        timer = setInterval(() => {
            milliseconds -= 1000;
            if (milliseconds < 0) {
                clearInterval(timer);
                setLockTimes("");
                setIsLock(false);
            } else {
                setLockTimes(msToTime(milliseconds))
            }
        }, 1000)
    }

    const handleLockTimes = async () => {
        const times = await transferLockTime({email});
        if(times > 0) {
            setIsLock(true);
            countdown(times)
        }else {
            setIsLock(false);
        }
    };

    useEffect(() => {
        handleLockTimes();
        const formInfo = sessionStorage.getItem("form");
        let formParse;
        if(formInfo) {
            formParse = JSON.parse(formInfo);
            handleTokenOption(formParse.chain.label)
            setSessionForm(formParse)
        }else {
            handleTokenOption("Axiomesh");
        }
        return () => {
            clearInterval(timer);
        };
    },[])

    useEffect(() => {
        if(sessionForm) {
            let newForm: FormProps = {chain: null, to: "", send: null, value: ""};
            const chainFilter = options.filter((item: any) => item.label === sessionForm.chain.label);
            newForm.chain = chainFilter[0];
            if(sessionForm.send){
                const sendFilter = tokenList.filter((item: any) => item.symbol === sessionForm.send.symbol);
                newForm.send = sendFilter[0];
                setIsChangeSend(true)
                initBalance(newForm.send.value).then((balance: any) => {
                    setBalance(formatAmount(balance.toString()))
                });
            }
            if(sessionForm.value) {
                newForm.value = sessionForm.value
                getGas(sessionForm.value, sessionForm.send).then((res: any) => {
                    setGasFee(res);
                })
            }
            sessionForm.to && (newForm.to = sessionForm.to);
            setForm(newForm)
        }
    }, [sessionForm])

    useEffect(() => {
        return () => {
            if(form.value)
            sessionStorage.setItem("form", JSON.stringify(form))
        }
    }, [form])

    const handleValueBlur = () => {
        if(form.value && Number(form.value) > 0) {
            setGasLoading(true);
            setValueError("");
            getGas(form.value, form.send).then((res: any) => {
                setGasLoading(false);
                setGasFee(res);
                if((Number(res) + Number(form.value)) > Number(balance)) {
                    setValueError("Gas fee is insufficient");
                }
            })
        }else {
            setValueError("Invalid balance");
        }
    }

    const getGas = async (amount: string, send: any) => {
        const signer = generateSigner();
        const axiom = await AxiomAccount.voidSmartAccout();
        let calldata = "0x";
        let targetAddress = signer.address;
        let payMaster = "";
        let erc20Address = "";
        let allow: any,rpc_provider: any;
        let decimals: any = 18;
        let value: number | BigNumber = ethers.utils.parseUnits(amount, decimals);
        if(form.send.value !== "AXC") {
            // @ts-ignore
            rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
            const contract = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
            if(form.send.value === "AXC") {
                decimals = 18;
            }else {
                decimals = await contract.decimals();
            }
            value = ethers.utils.parseUnits(amount, decimals);
            // @ts-ignore
            const erc20 = new ethers.Contract(window.PAYMASTER, ERC20_ABI, rpc_provider);
            // @ts-ignore
            const calldata = erc20.interface.encodeFunctionData('allowance',[userInfo.address, window.PAYMASTER]);
            const res = await rpc_provider.call({
                to: form.send.contract,
                data: calldata,
            })
            console.log(res)
            allow = parseInt(res, 16);
        }
        if(allow === 0) {
            const to = [form.send.contract, form.send.contract];
            const erc20 = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
            const calldata = [
                erc20.interface.encodeFunctionData("approve", [window.PAYMASTER, ethers.constants.MaxUint256]),
                erc20.interface.encodeFunctionData("transfer", [userInfo.address, value]),
            ];
            // await axiom.sendBatchedUserOperation(to, calldata, window.PAYMASTER, form.send.contract, {
            //     dryRun: true,
            //     onBuild: (op: any) => {
            //         console.log(op)
            //         const callGasLimit = BigNumber.from(op.callGasLimit);
            //         const preVerificationGas = BigNumber.from(op.preVerificationGas);
            //         const verificationGasLimit = BigNumber.from(op.verificationGasLimit);
            //         const maxFeePerGas = BigNumber.from(op.maxFeePerGas);

            //         const estimatedGas = callGasLimit
            //         .add(preVerificationGas)
            //         .add(verificationGasLimit)
            //         .mul(maxFeePerGas);
            //         console.log(estimatedGas)
            //         const axcGas: any = ethers.utils.formatEther(res);
            //         console.log(axcGas)
            //     },
            // });
            const res = await axiom.estimateUserOperationGas(
                to,
                0,
                calldata,
                window.PAYMASTER,
                form.send.contract
            );
            const axcGas: any = ethers.utils.formatEther(res);
            const priceList = await getTickerPrice();
                let price: number = 0, axcPrice: number = 0;
                priceList.map((item:any) => {
                    if(item.symbol.toLowerCase() === send.symbol.toLowerCase()) {
                        price = item.price;
                    }
                    if(item.symbol === "AXCUSD") {
                        axcPrice = item.price;
                    }
                })
                return (axcPrice / price) * axcGas;
        }else {
            if(send.value !== "AXC") {
                const erc20 = new ethers.Contract(send.contract, ERC20_ABI);
                calldata = erc20.interface.encodeFunctionData('transfer',[signer.address, value]);
                targetAddress = send.contract;
                payMaster = window.PAYMASTER;
                erc20Address = send.contract;
                value = 0;
            }
            const res = await axiom.estimateUserOperationGas(
                targetAddress,
                value,
                calldata,
                payMaster,
                erc20Address
            );
            const axcGas: any = ethers.utils.formatEther(res);
            if(send.value === "AXC") {
                return axcGas;
            }else {
                const priceList = await getTickerPrice();
                let price: number = 0, axcPrice: number = 0;
                priceList.map((item:any) => {
                    if(item.symbol.toLowerCase() === send.symbol.toLowerCase()) {
                        price = item.price;
                    }
                    if(item.symbol === "AXCUSD") {
                        axcPrice = item.price;
                    }
                })
                return (axcPrice / price) * axcGas;
            }
        }
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
            if(!form.value || Number(form.value) <= 0){
                setValueError("Invalid balance");
                return;
            }
            setBtnLoading(true)
            const gas = await getGas(form.value, form.send);
            if((Number(gas) + Number(form.value)) > Number(balance)) {
                setValueError("Gas fee is insufficient");
                setBtnLoading(false)
                return;
            }
            const priceList = await getTickerPrice();
            let price: number = 0;
            priceList.map((item: any) => {
                if(item.symbol.toLowerCase() === form.send.symbol.toLowerCase()) {
                    price = item.price * gas;
                }
            })
            const sessionKey = sessionStorage.getItem("sk");
            const sr = sessionStorage.getItem("sr");
            if(sessionKey && sr !== "0") {
                const skPassword = sessionStorage.getItem("a");
                const salt = sessionStorage.getItem("b");
                const ow = sessionStorage.getItem("ow");
                const secretKey = await deriveAES256GCMSecretKey(skPassword, salt);
                const decryptKey = decrypt(sessionKey, secretKey.toString());
                const signer = new Wallet(decryptKey);
                const axiom = await AxiomAccount.sessionSmartAccount(
                    signer,
                    ow
                );
                // @ts-ignore
                const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
                // @ts-ignore
                const contract = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
                let decimals: any;
                if(form.send.value === "AXC") {
                    decimals = 18;
                }else {
                    decimals = await contract.decimals();
                }
                const value = ethers.utils.parseUnits(form.value, decimals);
                if(form.send.value === "AXC") {
                    try {
                        const callData = "0x";
                        await axiom.sendUserOperation(form.to, value, callData, "", "", {
                            dryRun: false,
                            onBuild: async (op: any) => {
                                console.log("Signed UserOperation:", op);
                                const entryPoint = EntryPoint__factory.connect(
                                    window.ENTRY_POINT,
                                    rpc_provider
                                    );
                                    try {
                                        await entryPoint.callStatic.handleOps([op], userInfo.address);
                                    } catch (error: any) {
                                        const string = error.toString(), expr = /post user op reverted: execution reverted errdata spent amount exceeds session spending limit/;
                                        if(string.search(expr) > 0) {

                                        }
                                    }   
                            }
                        })
                    }catch (e: any) {
                        console.log(e)
                        // setResultStatus("failed");
                        return;
                    }
                }else {
                    try {
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
                        console.log(res)
                        const allow = parseInt(res, 16);
                        console.log(allow)
                        if(allow === 0) {
                            const to = [form.send.contract, form.send.contract];
                            const erc20 = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
                            const calldata = [
                                erc20.interface.encodeFunctionData("approve", [window.PAYMASTER, ethers.constants.MaxUint256]),
                                erc20.interface.encodeFunctionData("transfer", [form.to, value]),
                            ];
                            await axiom.sendBatchedUserOperation(to, calldata, window.PAYMASTER, form.send.contract, {
                                onBuild: async (op: any) => {
                                    console.log("Signed UserOperation:", op);
                                    const entryPoint = EntryPoint__factory.connect(
                                        window.ENTRY_POINT,
                                        rpc_provider
                                        );
                                        try {
                                            await entryPoint.callStatic.handleOps([op], userInfo.address);
                                        } catch (error: any) {
                                            const string = error.toString(), expr = /post user op reverted: execution reverted errdata spent amount exceeds session spending limit/;
                                            if(string.search(expr) > 0) {
    
                                            }
                                        }   
                                }
                            });
                        }else {
                            const callData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [form.to, value])
                            await axiom.sendUserOperation(form.send.contract, 0, callData, window.PAYMASTER, form.send.contract, {
                                onBuild: async (op: any) => {
                                    console.log("Signed UserOperation:", op);
                                    const entryPoint = EntryPoint__factory.connect(
                                        window.ENTRY_POINT,
                                        rpc_provider
                                        );
                                        try {
                                            await entryPoint.callStatic.handleOps([op], userInfo.address);
                                        } catch (error: any) {
                                            console.log(error)
                                            const string = error.toString(), expr = /post user op reverted: execution reverted errdata spent amount exceeds session spending limit/;
                                            if(string.search(expr) > 0) {
    
                                            }
                                        }   
                                }
                            })
                        }
                    }catch (e: any) {
                        console.log(e)
                        // setResultStatus("failed");
                        return;
                    }
                }
            }
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

    const handleFromChange = async (e: any) => {
        console.log(e)
        // if(e.isDisabled) {
        //     showErrorToast("Coming soon");
        //     return;
        // }
        setForm({...form, chain: e, send: null})
        setIsChangeSend(false)
        handleTokenOption(e.label)
    }

    const handleSendChange = async (e: any) => {
        setGasFee("")
        setForm({...form, send: e, value: ""})
        const balance = await initBalance(e.value);
        setBalance(formatAmount(balance.toString()))
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
        const gas = await getGas(balance.toString(), form.send);
        setGasFee(gas)
        // console.log(gas, "gas")
        // const gasNumber = ethers.utils.parseUnits(gas.toString(), 18);
        // console.log(gasNumber)
        // const balanceNumber = ethers.utils.parseUnits(balance.toString(), 18);
        // console.log(balanceNumber)
        // const maxNumber = balanceNumber.sub(gasNumber);
        // const max = ethers.utils.formatUnits(maxNumber, 18);
        // console.log(maxNumber)
        // console.log(max)
        const max = balance - gas;
        setForm({ ...form, value: max.toString() })
    }

    const handleToChange = async (e: any) => {
        setForm({...form, to: e.target.value});
    }

    const handleResultClose = () => {
        setResultOpen(false);
        setBtnLoading(false);
        window.location.reload();
    }

    const handleAXMSubmit = async (password: string) => {
        // @ts-ignore
        const rpc_provider = new ethers.providers.JsonRpcProvider(window.RPC_URL);
        // @ts-ignore
        const contract = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
        let decimals: any;
        if(form.send.value === "AXC") {
            decimals = 18;
        }else {
            decimals = await contract.decimals();
        }
        const value = ethers.utils.parseUnits(form.value, decimals);
        const sr = sessionStorage.getItem("sr");
        const sessionKey = sessionStorage.getItem("sk");
        let axiom: any, ev: any;
        if((sessionKey && sr === "0") || !sessionKey) {
            console.log(123)
            try {
                axiom = await AxiomAccount.fromEncryptedKey(sha256(password), userInfo.transfer_salt, userInfo.enc_private_key)
            }catch (e: any) {
                const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
                if(string.search(expr) > 0 || string.search(expr2) > 0) {
                    await wrongPassword({email});
                    const times = await passwordTimes({email})
                    if(times > 0) {
                        if(times < 4) {
                            setPasswordError(`Invalid password ，only ${times} attempts are allowed today!`)
                        }else {
                            setPasswordError(`Invalid password`)
                        }
                    }else {
                        setPasswordError("Invalid password ，your account is currently locked. Please try again tomorrow !")
                    }
                }
                return;
            }
        }else {
            if(sessionKey) {
                console.log(111111)
                const skPassword = sessionStorage.getItem("a");
                const salt = sessionStorage.getItem("b");
                const ow = sessionStorage.getItem("ow");
                const secretKey = await deriveAES256GCMSecretKey(skPassword, salt);
                const decryptKey = decrypt(sessionKey, secretKey.toString());
                console.log(decryptKey)
                const signer = new Wallet(decryptKey);
                console.log(signer)
                axiom = await AxiomAccount.sessionSmartAccount(
                    signer,
                    ow
                );
            }
        }
        openResult();
        if(form.send.value === "AXC") {
            try {
                ev = await handleAXMCTransfer(axiom, value);
            }catch (e: any) {
                console.log(e)
                // setResultStatus("failed");
                return;
            }
        }else {
            try {
                ev = await handleAXMERC20Transfer(axiom, value);
            }catch (e: any) {
                console.log(e)
                // setResultStatus("failed");
                return;
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
        if(sr === "0") {
            sessionStorage.removeItem("sr");
        }
        setResultStatus("success")

    }

    const handleAXMCTransfer = async (axiom: any, value: BigNumber) => {
        console.log(axiom)
        const sr = sessionStorage.getItem("sr");
        const sessionKey = sessionStorage.getItem("sk");
        if(sessionKey && sr === "0") {
            await handleSendSetSession(axiom)
        }
        console.log(form.to, value)
        const callData = "0x";
        const res = await axiom.sendUserOperation(form.to, value, callData, "", "", {
            onBuild: (op: any) => {
                console.log("Signed UserOperation:", op);
            }
        })
        console.log(res)
        const ev = await res.wait();
        console.log(ev)
        return ev;
    }

    const handleAXMERC20Transfer = async (axiom: any, value: BigNumber) => {
        const sessionKey = sessionStorage.getItem("sk");
        const sr = sessionStorage.getItem("sr");
        if(sessionKey && sr === "0") {
            await handleSendSetSession(axiom)
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
        console.log(res)
        const allow = parseInt(res, 16);
        console.log(allow)
        if(allow === 0) {
            console.log(1111112312312312)
            const to = [form.send.contract, form.send.contract];
            const erc20 = new ethers.Contract(form.send.contract, ERC20_ABI, rpc_provider);
            const calldata = [
                erc20.interface.encodeFunctionData("approve", [window.PAYMASTER, ethers.constants.MaxUint256]),
                erc20.interface.encodeFunctionData("transfer", [form.to, value]),
            ];
            const res = await axiom.sendBatchedUserOperation(to, calldata, window.PAYMASTER, form.send.contract, {
                onBuild: (op: any) => {
                    console.log("Signed UserOperation:", op);
                },
            });
            const ev = await res.wait();
            return ev;
        }else {
            const callData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [form.to, value])
            const res = await axiom.sendUserOperation(form.send.contract, 0, callData, window.PAYMASTER, form.send.contract, {
                onBuild: (op: any) => {
                    console.log("Signed UserOperation:", op);
                }
            })
            const ev = await res.wait();
            console.log(ev)
            return ev;
        }
    }

    const handleSendSetSession = async (axiom: any) => {
        try {
            const validAfter = sessionStorage.getItem("validAfter");
            const validUntil = sessionStorage.getItem("validUntil");
            const signer = await handleGetSessionSigner();
            const freeLimit = sessionStorage.getItem("freeLimit");
            const value = freeLimit ? ethers.utils.parseUnits(freeLimit, 18) : "";
            const setSessionOP = await axiom.setSession(
                signer,
                value,
                Number(validAfter),
                Number(validUntil),
                "",
                ""
            );
            await axiom.sendSetSession(setSessionOP);
        }catch (e: any) {
            console.log(e)
        }
    }

    const handleGetSessionSigner = async () => {
        const skPassword = sessionStorage.getItem("a");
        const salt = sessionStorage.getItem("b");
        const secretKey = await deriveAES256GCMSecretKey(skPassword, salt);
        const sessionKey = sessionStorage.getItem("sk");
        const decryptKey = decrypt(sessionKey, secretKey.toString("utf-8"))
        const signer = new Wallet(decryptKey);
        return signer;
    }

    const openResult = () => {
        setTransferOpen(false);
        setResultOpen(true);
        setResultName(form.send.value);
        setResultStatus("loading");
    }

    const handleSubmit = async (password: string) => {

        const value = ethers.utils.parseUnits(form.value, form.send.decimals);
        const sessionKey = sessionStorage.getItem("sk");
        const freeLimit = sessionStorage.getItem("freeLimit");
        const limit = freeLimit ? ethers.utils.parseUnits(freeLimit, 18) : "";
        const ow = sessionStorage.getItem("ow");
        let axiom: any;
        try {
            axiom = sessionKey ? await AxiomAccount.voidSmartAccout(ow) : await AxiomAccount.fromEncryptedKey(sha256(password), userInfo.transfer_salt, userInfo.enc_private_key);
        }catch (e: any) {
            const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/;
            if(string.search(expr) > 0 || string.search(expr2) > 0) {
                await wrongPassword({email});
                const times = await passwordTimes({email})
                if(times > 0) {
                    if(times < 4) {
                        setPasswordError(`Invalid password ，only ${times} attempts are allowed today!`)
                    }else {
                        setPasswordError(`Invalid password`)
                    }
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
        setResultName(form.send.value)
        setResultStatus("loading");
        try {
            let ev: any;
            const userop = sessionStorage.getItem("op")
            console.log(userop)
            if(sessionKey && userop === undefined) {
                const skPassword = sessionStorage.getItem("a");
                const salt = sessionStorage.getItem("b");
                const secretKey = await deriveAES256GCMSecretKey(skPassword, salt);
                console.log(skPassword,salt)
                const decryptKey = decrypt(sessionKey, secretKey.toString())
                const signer = new Wallet(decryptKey);
                await axiom.updateSigner(signer)
            }
            if(form.send.value === "AXC") {
                if(userop) {
                    const skPassword = sessionStorage.getItem("a");
                    const salt = sessionStorage.getItem("b");
                    const secretKey = await deriveAES256GCMSecretKey(skPassword, salt);
                    console.log(skPassword,salt)
                    const decryptKey = decrypt(sessionKey, secretKey.toString())
                    console.log(userop)
                    const sessionResult = await axiom.sendSetSession(JSON.parse(userop));
                    console.log(sessionResult)
                    if(sessionResult){
                        console.log(decryptKey, "decryptKey")
                        const signer = new Wallet(decryptKey);
                        console.log(signer)
                        axiom.updateSigner(signer).then(() => {
                            console.log(11111)
                            sessionStorage.removeItem("op")
                        }).catch((err:any) => {
                            console.log(err)
                        });
                    }else {
                        setResultStatus("failed");
                        return;
                    }
                }
                console.log(axiom)
                const callData = "0x";
                const res = await axiom.sendUserOperation(form.to, value, callData, "", "", {
                    onBuild: (op) => {
                        console.log("Signed UserOperation:", op);
                    }
                })
                console.log(res)
                ev = await res.wait();
                console.log(ev)
            }else {
                if(!sessionKey && freeLimit) {
                    await axiom.setSession(
                        sessionSigner,
                        limit,
                        validAfter,
                        validUntil,
                        window.PAYMASTER,
                        form.send.contract,
                        {}
                    );
                    const signer = new Wallet(sessionSigner.privateKey);
                    axiom.updateSigner(signer)
                    sessionStorage.setItem("sk", sessionSigner.privateKey);
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
                        onBuild: (op: any) => {
                            console.log("Signed UserOperation:", op);
                        },
                    });
                    ev = await res.wait();
                    console.log(ev)
                }else {
                    const callData = new ethers.utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [form.to, value])
                    const res = await axiom.sendUserOperation(form.send.contract, value, callData, window.PAYMASTER, form.send.contract, {
                        onBuild: (op: any) => {
                            console.log("Signed UserOperation:", op);
                        }
                    })
                    ev = await res.wait();
                    console.log(ev)
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
            setResultStatus("success")
            // setTimeout(() => {
            //     window.location.reload()
            // },3000)
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
                        <FormControl className={styles.formControl} style={{width: isChangeSend ? "auto" : "100%"}}
                                      isInvalid={sendError !== ""}>
                            <FormLabel className={styles.formTitle}>Send</FormLabel>
                            <Select
                                value={form.send}
                                options={tokenList}
                                isDisabled={!isSetPassword}
                                styles={customStyles(!isChangeSend)}
                                placeholder="Select a token"
                                components={{Option: customOption, ValueContainer: customSingleValue}}
                                onChange={handleSendChange}
                            />
                            <FormErrorMessage>{sendError}</FormErrorMessage>
                        </FormControl>
                        {isChangeSend &&
                            <FormControl className={styles.formControl} isInvalid={valueError !== ""}>
                                <FormLabel className={styles.formTitle}></FormLabel>
                                <InputGroup>
                                    <Input
                                        type={"number"}
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
                                        onBlur={handleValueBlur}
                                    />
                                    <InputRightElement style={{top: "10px", right: "20px"}}>
                                        <div className={styles.formMax} onClick={handleMax}>MAX</div>
                                    </InputRightElement>
                                </InputGroup>
                                <div>
                                    {gasLoading ? <span className={styles.formGas}><Loading /></span> : (gasFee && valueError === "") && <span className={styles.formGas}>Gas fee &asymp; {gasFee} {form.send.value}</span>}
                                    <span className={styles.formBalance}>Balance:{balance}</span>
                                </div>
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
                    <Button loading={btnLoading} onClick={confirmCallback} disabled={(isLock || form.to === "") ? true : false} onMouseEnter={() => {!isSetPassword && setButtonText('Set transfer password first')}} onMouseLeave={() => {!isSetPassword && setButtonText('Transfer')}}>{buttonText}</Button>
                </div>
                <TransferModal open={transferOpen} onSubmit={handleAXMSubmit} onClose={() => {setTransferOpen(false); handleLockTimes();}} info={transferInfo} errorMsg={passwordError} />
                <SetPayPasswordModal isOpen={passwordOpen} onClose={handlePasswordClose} />
                <TransferResultModal isOpen={resultOpen} onClose={handleResultClose} status={resultStatus} name={resultName} />
            </div>
        </>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Transfer)
