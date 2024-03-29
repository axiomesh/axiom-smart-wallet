import styles from './index.less';
import ButtonPro from '@/components/Button'
import { history } from 'umi';
import {useEffect, useState} from "react";
import Right from './componments/right';
import {getMail} from "@/utils/help";
import LogoutModal from './componments/logout-modal';

export default function LockPage() {
    const email: string | any = getMail();
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        history.push('/home');
    }

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

  return (
      <div className={styles.loginPage}>
        <div className={styles.loginContainer}>
            <div className={styles.loginLeft}>
                <div className={styles.loginLeftContainer}>
                    <div className={styles.desc} style={{fontSize: 20, marginBottom: 8}}>Welcome back</div>
                    <div className={styles.title}>{email}</div>
                    <a className='a_link' onClick={() => setOpen(true)} style={{marginTop: 4, fontSize: 14}}>
                        Use a different account
                    </a>
                    <ButtonPro mt="20px" onClick={handleSubmit}>Continue</ButtonPro>
                </div>
            </div>
            <Right />
        </div>
          <LogoutModal isOpen={open} onClose={handleClose} />
      </div>
  );
}
