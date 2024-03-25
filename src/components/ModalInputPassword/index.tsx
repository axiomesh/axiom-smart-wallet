import styles from "./index.less"
import React, { useState } from 'react';
import {
    PinInput,
    PinInputField,
} from '@chakra-ui/react';

const ModalInputPassword = () => {
    const [pinValues, setPinValues] = useState<string[]>(["", "", "", "", "", ""]);

    const handlePinChange = (index: number, value: string) => {
        const newPinValues = [...pinValues];
        newPinValues[index] = value;
        setPinValues(newPinValues);

        if (index === newPinValues.length - 1 && value !== "") {
            handleSubmit();
        }
    };

    const handleSubmit = () => {

    }

    return (
        <div className={styles.PinInput}>
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
                            borderRadius: index === 5 ? "0 8px 8px 0" : index === 0 ? "8px 0 0 8px" : "0"
                        }}
                        className={styles.PinModalPin}
                    />
                ))}
            </PinInput>
        </div>
    )

}


export default ModalInputPassword;
