import styles from "./Header.module.scss";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const [activeItem, setActiveItem] = useState('entdeckungen');

  const isItemActive = (item: string) => item === activeItem;

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          {/* SVG for Airbnb logo */}
        </div>
      </div>
      <div className={styles.headerCenter}>
        <nav className={styles.mainNav}>
          <NavLink to="/" className={`${styles.navItem} ${isItemActive('/') ? styles.active : ''}`} onClick={() => setActiveItem('/')}
          >
            Dashboard
          </NavLink>
          <div className="separator"></div>
          <NavLink to="/patterns" className={`${styles.navItem} ${isItemActive('/patterns') ? styles.active : ''}`} onClick={() => setActiveItem('/patterns')}>
            Patterns
          </NavLink>
          <div className="separator"></div>
          <NavLink to="/solutionImplementations" className={`${styles.navItem} ${isItemActive('/solutionImplementations') ? styles.active : ''}`} onClick={() => setActiveItem('/solutionImplementations')}>
            Solution Implementations
          </NavLink>
        </nav>

        {/* Search bar */}
        <div className={styles.searchBar}>
          {/* <div className={styles.searchItem}>
            <label>
              <span className={styles.labelText}>Wohin</span>
              <input type="text" placeholder="Reiseziele suchen" />
            </label>
          </div>
          <div className={styles.searchSeparator}></div>
          <div className={styles.searchItem}>
            <label>
              <span className={styles.labelText}>Datum</span>
              <input type="text" placeholder="Datum hinzufügen" />
            </label>
          </div>
          <div className={styles.searchSeparator}></div>
          <div className={styles.searchItem}>
            <label>
              <span className={styles.labelText}>Wer</span>
              <input type="text" placeholder="Gäste hinzufügen" />
            </label>
            <button className={styles.searchButton}>
              <FontAwesomeIcon
                icon={faBars}
                size="2xs"
                style={{ color: "#49454f" }}
              />
            </button>
          </div> */}
        </div>
      </div>
      <div className={styles.headerRight}>
        <button className={styles.userMenu}>
          <FontAwesomeIcon
            icon={faBars}
            style={{ color: "#49454f" }}
          />
        </button>
      </div>
    </header>
  );
};

export default Header;