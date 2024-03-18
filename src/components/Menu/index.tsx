import { Link } from 'umi';
import styles from './index.less';

const Menu = () => {
    return (
        <div className={styles.menu}>
            <ul>
                <li>
                    <span><Link to="/"><i className={styles.assetIcon}></i>Asset</Link></span>
                </li>
                <li>
                    <span><Link to="/"><i className={styles.assetIcon}></i>Transfer</Link></span>
                </li>
            </ul>
        </div>
    )
}
export default Menu;
