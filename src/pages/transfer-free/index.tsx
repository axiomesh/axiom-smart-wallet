import styles from "./index.less"
import React, { useState } from "react";
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

export const theme = extendTheme({
    components: { Switch: switchTheme },
})

const TransferFree = () => {
    const [isSwitch, setIsSwitch] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [maxNumber, setMaxNumber] = useState(10);


    const { Button } = ContinueButton();

    const handleChange = (e: any) => {
        setIsSwitch(e.target.checked)
    }

    const handleSubmit = (e: any) => {
        console.log(e)
    }

    const handleConfirm = () => {
        setIsOpen(true)
    }

    const validate = (value: string) => {
        if (!value) {
            setErrorMessage('please enter daily transfer limit');
            return
        } else if (Number(value) > maxNumber) {
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
                <Back />
                <h1 className={styles.freeTitle}>Reset Transfer Password</h1>
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
                        <FormControl isInvalid={errorMessage !==''}>
                            <InputGroup width="420px">
                                <InputLeftAddon height="56px" padding="0 8px" borderRadius="12px 0 0 12px" style={{border: errorMessage !=='' && "1px solid #E53E3E"}}>
                                    <span className={styles.freeSettingCenterBefore}>HK$</span>
                                </InputLeftAddon>
                                <Input
                                    type='number'
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
                                />
                                <InputRightElement style={{top: "8px", right: "20px"}}>
                                    <div className={styles.freeSettingCenterMax}>MAX</div>
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage style={{marginLeft: "16px"}}>{errorMessage}</FormErrorMessage>
                        </FormControl>
                    </div>
                    <div className={styles.freeSettingBottom}>
                        <Button onClick={handleConfirm}>Confirm</Button>
                    </div>
                </div>}
                <VerifyTransferModal onSubmit={handleSubmit} isOpen={isOpen} onClose={() => {setIsOpen(false)}} />
            </div>
        </ChakraProvider>
    )
}
export default TransferFree;
