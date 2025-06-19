import { useContext, useEffect } from "react";

/* -- components -- */

import { NavContext } from "../context/NavContext";
import BalanceContextProvider from "../context/BalanceContext";
import Header from "./Header";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Page = ({ children }) => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext);

  return (
    <>
      <BalanceContextProvider>
        <Header />
        <div className="d-flex align-items-stretch">
          <Navbar />
          <main className={navActive ? "active" : ""}>
            <div className="page-wrapper">{children}</div>
            <Footer />
          </main>
        </div>
      </BalanceContextProvider>
    </>
  );
};

export default Page;
