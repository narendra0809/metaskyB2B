import { useContext } from "react";
import { NavContext } from "./context/NavContext";

/* -- components -- */
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext);

  return (
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
  );
};

export default Layout;
