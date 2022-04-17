import { ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): ReactElement {
  return (
    <header className={`${commonStyles.container} ${styles.headerContainer}`}>
      <Link href="/">
        <a className={styles.headerContent}>
          <img className={styles.logo} src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
