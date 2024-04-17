import { Outlet, history } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {getMail, getToken} from "@/utils/help";
import {useEffect} from "react";
import {refreshToken} from "@/services/login";

export default function Layout() {
    const email: string | any = getMail();
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

    useEffect(() => {
        // @ts-ignore
        const socket_js = new window.SockJS(window.socketUrl)
        // @ts-ignore
        let stompClient = window.Stomp.over(socket_js)
        if(stompClient){
            stompClient.connect({}, function(frame: any) {
                stompClient.subscribe(`/topic/logout/${email}`, async function(message: any) {
                    if(message.body === 'logout'){
                        refreshToken()
                    }
                });
            });
        }

        return () => {
            if (stompClient !== null && socket_js.readyState) {
                stompClient.disconnect(); // 关闭连接
                stompClient = null;
            }
        }

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
