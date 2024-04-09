import styles from './index.less'
import React, { useState, useEffect } from 'react';
import useCancelModal from "@/hooks/CancelModal";
import {exchangeAddress, getImgFromHash, getMail} from '@/utils/help';
import {getUserInfo} from "@/services/login";
import {history} from "@@/core/history";
import { connect } from 'umi';

const PersonInfo = (props: any) => {
    const {dispatch} = props;
    const [isHover, setIsHover] = useState(false);
    const [isCopy, setIsCopy] = useState(false);
    const [info, setInfo] = useState({});
    const email: string | any = getMail();

    const [ModalComponent, openModal] = useCancelModal();

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
            history.replace('/login')
        }
    }

    useEffect(() => {
        initUserInfo();
    }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if (event.target.closest('.hover-content') === null) {
            setIsHover(false);
        }
    };

    const handleCopy = () => {
        setIsCopy(true);
        setTimeout(() => {
            setIsCopy(false)
        },3000)
    }

    const handleConfirm = () => {
        sessionStorage.setItem('Wallet_Token','');
        history.replace('/login')
    }

    return (
        <div className={`${styles.personinfo} ${isHover ? styles.personinfoHover : ''}`} onMouseOver={() => { setIsHover(true) }} onMouseLeave={() => {setIsHover(false)}}>
            {/*@ts-ignore*/}
            <img className={styles.img} src={getImgFromHash(info.address)} alt=""/>
            <div className={styles.information}>
                <span className={styles.email}>{info.email}</span>
                {/*@ts-ignore*/}
                <span className={styles.address}>{exchangeAddress(info.address)} <i className={styles.downIcon}></i></span>
            </div>
            <div className={styles.white}></div>
            {isHover && <div className={`${styles.logoutModal} hover-content`}>
                <div className={styles.logoutInfo}>
                    <span className={styles.title}>Address</span>
                    <span className={styles.info}>{exchangeAddress(info.address)}</span>
                </div>
                <div className={styles.logoutButton} onClick={handleCopy}><i className={`${styles.copy} ${isCopy ? styles.copyClick : ''}`}></i></div>
                <div className={styles.logoutButton} onClick={() => openModal('Logout', handleConfirm)}><i className={`${styles.logout}`}></i></div>
            </div>}
            <ModalComponent>
                Please note that password-free transfer associated with this account will be disabled after logging out！
            </ModalComponent>
        </div>
    )
}

export default connect(({ global }) => ({
    userInfo: global.userInfo,
}))(PersonInfo)
