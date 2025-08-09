import styles from './Button.module.scss';
import { ReactNode, ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function Button({ children, ...rest }: Props) {
  return <button className={styles.button} {...rest}>{children}</button>;
}
