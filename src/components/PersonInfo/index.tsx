import styles from './index.less'

const PersonInfo = () => {
    return (
        <div className={styles.personinfo}>
            <img className={styles.img} src={require('@/assets/avatar.png')} alt=""/>
            <div className={styles.information}>
                <span className={styles.email}>dasdsa211223@gmail.com</span>
                <span className={styles.address}>0x06b…f2713 <i className={styles.downIcon}></i></span>
            </div>
        </div>
    )
}

export default PersonInfo;
