import { Link } from 'umi';
import styles from './index.less';

const Settings = () => {
    return (
        <div className={styles.settings}>
            <ul>
                <li>
                    <Link to="/">Security</Link>
                </li>
                <li>
                    <Link to="/">Lock</Link>
                </li>
                <li>
                    <Link to="/">Contact</Link>
                </li>
            </ul>
        </div>
    )
}

export default Settings;
