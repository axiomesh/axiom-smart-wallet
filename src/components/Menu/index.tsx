import { Link } from 'umi';
import styles from './index.less';
import React, { useState } from 'react';

interface MenuItem {
    name: string;
    icon: string;
    url: string;
}

const Menu = () => {
    const [selectedItem, setSelectedItem] = useState(0);

    const menuItems: MenuItem[] = [
        { name: 'Assets', icon: 'assetIcon', url: '/home' },
        { name: 'Transfer', icon: 'transferIcon', url: '/transfer' }
    ];

    return (
        <div className={styles.menu}>
            <ul>
                {menuItems.map((item:MenuItem, index:Number) => (
                    <li
                        key={index}
                        onClick={() => setSelectedItem(index)}
                        className={selectedItem === index ? styles.active : ''}
                    >
                        <span><Link to={item.url}><i className={styles[item.icon]}></i>{item.name}</Link></span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Menu;
