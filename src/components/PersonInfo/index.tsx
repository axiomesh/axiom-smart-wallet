import styles from './index.less'
import React, { useState, useEffect } from 'react';
import useCancelModal from "@/hooks/CancelModal";
import {clearSessionData, exchangeAddress, getImgFromHash, getMail} from '@/utils/help';
import {getUserInfo, logout} from "@/services/login";
import { connect, history } from 'umi';
import handleClipboard from "@/utils/clipboard"
import {AlertIcon, FailIcon} from "@/components/Icons";
import {Tooltip} from "@chakra-ui/react";
import {PayStatus} from "@/pages/home/config";

const PersonInfo = (props: any) => {
    const {info, userInfo} = props;
    const [isHover, setIsHover] = useState(false);
    const [isCopy, setIsCopy] = useState(false);
    const email: string | any = getMail();

    const [ModalComponent, openModal] = useCancelModal();


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

    const handleCopy = (e: any) => {
        handleClipboard(info.address, e)
        setIsCopy(true);
        setTimeout(() => {
            setIsCopy(false)
        },300)
    }

    const handleConfirm = async () => {
        sessionStorage.removeItem('sessionKey');
        sessionStorage.removeItem("key");
        sessionStorage.removeItem("allowCredentials");
        sessionStorage.removeItem("ow");
        sessionStorage.removeItem("sr");
        const deviceId: string | null = localStorage.getItem('visitorId');
        await logout(email, deviceId)
        history.replace('/login');
        window.location.reload();
    }

    return (
        <div className={`${styles.personinfo} ${isHover ? styles.personinfoHover : ''}`} onMouseOver={() => { setIsHover(true) }} onMouseLeave={() => {setIsHover(false)}}>
            {/*@ts-ignore*/}
            <div className={styles.img} style={{borderWidth: userInfo.pay_password_set_status === PayStatus.init ? 2 : 0}}>
                <img src={getImgFromHash(info?.address || '')} alt=""/>
                {userInfo.pay_password_set_status === PayStatus.init ? <Tooltip hasArrow label={<div>
                    <FailIcon fontSize="20px" />
                    <span style={{marginLeft: 8}}>Set transaction password</span>
                </div>} fontSize="14px" p="10px" fontWeight="500" borderRadius="4px" bg='gray.900' color='#FFFFFF' placement="bottom-start">
                    <AlertIcon className={styles.alertIcon} />
                </Tooltip> : null}
            </div>
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
                <div className={styles.logoutInfoBtn}>
                    <div className={`${styles.logoutButton} ${isCopy ? styles.logoutButtonClick : ''}`} onClick={handleCopy}>
                        <i className={`${styles.copy} ${isCopy ? styles.copyClick : ''}`}></i>
                    </div>
                    <div className={styles.logoutButton} onClick={() => openModal('Logout', handleConfirm)}>
                        <i className={`${styles.logout}`}></i>
                    </div>
                </div>
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
