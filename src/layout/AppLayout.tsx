// src/layout/AppLayout.tsx
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import "../styles/layout/AppLayout.scss";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Header />
      <div className="layout-body">
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
