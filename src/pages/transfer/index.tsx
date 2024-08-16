import styles from './index.less'
import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    InputRightElement,
    InputGroup,
    Tooltip
} from '@chakra-ui/react';
import Select from 'react-select';
import useContinueButton from "@/hooks/ContinueButton";
import React, {useState, useEffect, useRef} from "react";
import {token} from "@/utils/tokenList";
import TransferModal from "@/components/TransferModal";
import SetPayPasswordModal from "@/components/SetPayPasswordModal";
import {connect, history} from "umi";
import {transaction, passwordTimes, wrongPassword, transferLockTime} from "@/services/transfer";
import {getTickerPrice} from "@/services/login";
import {getMail} from "@/utils/help";
import { ERC20_ABI } from '@/utils/abi';
import { Axiom, isoBase64URL } from 'axiomwallet';
import { Wallet, JsonRpcProvider, Contract } from "ethers";
import { formatUnits, parseUnits, formatEther, parseEther } from 'viem';
import Toast from "@/hooks/Toast";
import {sha256} from "js-sha256";
import TransferResultModal from "@/components/TransferResultModal";
import {msToTime, formatAmount, generateRandomBytes} from "@/utils/utils";
import SetBioPayModal from "@/components/setBioPayModal";
import BioResultModal from '@/components/BioResultModal';
import { startAuthentication } from '@simplewebauthn/browser';
import FirstTransferModal from '@/components/TransferModal/first'

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
    isTransfinite: boolean;
}

const customOption: React.FC<{ innerProps: any; data: any; }>  = ({ innerProps, data }) => (
    <div {...innerProps} className={`${styles.formOption} ${data.disabled ? styles.formOptionDisabled : ""}`}>
        <div className={styles.formOptionLabel}>{data.icon?data.icon:null}{data.label}</div>
        {data.balance ? <Tooltip fontSize="14px" borderRadius="4px" zIndex="9999999" hasArrow bg='gray.900' placement='top' label={data.balance}><span className={styles.formOptionBalance}>{data.balance}</span></Tooltip> : null}
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
        "&:focus": {
            borderColor: "#718096"
        },
        "&:hover": {
            borderColor: "#A0AEC0"
        },
        "&:active": {
            borderColor: "#718096"
        },
        "&:select": {},
        outline: "none",
        fontSize: "14px",
        fontFamily: "Inter",
        fontWeight: "400",
        backgroundColor: state.isDisabled ? "#E2E8F0" : "white",
        color: state.isDisabled ? "#D1D5DB" : "#292D32",
        width: isFirstSelect ? "100%" : "190px",
        boxShadow: "none"
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
    menuPortal: (base: any) => ({ ...base, zIndex: 99, width: 516 })

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
        label: "Axiomesh Gemini",
        icon: <i className={styles.iconAxm}></i>,
        disabled: false
    },
    {
        value: 1,
        label: "Ethereum Sepolia",
        icon: <i className={styles.iconEth}></i>,
        disabled: true
    }
];

