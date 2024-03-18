import { Link } from 'umi';
import styles from './index.less';

const Settings = () => {
    return (
        <div className={styles.settings}>
            <div className={styles.settingsPlace}></div>
            <ul>
                <li>
                    <img src={require('@/assets/menu-security.png')} alt=""/><Link to="/">Security</Link>
                </li>
                <li>
                    <img src={require('@/assets/menu-lock.png')} alt=""/><Link to="/">Lock</Link>
                </li>
                <li>
                    <img src={require('@/assets/menu-contact.png')} alt=""/><Link to="/">Contact</Link>
                </li>
            </ul>
        </div>
    )
}

export default Settings;
