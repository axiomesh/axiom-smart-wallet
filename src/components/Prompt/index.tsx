import React, {useState} from 'react'
import { history } from 'umi'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader, ModalCloseButton,
} from '@chakra-ui/react'
import ButtonPro from "@/components/Button";

type Blocker = Parameters<typeof history.block>[0]

export interface PromptProps {
    message: string
    when?: boolean
}

export default function Prompt({ message, when }: PromptProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [unlockFn, setUnlockFn] = useState({});
    const onClose = () => {
        setIsOpen(false)
    }
    // usePrompt(message, when)
    let blocker: Blocker = React.useCallback(
        () => {
            if(message){
                setIsOpen(true)
            }
        },
        [message]
    )

    React.useEffect(() => {
        let unblock = history.block((tx) => {
            if(!message || tx.location.pathname === '/login'){
                unblock()
                tx.retry()
            } else {
                let autoUnblockingTx = {
                    ...tx,
                    retry() {
                        unblock()
                        tx.retry()
                    },
                }

                setUnlockFn(autoUnblockingTx)

                blocker(autoUnblockingTx)
            }
        })

        return unblock
    }, [navigator, blocker, when, message])
    const handleContinue = () => {
        setIsOpen(false);
        // @ts-ignore
        unlockFn.retry()
    }
    return <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
            top="calc(50vh - 227px)"
            className="promot-modal" p="40px" w="500px" maxW="500px" borderRadius="32px" boxSizing="border-box">
            <ModalHeader fontSize="24px" lineHeight="36px" w="320px" fontWeight="700" pl="0px" color="#000" pt="5px" pr="0px" pb="20px">{message}</ModalHeader>
            <ModalCloseButton
                top="40px"
                right="40px"
                border="1px solid #E6E8EC"
                borderRadius="50%"
                w="46px"
                h="46px"
                onClick={onClose}
            />
            <ButtonPro onClick={handleContinue}>Continue</ButtonPro>
        </ModalContent>
    </Modal>
}
