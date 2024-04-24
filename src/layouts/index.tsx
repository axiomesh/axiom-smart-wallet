import { Outlet, history, useLocation } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {clearSessionData, getMail, getToken} from "@/utils/help";
import {useEffect} from "react";
import {refreshToken} from "@/services/login";

export default function Layout() {
    const email: string | any = getMail();
    const location = useLocation();
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

    useEffect(() => {
        // @ts-ignore
        if(!window.SockJS){
            return
        }
        // @ts-ignore
        const socket_js = new window.SockJS(window.socketUrl)
        // @ts-ignore
        let stompClient = window.Stomp.over(socket_js);
        if(stompClient && stompClient.connected){
            stompClient.disconnect();
        }
        if(stompClient){
            stompClient.connect({}, function(frame: any) {
                stompClient.subscribe(`/topic/logout/${email}`, async function(message: any) {
                    if(message.body === 'logout'){
                        clearSessionData();
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

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            sessionStorage.removeItem("form");
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    },[])

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
