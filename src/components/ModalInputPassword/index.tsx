import styles from "./index.less"
import React, { useState, useEffect } from 'react';
import {
    PinInput,
    PinInputField,
    FormControl,
    FormErrorMessage,
} from '@chakra-ui/react';


interface Props {
    onSubmit: (password: string) => void;
    isError: any;
}

const ModalInputPassword = (props: Props) => {
    const [pinValues, setPinValues] = useState<string[]>(["", "", "", "", "", ""]);
    const [error, setError] = useState("")

    useEffect(() => {
        setError(props.isError)
    }, [props.isError])

    const handlePinChange = (index: number, value: string) => {
        const newPinValues = [...pinValues];
        newPinValues[index] = value;
        setPinValues(newPinValues);

        if (index === newPinValues.length - 1 && value !== "") {
            props.onSubmit(newPinValues.join(""))
        }
    };


    return (
        <div className={styles.PinInput}>
            <FormControl isInvalid={error !== ""}>
                <PinInput mask placeholder="-" focusBorderColor="#718096">
                    {pinValues.map((value: string, index:number) => (
                        <PinInputField
                            key={index}
                            value={value}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                handlePinChange(index, e.target.value)
                            }
                            style={{
                                borderRight: index !== 5 ? "none" : "1px solid #E2E8F0",
                                borderRadius: index === 5 ? "0 8px 8px 0" : index === 0 ? "8px 0 0 8px" : "0",
                                borderColor: error && "#E53E3E"
                            }}
                            className={styles.PinModalPin}
                        />
                    ))}
                </PinInput>
                <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>
        </div>
    )

}


export default ModalInputPassword;
