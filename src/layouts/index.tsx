import { Link, Outlet } from 'umi';
import styles from './index.less';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu'
import PersonInfo from "@/components/PersonInfo";
import Settings from "@/components/Settings";

export default function Layout() {
  return (
    <div className={styles.navs}>
      <div>
        <Logo />
        <PersonInfo />
        <Menu />
        <Settings />
      </div>
      <Outlet />
    </div>
  );
}
