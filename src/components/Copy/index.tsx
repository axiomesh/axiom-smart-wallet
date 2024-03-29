import { Tooltip, useClipboard, useDisclosure } from '@chakra-ui/react'
import React, { useState, useEffect } from 'react';
import { CopyIcon } from '../Icons';

export default function Copy(props: {text: string}){
    const { text, ...extra } = props;
    const { hasCopied, onCopy } = useClipboard(text, 1000);
    const [ copied, setCopied ] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        if (hasCopied) {
            setCopied(true);
        } else {
            setCopied(false);
        }
    }, [ hasCopied ]);

    return <Tooltip
        hasArrow
        fontSize="14px"
        borderRadius="4px"
        bg='gray.900'
        color='#FFFFFF'
        placement="top"
        label={ copied ? "Copied" : 'Copy' }
        isOpen={ isOpen || copied }
        {...extra}
    >
        <CopyIcon onMouseEnter={ onOpen } onMouseLeave={ onClose } onClick={ onCopy } className='base-icon'/>
    </Tooltip>
}
