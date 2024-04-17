import { Outlet, history } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {getMail} from "@/utils/help";
import {useEffect} from "react";
import {refreshToken} from "@/services/login";

export default function Layout() {
    const email: string | any = getMail();
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

    useEffect(() => {
        // @ts-ignore
        const stompClient = window.Stomp.over(new window.SockJS(window.socketUrl))
        stompClient.connect({}, function(frame: any) {
            stompClient.subscribe(`/topic/logout/${email}`, function(message: any) {
                if(message.body === 'logout'){
                    refreshToken()
                }
            });
        });
    }, []);

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
