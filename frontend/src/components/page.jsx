import { useContext, useEffect } from "react";

/* -- components -- */

import { NavContext } from "../context/NavContext";
import Header from "./header";
import Footer from "./Footer";
import Navbar from "./navbar";

const Page = ({ children }) => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext);

  return (
    <>
      <Header />
      <div className="d-flex align-items-stretch">
        <Navbar />
        <main className={navActive ? "active" : ""}>
          <div className="page-wrapper">{children}</div>
          <Footer />
        </main>
      </div>
    </>
  );
};

export default Page;
