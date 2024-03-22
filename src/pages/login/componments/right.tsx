import styles from '../index.less';
import loginBg from '@/assets/login/bg.png';

export default function Right() {
  return (
      <div className={styles.loginRight}>
          <div className={styles.loginRightContainer}>
              <img src={loginBg} alt="login"/>
          </div>
      </div>
  );
}
