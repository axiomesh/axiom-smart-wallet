import styles from './index.less'

const Logo = () => {
    return (
        <div className={styles.logo}>
            <img src={require('@/assets/logo.png')} alt=""/>
            <span>AxiomWallet</span>
        </div>
    )
}

export default Logo;
