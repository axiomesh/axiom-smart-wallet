import styles from './index.less'
import React, { useState, useEffect } from 'react';
import useCancelModal from "@/hooks/CancelModal";

const PersonInfo = () => {
    const [isHover, setIsHover] = useState(false);
    const [isCopy, setIsCopy] = useState(false);

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

    const handleCopy = () => {
        setIsCopy(true);
        setTimeout(() => {
            setIsCopy(false)
        },3000)
    }

    const handleConfirm = () => {

    }

    return (
        <div className={`${styles.personinfo} ${isHover ? styles.personinfoHover : ''}`} onMouseOver={() => { setIsHover(true) }}>
            <img className={styles.img} src={require('@/assets/avatar.png')} alt=""/>
            <div className={styles.information}>
                <span className={styles.email}>dasdsa211223@gmail.com</span>
                <span className={styles.address}>0x06b…f2713 <i className={styles.downIcon}></i></span>
            </div>
            {isHover && <div className={`${styles.logoutModal} hover-content`}>
                <div className={styles.logoutInfo}>
                    <span className={styles.title}>Address</span>
                    <span className={styles.info}>0x06b…f2713</span>
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

export default PersonInfo;
