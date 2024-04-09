import { Outlet, history } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {getMail} from "@/utils/help";
import {useEffect} from "react";

export default function Layout() {
    const email: string | any = getMail();
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

  return (
    <div className={styles.layout}>
      <div className={styles.navs}>
        <PersonInfo />
        <Menu />
        <Settings />
        <Logo />
      </div>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
}
