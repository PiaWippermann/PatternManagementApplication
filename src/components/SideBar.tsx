// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";
import styles from "./SideBar.module.scss";

const Sidebar = () => {
  const linkClass =
    "block py-2 px-4 hover:bg-gray-100 text-sm font-medium rounded";

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <NavLink to="/" className={styles.navLink}>
          Dashboard
        </NavLink>
        <div className="separator"></div>
        <NavLink to="/patterns" className={styles.navLink}>
          Patterns
        </NavLink>
        <div className="separator"></div>
        <NavLink to="/solutions" className={styles.navLink}>
          Solutions
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
