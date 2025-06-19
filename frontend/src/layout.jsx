import { useContext } from 'react'
import { NavContext } from './context/navContext'

/* -- components -- */
import Header from './components/header'
import Navbar from './components/navbar'
import Footer from './components/footer'
import BalanceContextProvider from './context/balanceContext'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  /* -- contexts -- */
  const { navActive } = useContext(NavContext)

  return (
    <BalanceContextProvider>
      <div className="app-layout">
        <Header />
        <div className="main-container">
          <Navbar className={`sidebar ${navActive ? 'active' : ''}`} />
          <main className={`main-content ${navActive ? 'active' : ''}`}>
            <div className="page-wrapper">
              <Outlet />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </BalanceContextProvider>
  )
}

export default Layout
