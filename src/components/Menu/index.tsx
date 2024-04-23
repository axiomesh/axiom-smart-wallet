import { Link, useLocation } from 'umi';
import styles from './index.less';
import React, { useState } from 'react';

interface MenuItem {
    name: string;
    icon: string;
    url: string;
}

const Menu = () => {
    const [selectedItem, setSelectedItem] = useState(0);
    const location = useLocation();
    console.log(location)

    const menuItems: MenuItem[] = [
        { name: 'Assets', icon: 'assetIcon', url: '/home' },
        { name: 'Transfer', icon: 'transferIcon', url: '/transfer' }
    ];

    return (
        <div className={styles.menu}>
            <ul>
                {menuItems.map((item:MenuItem, index:Number) => (
                    <li
                        key={item.name}
                        className={location.pathname.includes(item.url) ? styles.active : ''}
                    >
                        <span><Link to={item.url}><i className={styles[item.icon]}></i>{item.name}</Link></span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Menu;
