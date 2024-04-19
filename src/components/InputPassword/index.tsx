import styles from './index.less'
import React, {useState, useEffect} from 'react';
import { Spinner } from '@chakra-ui/react';
import ButtonPro from "@/components/Button";
const reg = /^[0-9]*$/;

interface verifyFunc {
    (code: string): void;
}

interface sendFunc {
    (): void;
}

interface setFunc {
    (isError: boolean): void;
}
const InputPassword = (props:{ type: string, loading: boolean, timer?: string, isError: boolean, onSend:sendFunc, onVerify:verifyFunc, setIsError: setFunc, needTimer?: boolean }) => {
    const { type, loading, timer, isError, onSend, onVerify, setIsError, needTimer} = props;
    const [value, setValue] = useState(["-", "-","-","-","-","-"]);
    const [activeIndex, setActiveIndex] = useState(0);
    // 处理一些键盘特殊按键，清除默认行为
    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index:number):void => {
        if (e.key === 'Backspace') {
            setIsError(false)
            const newValue = [...value];
            // @ts-ignore
            if(e.target.value === '-' || e.target.value === '' || index === 5){
                if(index === 5){
                    // @ts-ignore
                    if(e.target.value === '-' || e.target.value === ''){
                        newValue[index] = '-';
                        newValue[index - 1] = '';
                        setValue(newValue);
                        // @ts-ignore
                        const prevInput = e.target.previousElementSibling;
                        if (prevInput && index > 0) {
                            prevInput.focus();
                        }
                    } else {
                        newValue[index] = '-';
                        setValue(newValue);
                    }

                    // e.target.focus();
                }else {
                    if(index){
                        newValue[index] = '-';
                        newValue[index - 1] = '';
                    } else {
                        newValue[index] = '';
                    }
                    setValue(newValue);
                    // @ts-ignore
                    const prevInput = e.target.previousElementSibling;
                    if (prevInput && index > 0) {
                        prevInput.focus();
                    }
                }
            } else {
                newValue[index] = '';
                const numbersString = newValue.join('');
                const numbersArray = [...numbersString].map(digit => digit=== '' || digit==='-' ? '-' : parseInt(digit, 10))
                const list = numbersArray.concat(Array(6 - (numbersArray.length)).fill('-'))
                // @ts-ignore
                setValue(list);
            }

        } else if(reg.test(e.key)){
            const newValue = [...value];
            newValue[index] = e.key;
            if(index < 5){
                newValue[index + 1] = '';
            } else {
                onVerify(newValue.join(''));
            }
            setValue(newValue);
            // @ts-ignore
            const nextInput = e.target.nextElementSibling;
            if(nextInput){
                nextInput.focus();
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index:number) => {
        e.preventDefault();
        e.stopPropagation();
        // @ts-ignore
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text').trim();

        const codes = reg.test(pastedText) ? pastedText.substring(0, 6).split('') : '';
        let newValue = [...value].splice(0, index).concat(codes);
        let last = [];
        if(newValue.length < 6){ // 123   12345 123456
            last = [...newValue, ''].concat(Array(6 - (newValue.length +1)).fill('-'))
            setValue(last);
            // @ts-ignore
            document.getElementById(`passwordInput${newValue.length}`).focus()
        } else {
            last = newValue.splice(0, 6);
            // @ts-ignore
            document.getElementById('passwordInput5').focus()
            setValue(last);
            onVerify(last.join(''));
        }
    }

    useEffect(() => {
        if(document.getElementById('passwordInput0')){
            // @ts-ignore
            document.getElementById('passwordInput0').focus();

        }
    }, []);

    const handleFocus = (index: number, preVue: string) => {
        if(index ===0 || preVue !== '-') {
            setActiveIndex(index)
        }
    }

    const handleBlur = () => {
        setActiveIndex(-1)
    }

    const getValue = (index: number) => {
        if(activeIndex === -1){
            if(!value[index]) return '-'
            return  value[index]
        } else {
            if(index === activeIndex && value[index] === '-') return ''
            return value[index]
        }
    }

    const handleIsReadOnly = (index: number) => {
       return index !== activeIndex && ((value[index]==='-') || (value[index]===''))
    }


    return (
        <div className={styles.container}>
            <div className={styles.inputContainer}>
                {value.map((_, index) => {
                    return (
                        <input
                            type={type}
                            id={`passwordInput${index}`}
                            className={loading ? styles.disabledInput : isError ? styles.errorInput : handleIsReadOnly(index) ? styles.readonlyInput : styles.pinInput}
                            // className={index < isReadOnly.length ? styles.pinInput : styles.readonlyInput}
                            key={index}
                            maxLength={1}
                            readOnly={handleIsReadOnly(index)}
                            value={handleIsReadOnly(index) ? '-' : getValue(index)}
                            onKeyDown={(e) => handleOnKeyDown(e,index)}
                            onPaste={(e) => handlePaste(e,index)}
                            onContextMenu={(e) => e.preventDefault()}
                            onBlur={handleBlur}
                            onFocus={() => handleFocus(index, index ? getValue(index -1 ) : getValue(0 ))}
                            disabled={loading}
                            autoComplete='off'
                        />
                    );
                })}
            </div>
            {loading ?  <div className={styles.loading}><Spinner size='xs' /><span>Verifing</span></div>: null}
            {isError ?  <div className={styles.error}>Verification code error, please try again.</div>: null}
             {needTimer ? timer ? <div className={styles.timer}>({timer})</div> : <div className={styles.timer}>
                <span>Not received an email? </span>
                <a className='a_link' onClick={onSend}>Resent</a>
            </div> : <ButtonPro mt="20px" w="320px" isDisabled={timer !== '' || loading} onClick={onSend}>
                 {timer ? timer : 'Resend'}
             </ButtonPro>}
        </div>
    )
}

export default InputPassword;
