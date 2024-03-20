import styles from './index.less'
import {
    FormControl,
    FormLabel,
    Input,
} from '@chakra-ui/react';
import Select from 'react-select';
import useContinueButton from "@/hooks/ContinueButton";
import React from "react";

interface optionsProps {
    value: string;
    label: string;
    icon: React.ReactNode;
}

const options: optionsProps[] = [
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

const customOption = ({ innerProps, data }) => (
    <div {...innerProps} className={styles.formOption}>
        {data.icon}
        {data.label}
    </div>
);

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "16px 12px",
        "&:focus": {},
        "&:hover": {},
        "&:select": {},
        outline: "none",
        fontSize: "14px",
        fontFamily: "Inter",
        fontWeight: "500"
        // 添加任何其他所需的样式
    }),
    option: (provided, state) => ({
        ...provided,
        borderRadius: "20px",
        padding: "16px",
        "&:hover": {
            backgroundColor: "#EDF2F7",
        },
        backgroundColor: state.isSelected ? "#EDF2F7" : "#fff",
        color: "#292D32"
    }),
    menu: (provided, state) => ({
        ...provided,
        borderRadius: "20px",
        padding: "10px"
    }),
    indicatorSeparator: () => ({
        display: "none"
    }),

};


const Transfer = () => {
    const {Button} = useContinueButton();

    const confirmCallback = () => {

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
                        options={options}
                        styles={customStyles}
                        placeholder=""
                        components={{ Option: customOption }}
                    />
                </FormControl>
                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formTitle}>Send</FormLabel>
                    <Select
                        styles={customStyles}
                        placeholder=""
                    />
                </FormControl>
                <FormControl className={styles.formControl}>
                    <FormLabel className={styles.formTitle}>To</FormLabel>
                    <Input
                        height="56px"
                        borderRadius="12px"
                        type='email'
                    />
                </FormControl>
                <Button onClick={confirmCallback}>Transfer</Button>
            </div>
        </div>
    )
}

export default Transfer;
