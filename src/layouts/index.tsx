import { Outlet, history, connect} from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";
import {clearSessionData, getMail} from "@/utils/help";
import {useEffect, useState} from "react";
import {getUserInfo, refreshToken} from "@/services/login";


function Layout(props: any) {
    const {dispatch } = props;
    const email: string | any = getMail();
    const [info, setInfo] = useState({});
    useEffect(() => {
        if(!email) history.replace('/login')
    }, [])

    const initUserInfo = async () => {
        try{
            const res = await getUserInfo(email);
            if(res.lock_screen_status){
                history.replace('/lock')
            }
            if(res){
                setInfo(res);
                dispatch({
                    type: 'global/setUser',
                    payload: res,
                })
            }

        } catch (e) {
            clearSessionData();
            history.replace('/login')
        }
    }

    useEffect(() => {
        initUserInfo();
    }, []);

    const initSocket = () => {
        // @ts-ignore
        const ws = new WebSocket(`${window.socketUrl}/axm-wallet/notice/${email}`);

        console.log('ws连接状态21：' + ws.readyState);
        if(ws.readyState){
            ws.close();
        }

        ws.onopen = function () {
            console.log('ws连接状态：' + ws.readyState);
            ws.send('我们建立连接啦');
        }
        // 接听服务器发回的信息并处理展示
        ws.onmessage = function (message) {
            //完成通信后关闭WebSocket连接
            // ws.close();
            console.log('message.data:', message.data)
            if(message.data){
                const res = JSON.parse(message.data || '{}');
                if(res?.noticeType === 0){
                    refreshToken(email)
                }
                if(res?.noticeType === 1){
                    history.replace('/lock');
                }
            }
        }

        ws.onerror = function () {
            // 监听整个过程中websocket的状态
            console.log('ws连接状态47：' + ws.readyState);
            setTimeout(function(){
                initSocket();
            },5000);
        }
    }

    const handleChange = () => {
        if (!document.hidden) {
            initUserInfo();
        }
    }

    useEffect(() => {
        document.addEventListener("visibilitychange", handleChange);

        return () => {
            document.removeEventListener("visibilitychange", handleChange);
        }
    }, []);

    useEffect(() => {
        initSocket();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
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
        <PersonInfo info={info} />
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

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(Layout)
