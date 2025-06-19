import { useContext, useEffect } from 'react'

import { NavContext } from '../context/navContext'

/* -- components -- */
import Header from './header'
import Navbar from './navbar'
import Footer from './footer'
import BalanceContextProvider from '../context/balanceContext'

const Page = ({ children }) => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext)

  return (
    <>
      <BalanceContextProvider>
        <Header />
        <div className="d-flex align-items-stretch">
          <Navbar />
          <main className={navActive ? 'active' : ''}>
            <div className="page-wrapper">{children}</div>
            <Footer />
          </main>
        </div>
      </BalanceContextProvider>
    </>
  )
}

export default Page
