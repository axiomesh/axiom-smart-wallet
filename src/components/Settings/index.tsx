import { Link,useNavigate } from 'umi';
import styles from './index.less';

const Settings = () => {
    let navigate = useNavigate();
    return (
        <div className={styles.settings}>
            <div className={styles.settingsPlace}></div>
            <ul>
                <li onClick={() => {navigate("/security")}}>
                    <img src={require('@/assets/menu-security.png')} alt=""/><span>Security</span>
                </li>
                <li>
                    <img src={require('@/assets/menu-lock.png')} alt=""/><span>Lock</span>
                </li>
                <li onClick={() => {navigate("/contact")}}>
                    <img src={require('@/assets/menu-contact.png')} alt=""/><span>Contact</span>
                </li>
            </ul>
        </div>
    )
}

export default Settings;
