import React from "react";
import { Alert, AlertIcon } from "@chakra-ui/alert";

interface Props {
    title: String; // 函数没有参数，没有返回值
}

const AlertPro = (props: Props) => {
    const { title } = props;
    return (
        <Alert status='warning' bg='#FEEBCB' borderRadius='8px' color='gray.700'>
            <AlertIcon color="#DD6B20" />
            {title}
        </Alert>
    )
}

export default AlertPro;
