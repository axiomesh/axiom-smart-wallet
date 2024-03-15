import { Link } from 'umi';
import styles from './index.less';

const Menu = () => {
    return (
        <div className={styles.menu}>
            <ul>
                <li>
                    <Link to="/">Assets</Link>
                </li>
                <li>
                    <Link to="/">Buy</Link>
                </li>
                <li>
                    <Link to="/">Transfer</Link>
                </li>
            </ul>
        </div>
    )
}
export default Menu;
