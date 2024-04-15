import { Outlet, history } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {getMail} from "@/utils/help";
import {useEffect} from "react";
// import useWebSocket, { ReadyState } from 'react-use-websocket';
// import {refreshToken} from "@/services/login";

export default function Layout() {
    const email: string | any = getMail();
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])
    // const { sendMessage, lastMessage, readyState } = useWebSocket(`${window.socketUrl}/api/axm-wallet/account/tokenSocket`);
    //
    // useEffect(() => {
    //     console.log('lastMessage', lastMessage)
    //     if (lastMessage !== null && lastMessage === 'TokenExpired') {
    //         refreshToken()
    //     }
    // }, [lastMessage]);

    // useEffect(() => {
    //    const  ws = new WebSocket(`${window.socketUrl}/api/axm-wallet/account/tokenSocket`)
    // }, []);

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
