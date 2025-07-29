import { ThemeSwitcher } from "./ThemeSwitcher";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className="app-title">PaLi</h1>
      <ThemeSwitcher />
    </header>
  );
}
