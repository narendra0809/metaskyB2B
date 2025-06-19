import { useContext } from "react";
import { NavContext } from "./context/NavContext";

/* -- components -- */
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BalanceContextProvider from "./context/BalanceContext";
import { Outlet } from "react-router-dom";

const Layout = () => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext);

  return (
    <BalanceContextProvider>
      <div className="app-layout">
        <Header />
        <div className="main-container">
          <Navbar className={`sidebar ${navActive ? "active" : ""}`} />
          <main className={`main-content ${navActive ? "active" : ""}`}>
            <div className="page-wrapper">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </BalanceContextProvider>
  );
};

export default Layout;
