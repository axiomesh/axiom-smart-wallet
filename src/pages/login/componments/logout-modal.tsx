import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
} from '@chakra-ui/react'
import ButtonPro from '@/components/Button';
import { history } from 'umi';
import {clearSessionData, getMail} from "@/utils/help";
import {getTickerPrice, logout} from "@/services/login";
import {useState} from "react";
import Toast from "@/hooks/Toast";
interface closeFunc {
    (): void;
}
export default function LogoutModal(props: {isOpen: boolean, onClose: closeFunc}) {
    const {isOpen, onClose} = props;
    const [loading, setLoading] = useState(false);
    const email: string | any = getMail();
    const {showErrorToast} = Toast();

    const handleContinue = async () => {

        try{
            setLoading(true)
            onClose();
            const deviceId: string | null = localStorage.getItem('visitorId');
            await logout(email, deviceId)
            history.replace('/login')
        } catch (e) {
            // @ts-ignore
            showErrorToast(e)
        } finally {
            setLoading(false)
        }
    }

  return (
      <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent
              className="logout-modal"
              p="40px" w="500px"
              maxW="500px"
              borderRadius="32px"
              boxSizing="border-box"
              top="calc(50vh - 227px)"
          >
              <ModalHeader fontSize="24px" lineHeight="36px" fontWeight="700" pl="0px" color="#000" pt="5px" pr="0px" pb="25px">Logout</ModalHeader>
              <ModalCloseButton
                  top="40px"
                  right="40px"
                  border="1px solid #E6E8EC"
                  borderRadius="50%"
                  w="46px"
                  h="46px"
                  onClick={onClose}
              />
              <ModalBody pl="0px" pt="0px" pr="0px" pb="20px" fontSize="14px" lineHeight="16px" color="#4B5563" fontWeight="500">
                  Please note that password-free transfer associated with this account will be disabled after logging out！
              </ModalBody>
              <ButtonPro isLoading={loading} onClick={handleContinue}>Continue</ButtonPro>
          </ModalContent>
      </Modal>
  );
}
