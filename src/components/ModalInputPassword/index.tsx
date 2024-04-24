import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    PinInput,
    PinInputField,
    FormControl,
    FormErrorMessage,
    useStyleConfig,
    background
} from '@chakra-ui/react';


const ModalInputPassword = (props: any) => {
    const [pinValues, setPinValues] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPinValues(["", "", "", "", "", ""])
    }, [])

    useEffect(() => {
        setError(props.isError)
    }, [props.isError])

    useEffect(() => {
        setLoading(props.isLoading)
    }, [props.isLoading])
    
    const pinChange = (value: string) => {
        props.clearError()
        if (value.length === 6) {
            props.onSubmit(value)
        }
    }


    return (
        <div className={styles.PinInput}>
            <FormControl isInvalid={error !== ""}>
                <PinInput
                    mask
                    placeholder="-"
                    focusBorderColor="#718096" 
                    isDisabled={loading}
                    onChange={pinChange}
                >
                    {pinValues.map((value: string, index:number) => (
                        <PinInputField
                            key={index}
                            value={value}
                            // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            //     handlePinChange(index, e.target.value)
                            // }
                            style={{
                                borderRight: index !== 5 ? "none" : "1px solid #E2E8F0",
                                borderRadius: index === 5 ? "0 8px 8px 0" : index === 0 ? "8px 0 0 8px" : "0",
                                borderColor: error && "#E53E3E"
                            }}
                            className={styles.PinModalPin}
                            _disabled={{
                                background: "#E2E8F0",
                                borderColor: "#EDF2F7",
                                color: "#A0AEC0"
                            }}
                        />
                    ))}
                </PinInput>
                <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
            {loading && <div className={styles.pinLoading}><i></i><span>Verifing</span></div>}
        </div>
    )

}


export default ModalInputPassword;
