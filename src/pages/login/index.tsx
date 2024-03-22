import styles from './index.less';
import logo from '@/assets/axiom.svg'
import InputPro from '@/components/Input';
import ButtonPro from '@/components/Button'
import {
    FormControl,
    FormErrorMessage,
    Checkbox,
    useToast
} from '@chakra-ui/react';
import { history } from 'umi';
import {useState} from "react";
import Right from './componments/right';

export default function HomePage() {
    const toast = useToast();
    const [errorText, setErrorText] = useState('');
    const [isCheck, setIsCheck] = useState(false);
    const [mail, setMail] = useState(false);

    const handleSubmit = () => {
        if(errorText) return;
        if(!isCheck){
            toast({
                position: 'top',
                title: 'Please agree to the user agreement',
                status: 'error',
                containerStyle:{bg: 'red.400', borderRadius: 20},
                duration: 1500,
            })
            return
        }

        //调用接口 type为 新成员，老成员
        history.push(`/verify-code?email=${mail}&type=0`);
    }
    const validateName = (value: string) => {
        const reg =  /^\w+@([\da-z\.-]+)\.([a-z]+|[\u2E80-\u9FFF]+)$/;
        if (!value) {
            setErrorText('Please enter your email address');
            return
        } else if (!reg.test(value)) {
            setErrorText("Invalid email address");
            return
        }
        setErrorText("");
    }

    const handleBlur = (e: any) => {
        const { value } = e.target;
        validateName(value);
        setMail(value);
    }
  return (
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <img src={logo} alt="logo"/>
                    <div className={styles.title}>Axiomesh Smart Account</div>
                    <div className={styles.desc} style={{marginTop: 8, marginBottom: 32}}>
                        Get started with your email address
                    </div>
                    <div>
                        {/*<InputPro placeholder='Enter your email address' style={{height: 56}} />*/}
                        <FormControl isInvalid={errorText !==''}>
                            <InputPro
                                placeholder='Enter your email address'
                                style={{height: 56}}
                                onBlur={handleBlur}
                            />
                            <FormErrorMessage>{errorText}</FormErrorMessage>
                        </FormControl>
                        <FormControl mt="40px">
                            <Checkbox
                                colorScheme='red'
                                borderRadius="50%"
                                onChange={(e) => {setIsCheck(e.target.checked)}}
                            >
                                <span style={{fontSize: 14}}>
                                    I agree with <a
                                    target="_blank"
                                    href="/privacy"
                                    className="a_link"
                                    style={{fontStyle: 'italic'}}
                                >Axiomesh Smart Account User Agreement</a>
                                </span>
                            </Checkbox>
                        </FormControl>
                        <ButtonPro mt="24px" onClick={handleSubmit}>Continue</ButtonPro>
                    </div>
                </div>
            </div>
            <Right />
        </div>
      </div>
  );
}
