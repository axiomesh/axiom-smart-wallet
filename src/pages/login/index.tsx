import InputPassword from '@/components/InputPassword'
import styles from './index.less';
import logo from '@/assets/axiom.svg'
import loginBg from '@/assets/login/bg.png';
import InputPro from '@/components/Input';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Button,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';

export default function HomePage() {
    const validateName = () => {

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
                        <Formik
                            onSubmit={(values, actions) => {
                                setTimeout(() => {
                                    alert(JSON.stringify(values, null, 2))
                                    actions.setSubmitting(false)
                                }, 1000)
                            }}
                         initialValues={{}}
                        >
                            {(props) => (
                                <Form>
                                    <Field name='name' validate={validateName}>
                                        {({ field, form }: any) => (
                                            <FormControl isInvalid={form.errors.name && form.touched.name}>
                                                <InputPro placeholder='Enter your email address' style={{height: 56}} />
                                                <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                                            </FormControl>
                                        )}
                                    </Field>
                                    {/*<Button*/}
                                    {/*    mt={4}*/}
                                    {/*    colorScheme='teal'*/}
                                    {/*    isLoading={props.isSubmitting}*/}
                                    {/*    type='submit'*/}
                                    {/*>*/}
                                    {/*    Submit*/}
                                    {/*</Button>*/}
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
            <div className={styles.loginRight}>
                <div className={styles.loginRightContainer}>
                    <img src={loginBg} alt="login"/>
                </div>
            </div>
        </div>
      </div>
  );
}