const Transfer = (props: any) => {
    const { userInfo, dispatch, transferForm } = props;
    const email: string | any = getMail();
    const [isSetPassword, setIsSetPassword] = useState(true);
    const [buttonText, setButtonText] = useState("Transfer");
    const [tokenList, setTokenList] = useState<token[]>();
    const [isChangeSend, setIsChangeSend] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [firstOpen, setFirstOpen] = useState(false);
    const [bioOpen, setBioOpen] = useState(false);
    const [bioResultOpen, setBioResultOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [toErrorsText, setToErrorsText] = useState("");
    const [sendError, setSendError] = useState("");
    const [valueError, setValueError] = useState("");
    const [resultStatus, setResultStatus] = useState("");
    const [bioStatus, setBioStatus] = useState("");
    const [resultName, setResultName] = useState("");
    const [form, setForm] = useState<FormProps>(transferForm.value ? transferForm : {chain: options[0], to: "", value: "", send: null});
    const [sessionForm, setSessionForm] = useState<FormProps>();
    const {showSuccessToast, showErrorToast} = Toast();
    const [gasFee, setGasFee] = useState("");
    const [passord, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [balance, setBalance] = useState(0);
    const [transferInfo, setTransferInfo] = useState<transferProps>();
    const [lockTimes, setLockTimes] = useState('');
    const [isLock, setIsLock] = useState<number>(-1);
    const [btnLoading, setBtnLoading] = useState(false);
    const [gasLoading, setGasLoading] = useState(false);
    const [submitFlag, setSubmitFlag] = useState(false);
    const [isTransfinite, setIsTransfinite] = useState(false);
    const [info, setInfo] = useState<any>();
    const [isClicked, setIsClicked] = useState(false);
    const [pinLoading, setPinLoading] = useState(false);
    const [maxFlag, setMaxFlag] = useState(false);
    const [isMax, setIsMax] = useState(false);
    const [maxLength, setMaxLength] = useState(0);

    const {Button} = useContinueButton();
    const rpc_provider = new JsonRpcProvider(window.RPC_URL);

    let timer: any = null;
    const inputRef: any = useRef(null);

    const isFreeTransfer = () => {
        const status = sessionStorage.getItem("freeStatus")
        const timer = sessionStorage.getItem("limit_timer")
        if((status === '1' || status === '2') && timer && Number(timer) >= new Date().getTime()) {
            return true
        }
        return false
    }



    useEffect(() => {
        dispatch({
            type: 'global/setForm',
            payload: form,
        })
    }, [form])

    useEffect(() => {
        if(JSON.stringify(userInfo) !== "{}"){
            setInfo(userInfo);
            if(userInfo.pay_password_set_status === 0) {
                setIsSetPassword(false);
                setButtonText('Set transfer password first')
            }else {
                setIsSetPassword(true);
                setButtonText('Transfer')
            }
        }
    }, [userInfo])

    useEffect(() => {
        if(info) {
            const formInfo = transferForm;
            if(formInfo) {
                handleTokenOption(formInfo.chain.label)
                setSessionForm(formInfo)
            }else {
                handleTokenOption("Axiomesh");
            }
        }
    },[info])

    const handleTokenOption = async (network: string) => {
        let arr: any = [];
        for (let i: number = 0; i < token.length; i++) {
            if(network.includes(token[i].network)) {
                const balance = await initBalance(token[i].name);
                arr.push({
                    value: token[i].name,
                    label: token[i].name,
                    decimals: token[i].decimals,
                    contract: token[i].contract,
                    symbol: token[i].symbol,
                    balance: formatAmount(balance.toString()),
                    amount: balance,
                    icon: <img style={{width: "40px", height: "40px"}} src={require(`@/assets/token/${token[i].name}.png`)} />
                })
            }
        }
        arr.sort((a: any, b: any) => b.amount - a.amount);

        setTokenList(arr)
    }


    const countdown = (milliseconds: number) => {
        setLockTimes(msToTime(milliseconds))
        timer = setInterval(() => {
            milliseconds -= 1000;
            if (milliseconds < 0) {
                clearInterval(timer);
                setLockTimes("");
                setIsLock(-1);
            } else {
                setLockTimes(msToTime(milliseconds))
            }
        }, 1000)
    }

    const handleLockTimes = async () => {
        setBtnLoading(true);
        const times = await transferLockTime({email});
        setBtnLoading(false);
        // 0
        if(times.time_left){
            if(times?.lock_type === 0) {
                setIsLock(0);
                countdown(times.time_left)
            }else if(times?.lock_type === 1) {
                setIsLock(1);
            }else {
                setIsLock(-1);
            }
        }
    };

    useEffect(() => {
        handleLockTimes();
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
                const sendFilter = token.filter((item: any) => item.symbol === sessionForm.send.symbol);
                let arr: any = [];
                newForm.send = sessionForm.send;
                initBalance(newForm.send.value).then((balance: any) => {
                    setBalance(formatAmount(balance.toString()))
                });
                setIsChangeSend(true);
            }
            if(sessionForm.value) {
                newForm.value = sessionForm.value;
                const sendValue = sessionForm.value.replace(/,/g, "")
                getGas(sendValue, sessionForm.send).then((res: any) => {
                    setGasFee(res);
                })
            }
            sessionForm.to && (newForm.to = sessionForm.to);
            setForm(newForm)
        }
    }, [sessionForm])

    const handleValueBlur = async () => {
        if(form.value === "") {
            setValueError("");
            return;
        }
        const sendValue = form.value.replace(/,/g, "");
        const addressBalance = balance.replace(/,/g, "");
        if(Number(sendValue) > Number(addressBalance)) {
            setValueError("Insufficient balance");
            return;
        }
        if(sendValue && Number(sendValue) > 0) {
            setGasLoading(true);
            setValueError("");
            getGas(sendValue, form.send).then((res: any) => {
                setGasLoading(false);
                setGasFee(res);
                if((Number(res) + Number(sendValue)) > Number(addressBalance)) {
                    setValueError("Gas fee is insufficient");
                }
            })
        }else {
            setValueError("Invalid balance");
        }
    }

    const getGas = async (amount: string, send: any) => {
        const signer = Axiom.Utility.generateSigner();
        const axiom = await Axiom.Wallet.AxiomWallet.voidAxiomWallet();
        const decimals = await getDecimals();
        const value = parseUnits(amount, decimals)
        if(send.value === "AXC") {
            const res = await axiom.estimateTransfer(signer.address, value)
            const axcGas: any = formatEther(res);
            return axcGas;
        }else {
            const res = await axiom.estimateErc20Transfer(send.contract, signer.address, value)
            const axcGas: any = formatEther(res);
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
            const gas = (axcPrice / price) * axcGas;
            const number = Number(gas);
            const roundedNum = Math.ceil(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
            const roundedNumber = roundedNum.toFixed(decimals);
            return roundedNumber;
        }
    }

    const initBalance = async (type:string | any) => {
        // @ts-ignore
        const provider = new JsonRpcProvider(window.ETH_RPC);
        if(type === 'AXC'){
            const balance = await rpc_provider.getBalance(info.address);
            // const balance = await rpc_provider.getBalance(address);
            // @ts-ignore
            // return balance.toBigInt().toString() / Math.pow(10, window.AXC_SYMBOL)
            return formatUnits(balance, window.AXC_SYMBOL)
        } else {
            const allList = token;
            const filterData = allList.filter((item: token) => item.name === type)[0];
            const currentProvider = filterData.name === 'ETH' ? provider : rpc_provider;
            // return 0
            const erc20 = new Contract(filterData.contract, ERC20_ABI, currentProvider);
            const balance = await erc20?.balanceOf(userInfo.address);
            const decimals = await erc20.decimals();
            const formatUnitsDe = formatUnits(decimals, 0);

            const balanceStr = formatUnits(balance,Number(formatUnitsDe))
            // @ts-ignore
            return balanceStr;
        }
    }

    const handleVerifyLimit = async () => {
        const sessionSigner = await getSessionSigner();
        const axiom = await Axiom.Wallet.AxiomWallet.fromSessionKey(sessionSigner, userInfo.address);
        const decimals = await getDecimals();
        const sendValue = form.value.replace(/,/g, "")
        const value = parseUnits(sendValue, decimals);
        try{
            if(form.send.value === "AXC") {
                const res = await axiom.checkTransferLimit(form.to, value);
                return res;
            }else {
                const res = await axiom.checkTransferErc20Limit(form.send.contract, form.to, value);
                return res;
            }
        } catch (e){
            return false
        }
    }


    const confirmCallback = async () => {
        setIsClicked(true);
        setTimeout(() => {
          setIsClicked(false);
        }, 3000);
        if (isClicked) {
            return;
        }
        if(btnLoading)
            return;
        if(isLock >= 0)
            return;
        setBtnLoading(true)
        if(isSetPassword) {
            if(!form.send){
                setSendError("Please Select a token!");
                setBtnLoading(false);
                return;
            }
            if(form.value === "") {
                setValueError("Invalid balance!");
                setBtnLoading(false);
                return;
            }
            if(form.to === "") {
                setToErrorsText("Invalid address !");
                setBtnLoading(false);
                return;
            }
            let sendValue:string = form.value.replace(/,/g, "");
            const addressBalance = balance.replace(/,/g, "")
            if(valueError !== "") {
                setBtnLoading(false);
                return;
            }
            if(Number(sendValue) > Number(addressBalance)) {
                setValueError("Insufficient balance");
                setBtnLoading(false);
                return;
            }
            if(form.to === userInfo.address){
                setToErrorsText("Invalid address !");
                setBtnLoading(false);
                return;
            }
            const times = await transferLockTime({email});
            if(times.time_left){
                if(times?.lock_type === 0) {
                    setIsLock(0);
                    countdown(times.time_left);
                    setBtnLoading(false);
                    return;
                }else if(times?.lock_type === 1) {
                    setIsLock(1);
                    setBtnLoading(false);
                    return;
                }else {
                    setIsLock(-1);
                }
            }

            const gas = await getGas(sendValue, form.send);
            if(isMax) {
                const max: string | undefined = await hanldeGetMax();
                if(max) {
                    sendValue = max;
                }else {
                    return;
                }
            }else {
                if((Number(gas) + Number(sendValue)) > Number(addressBalance)) {
                    setValueError("Gas fee is insufficient");
                    setBtnLoading(false)
                    return;
                }
            }
            try {
                const signer = Axiom.Utility.generateSigner();
                signer.getAddress(form.to);
                setToErrorsText("");
            }catch (e: any) {
                setToErrorsText("Invalid address !");
                setBtnLoading(false);
                return;
            }
            if(toErrorsText !== "") {
                setBtnLoading(false);
                return;
            }
            if(!sendValue || Number(sendValue) <= 0){
                setValueError("Invalid balance");
                setBtnLoading(false);
                return;
            }
            const priceList = await getTickerPrice();
            let price: number = 0;
            priceList.map((item: any) => {
                if(item.symbol.toLowerCase() === form.send.symbol.toLowerCase()) {
                    price = item.price * gas;
                }
            })
            let isLimit: boolean = false;
            const status = sessionStorage.getItem("freeStatus")
            const timer = sessionStorage.getItem("limit_timer");
            const sessionKey = sessionStorage.getItem("sk");
            if(sessionKey && status === '2') {
                isLimit = await handleVerifyLimit();
            }
            console.log('isLimit', isLimit)
            setIsTransfinite(isLimit)

            setTransferInfo({
                send: form.send.value,
                to: form.to,
                blockchain: form.chain.label,
                value: sendValue,
                gas: gas,
                gasPrice: price,
                isTransfinite: isLimit
            })

            if(status === '1' && timer && Number(timer) >= new Date().getTime()) {
                setFirstOpen(true)
            } else {
                setTransferOpen(true)
            }
        }else {
            setPasswordOpen(true)
        }
    }

    const validateName = (e: any) => {
        const value = e.target.value;
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        const isValid = ethAddressRegex.test(value);
        if(value === "") {
            setToErrorsText("");
            return;
        }
        if(!isValid) {
            setToErrorsText("Invalid address !")
        }else {
            setToErrorsText("")
        }
    }

    const handleFromChange = async (e: any) => {
        if(e.disabled) {
            showErrorToast("Coming soon");
            return;
        }
        setForm({...form, chain: e, send: null})
        setIsChangeSend(false)
        handleTokenOption(e.label)
    }

    const handleSendChange = async (e: any) => {
        setValueError("");
        setGasFee("");
        setForm({...form, send: e, value: ""});
        const balance = await initBalance(e.value);
        setBalance(formatAmount(balance.toString()));
        let decimals: any;
        if(e.value === "AXC") {
            decimals = 18;
        }else {
            const contract = new Contract(e.contract, ERC20_ABI, rpc_provider);
            decimals = await contract.decimals();
        }
        setMaxLength(decimals);
        setSendError("");
        setIsChangeSend(true);
    }

    const handlePasswordClose = (isSuccess: Boolean, password: string) => {
        setBtnLoading(false);
        if(isSuccess) {
            setIsSetPassword(true);
            setButtonText('Transfer');
            setBioOpen(true);
            setPassword(password)
        }
        setPasswordOpen(false)
    }

    const getDecimalPlaces = (value: string): number => {
        const parts = value.split(".");
        if (parts.length === 2) {
            return parts[1].length;
        } else {
            return 0; // 如果没有小数点，则返回 0
        }
    }

    const handleValueChange = async (e: any) => {
        let inputValue = e.target.value;
        const { selectionStart, value} = e.target;

        if(inputValue) {
            inputValue = formatAmount(inputValue.replace(/,/g, ""));
        }
        const cursorPosition = selectionStart + (inputValue.length - value.length);
        const decimal = getDecimalPlaces(inputValue);
        if(/^[0-9,.]*$/.test(inputValue) && decimal <= maxLength){
            setForm({ ...form, value: inputValue })
        }
        setTimeout(() => {
            if (inputRef.current) {
              inputRef?.current?.setSelectionRange(cursorPosition, cursorPosition);
            }
          }, 0);
    }

    const handleKeyDown = (e: any) => {
        setIsMax(false);
        if(e.key === "e") e.preventDefault();
        if(e.key=="-") e.preventDefault();
    }

    const getDecimals = async () => {
        if(form?.send?.value){
            let decimals: any;
            if(form.send.value === "AXC") {
                decimals = 18;
            }else {
                const contract = new Contract(form.send.contract, ERC20_ABI, rpc_provider);
                // decimals = await contract.decimals();
                const contractDecimals = await contract.decimals();
                const formatUnitsDe = formatUnits(contractDecimals, 0);
                decimals = Number(formatUnitsDe);
            }

            return decimals;
        }
        return 18;
    }

    const hanldeGetMax = async () => {
        const bal = balance.toString().replace(/,/g, "")
        const gas = await getGas(bal, form.send);
        setGasFee(gas)
        const decimals = await getDecimals();
        const gasNumber = parseUnits(gas.toString(), decimals);
        const balanceNumber = parseUnits(bal, decimals);
        const max = formatUnits(balanceNumber - gasNumber, decimals);
        if(Number(max) < 0) {
            setValueError("Gas fee is insufficient");
            setMaxFlag(false);
            setGasLoading(false);
            return;
        }
        return max;
    }

    const handleMax = async () => {
        if(maxFlag) return;
        setMaxFlag(true);
        setGasLoading(true);
        setValueError("");
        const max = await hanldeGetMax();
        setMaxFlag(false);
        setGasLoading(false);
        setIsMax(true);
        if(max) {
            setForm({ ...form, value: max.toString() })
        }else {
            return;
        }
    }

    const handleToChange = async (e: any) => {
        let value = e.target.value;
        if (/[^0-9a-zA-Z]/.test(value)) value = value.replace(/[^0-9a-zA-Z]/g, '');
        setForm({...form, to: value});
    }

    const handleResultClose = () => {
        setSubmitFlag(false);
        setResultOpen(false);
        setBtnLoading(false);
        window.location.reload();
    }

    const getErc20Option = (option, axiom) => {
        if(option){
            return {
                ...option,
                passkey: {
                    onRequestPasskey: async (useropHash: any) => {
                        const res =  await bioPayUserOp(useropHash, axiom);
                        return res
                    }
                }
            }
        }

        return {
            passkey: {
                onRequestPasskey: async (useropHash: any) => {
                    const res =  await bioPayUserOp(useropHash, axiom);
                    return res
                }
            }
        }

    }

    const handleBioPay = async (option?: any, signer?: any) => {
        setBioResultOpen(true);
        setFirstOpen(false)
        setTransferOpen(false)
        setBioStatus("loading");
        const axiom = await Axiom.Wallet.AxiomWallet.fromPasskey(userInfo.address);
        let hash:any;
        const decimals = await getDecimals();
        const sendValue = form.value.replace(/,/g, "")
        const value = parseUnits(sendValue, decimals);
        try {
            if(form.send.value === "AXC") {
                hash = await axiom.transfer(form.to, value, getErc20Option(option,axiom));
            } else {
                hash = await axiom.transferErc20(form.send.contract, form.to, value, getErc20Option(option,axiom));
            }
            if(!hash) {
                setResultStatus("failed");
                return;
            }
            await transaction({
                email,
                transaction_hash: hash,
                value: form.value,
                chain_type: Number(form.chain.value),
                token_name: form.send.value,
                to_address: form.to,
            })
            setSubmitFlag(false);
            sessionStorage.removeItem("form");
            if(sessionStorage.getItem("freeStatus") === '1') {
                sessionStorage.setItem("freeStatus", '2')
            }
            if(signer){
                await setSessionSigner(signer);
            }
            setResultStatus("success");
        }catch(err: any) {
            const string = err.toString(), expr = /Cannot destructure property 'response'/;
            console.log('743', err)
            if(string.search(expr) > 0) {
                setBioStatus("cancel");
            }else {
                setResultStatus("failed");
                setBioStatus("failed");
            }
        }
    }


    const bioPayUserOp = async (useropHash) => {
        const allowCredentials = localStorage.getItem("allowCredentials");
        const obj: any = {
            challenge: isoBase64URL.fromBuffer(useropHash),
            rpId: window.RPID,
            allowCredentials: [{
                "id": allowCredentials,
                "type": "public-key",
                "transports": ["internal"]
            }],
            userVerification: "required"
        }
        let auth: any;
        try {
            auth =  await startAuthentication(obj);
            setBioStatus("success");
            openResult();
        }catch(error: any) {
            const string = error.toString(), expr = /The operation either timed out or was not allowed/;
            if(string.search(expr) > 0) {
                setBioStatus("cancel");
            }else {
                setBioStatus("failed");
            }
            return "cancel"
        }
        return {
            response: auth,
            expectedChallenge: "",
            expectedOrigin: ""
        }
    }

    const handleAXMSubmit = async (password: string, option: any, signer: any) => {
        if(submitFlag)
            return;
        setSubmitFlag(true);
        setPinLoading(true);
        setPasswordError("");
        // @ts-ignore
        const decimals = await getDecimals();
        const sendValue = form.value.replace(/,/g, "")
        const value = parseUnits(sendValue, decimals);
        let axiom: any, ev: any;
        if(isFreeTransfer() && !password) {
            if(signer){
                axiom = await Axiom.Wallet.AxiomWallet.fromSessionKey(signer, userInfo.address);
            } else {
                const sessionSigner = await getSessionSigner();
                axiom = await Axiom.Wallet.AxiomWallet.fromSessionKey(sessionSigner, userInfo.address);
            }
        }else {

            try {
                axiom = await  Axiom.Wallet.AxiomWallet.fromEncryptedKey(sha256(password), userInfo.transfer_salt, userInfo.enc_private_key, userInfo.address)
            }catch (e: any) {
                setPinLoading(false);
                setSubmitFlag(false);
                const string = e.toString(), expr = /invalid hexlify value/, expr2 = /Malformed UTF-8 data/, expr3 = /invalid private key/;
                if(string.search(expr) > 0 || string.search(expr2) > 0 || string.search(expr3) > 0) {
                    wrongPassword({email}).then(async () => {
                        const times = await passwordTimes({email});
                        if(times > 0) {
                            if(times < 4) {
                                setPasswordError(`Invalid password ，only ${times} attempts are allowed today!`)
                            }else {
                                setPasswordError(`Invalid password`)
                            }
                        }else {
                            setPasswordError("Invalid password ，your account is currently locked. Please try again tomorrow !")
                        }
                    }).catch((err: any) => {
                        setPasswordError(err)
                    })
                }
                return;
            }
        }

        openResult();
        let hash: any;

        try {

            if(option){
                if(form.send.value === "AXC") {
                    hash = await axiom.transfer(form.to, value, option);
                } else {
                    hash = await axiom.transferErc20(form.send.contract, form.to, value, option);
                }
            } else {
                if(form.send.value === "AXC") {
                    hash = await axiom.transfer(form.to, value);
                } else {
                    hash = await axiom.transferErc20(form.send.contract, form.to, value);
                }
            }

            if(!hash) {
                setResultStatus("failed");
                return;
            }

            await transaction({
                email,
                transaction_hash: hash,
                value: form.value,
                chain_type: Number(form.chain.value),
                token_name: form.send.value,
                to_address: form.to,
            })
            setPinLoading(false);

            if(signer){
                await setSessionSigner(signer);
            }

            if(sessionStorage.getItem("freeStatus") === '1') {
                sessionStorage.setItem("freeStatus", '2')
            }


            setSubmitFlag(false);
            sessionStorage.removeItem("form");
            setResultStatus("success");
        }catch (e: any) {
            console.log('884', e)
            setResultStatus("failed");
            setPinLoading(false);
            return;
        }

    }

    const handleTransferClose = async () => {
        setFirstOpen(false);
        setTransferOpen(false);
        setBtnLoading(false);
        setPinLoading(false);
        setGasLoading(true);
        await handleLockTimes();
        const sendValue = form.value.replace(/,/g, "");
        const addressBalance = balance.replace(/,/g, "");
        getGas(sendValue, form.send).then((res: any) => {
            setGasLoading(false);
            setGasFee(res);
            if((Number(res) + Number(sendValue)) > Number(addressBalance)) {
                setValueError("Gas fee is insufficient");
            }
        })
    }

    const generateRandomSixDigits = () => {
        const min = 100000; // 最小值为 100000
        const max = 999999; // 最大值为 999999
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const setSessionSigner = async (sessionSigner) => {
        const skPassword = generateRandomSixDigits().toString();
        const salt = generateRandomBytes(16);
        const secretKey = await Axiom.Utility.deriveAES256GCMSecretKey(sha256(skPassword), salt);
        const encryptKey = Axiom.Utility.encrypt(sessionSigner.privateKey, secretKey.toString());

        sessionStorage.setItem("a", sha256(skPassword));
        sessionStorage.setItem("b", salt);
        sessionStorage.setItem("sk", encryptKey);
    }

    const getSessionSigner = async () => {
        const skPassword = sessionStorage.getItem("a");
        const salt = sessionStorage.getItem("b");
        const secretKey = await Axiom.Utility.deriveAES256GCMSecretKey(skPassword, salt);
        const sessionKey = sessionStorage.getItem("sk");
        const decryptKey = Axiom.Utility.decrypt(sessionKey, secretKey.toString("utf-8"))
        const signer = new Wallet(decryptKey);
        return signer;
    }

    const handleFirstTransfer = async (password) => {
        // 上链
        const signer = Axiom.Utility.generateSigner();
        const spendingLimit = sessionStorage.getItem('freeLimit');
        const validAfter = sessionStorage.getItem('validAfter');
        const validUntil = sessionStorage.getItem('limit_timer');
        const address = await  signer.getAddress();
        await handleAXMSubmit(password, {
            passwordless:{
                signer: address,
                spendingLimit: parseEther(spendingLimit),
                validAfter:  Math.floor(Number(validAfter) / 1000),
                validUntil: Math.floor(Number(validUntil) / 1000),
            }
        }, signer);
    }

    const handleFirstBioTransfer = async () => {
        // 上链
        const signer = Axiom.Utility.generateSigner();
        const spendingLimit = sessionStorage.getItem('freeLimit');
        const validAfter = sessionStorage.getItem('validAfter');
        const validUntil = sessionStorage.getItem('limit_timer');
        const address = await  signer.getAddress();

        await handleBioPay({
            passwordless:{
                signer: address,
                spendingLimit: parseEther(spendingLimit),
                validAfter:  Math.floor(Number(validAfter) / 1000),
                validUntil: Math.floor(Number(validUntil) / 1000),
             }
        }, signer);
    }

    const handleBioStatusClose = async () => {
        setBioResultOpen(false);
        setBtnLoading(false);
        setGasLoading(true);
        await handleLockTimes();
        if(isMax) {
            const max: string | undefined = await hanldeGetMax();
            if(max) {
                setForm({ ...form, value: max.toString() })
            }else {
                return;
            }
        }
        const sendValue = form.value.replace(/,/g, "");
        const addressBalance = balance.replace(/,/g, "");
        getGas(sendValue, form.send).then((res: any) => {
            setGasLoading(false);
            setGasFee(res);
            if((Number(res) + Number(sendValue)) > Number(addressBalance)) {
                setValueError("Gas fee is insufficient");
            }
        })
    }

    const openResult = () => {
        const status = sessionStorage.getItem("freeStatus")
        const timer = sessionStorage.getItem("limit_timer")
        if(status === '1' && timer && Number(Number(timer) >= new Date().getTime())){
            setFirstOpen(false)
        } else {
            setTransferOpen(false)
        }
        setResultOpen(true);
        setResultName(form.send.value);
        setResultStatus("loading");
    }


    return (
        <>
            {isLock === 0 && <div className={styles.toast}><img src={require("@/assets/transfer/free-toast.png")} alt=""/><span>Your account has been frozen for 24 hours and transactions cannot be sent normally. {lockTimes}</span></div>}
            {isLock === 1 && <div className={styles.toast}><img src={require("@/assets/transfer/free-toast.png")} alt=""/><span>Your account is currently locked. Please try again tomorrow !</span></div>}
            {isSetPassword ? <div className={styles.transfer}>
                <div className={styles.transferTitle}>
                    <h1>Transfer</h1>
                    <div className={styles.transferHistory} onClick={() => history.push('/transfer-history')}>
                        <i className={styles.transferHistory}></i>
                        <span>History</span>
                    </div>
                </div>
                <div className={styles.transferContent}>
                    <FormControl className={styles.formControl}>
                        <FormLabel className={styles.formTitle}>From</FormLabel>
                        <Select
                            isSearchable={false}
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
                                isSearchable={false}
                                value={form.send}
                                options={tokenList}
                                isDisabled={!isSetPassword}
                                styles={customStyles(!isChangeSend)}
                                placeholder="Select a token"
                                components={{Option: customOption, ValueContainer: customSingleValue}}
                                onChange={handleSendChange}
                                menuPortalTarget={document.body}
                            />
                            <FormErrorMessage>{sendError}</FormErrorMessage>
                        </FormControl>
                        {isChangeSend &&
                            <FormControl className={styles.formControl} isInvalid={valueError !== ""}>
                                <FormLabel className={styles.formTitle}></FormLabel>
                                <InputGroup>
                                    <Input
                                        ref={inputRef}
                                        value={form.value}
                                        isDisabled={!isSetPassword}
                                        fontSize="14px"
                                        fontWeight="400"
                                        color="gray.700"
                                        height="56px"
                                        borderRadius="12px"
                                        placeholder='0.0'
                                        _disabled={{
                                            color: "#D1D5DB",
                                            bg: "gray.200", // 修改禁用状态的背景色
                                            cursor: "not-allowed" // 修改禁用状态的鼠标样式
                                        }}
                                        _placeholder={{
                                            color: "#A0AEC0"
                                        }}
                                        _hover={{
                                            borderColor: "#A0AEC0"
                                        }}
                                        _focusVisible={{
                                            borderColor: "#718096"
                                        }}
                                        _active={{
                                            borderColor: "#718096"
                                        }}
                                        onChange={handleValueChange}
                                        onBlur={handleValueBlur}
                                        onKeyDown={handleKeyDown}
                                        style={{
                                            boxShadow: "none"
                                        }}
                                        spellCheck={false}
                                        autoCapitalize="off"
                                        autoComplete='off'
                                    />
                                    <InputRightElement style={{top: "8.5px", right: "20px"}}>
                                        <div className={styles.formMax} onClick={handleMax}>MAX</div>
                                    </InputRightElement>
                                </InputGroup>
                                <div>
                                    {gasLoading ? <span className={styles.formGas}><Loading /></span> : (gasFee && valueError === "") && <span className={styles.formGas}>Gas fee &asymp; {gasFee} {form.send?.value}</span>}
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
                            pattern="^[^\u4e00-\u9fa5]*$"
                            _hover={{
                                borderColor: "#A0AEC0"
                            }}
                            _active={{
                                borderColor: "#718096"
                            }}
                            _focusVisible={{
                                borderColor: "#718096"
                            }}
                            style={{
                                boxShadow: "none"
                            }}
                            spellCheck={false}
                            autoCapitalize="off"
                            autoComplete='off'
                        />
                        <FormErrorMessage>{toErrorsText}</FormErrorMessage>
                    </FormControl>
                    <Button loading={btnLoading} onClick={confirmCallback} disabled={(isLock >= 0 || (form.to === "" && isSetPassword) || gasLoading) ? true : false} >{buttonText}</Button>
                </div>
            </div> :
            <div className={styles.noPassword}>
                <img style={{width: "800px"}} src={require('@/assets/transfer/set-transfer-bg.png')} alt="" />
                <p className={styles.noPasswordTitle}>Transfer to any address on Axiomesh & Ethereum</p>
                <p className={styles.noPasswordDesc}>Set a transfer password to use</p>
                <div style={{width: "320px", margin: "0 auto"}}><Button loading={btnLoading} onClick={confirmCallback} disabled={(isLock >= 0 || (form.to === "" && isSetPassword)) ? true : false} >Set transfer password first <i className={styles.noPasswordIcon}></i></Button></div>
            </div>
            }
            <FirstTransferModal
                open={firstOpen}
                onBioPay={handleFirstBioTransfer}
                pinLoading={pinLoading}
                onSubmit={handleFirstTransfer}
                onClose={handleTransferClose}
                info={transferInfo}
                errorMsg={passwordError}
                clearError={() => {setPasswordError("")}}
            />
            <TransferModal
                open={transferOpen}
                onBioPay={handleBioPay}
                pinLoading={pinLoading}
                onSubmit={handleAXMSubmit}
                onClose={handleTransferClose}
                info={transferInfo}
                errorMsg={passwordError}
                clearError={() => {setPasswordError("")}}
            />
            <SetPayPasswordModal isOpen={passwordOpen} onClose={handlePasswordClose} />
            <TransferResultModal isOpen={resultOpen} onClose={handleResultClose} status={resultStatus} name={resultName} />
            <SetBioPayModal
                isOpen={bioOpen}
                onClose={() => {setBioOpen(false)}} password={passord} />
            <BioResultModal status={bioStatus} isOpen={bioResultOpen} onClose={handleBioStatusClose} />
        </>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
    transferForm: global.transferForm
}))(Transfer)
