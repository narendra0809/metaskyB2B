import { Navigate, Route, Routes } from 'react-router-dom'

import NavContextProvider from './context/navContext'
import { useAuth } from './context/authContext'

// Pages
import Login from './pages/login'
import Register from './pages/register'

import Destinations from './pages/admin/destinations'
import Tickets from './pages/admin/tickets'
import Hotels from './pages/admin/hotels'
import Sightseeing from './pages/admin/sightseeing'
import Transportation from './pages/admin/transportation'
import Taxes from './pages/admin/taxes'
import Agents from './pages/admin/agents'
import Staff from './pages/admin/staff'
import Banking from './pages/admin/banking'
import AllAccounts from './pages/admin/all-accounts'

import Dashboard from './pages/dashboard'
import Customers from './pages/customers'
import FinalCustomer from './pages/final-customers'
import ChangePassword from './pages/change-password'
import ChangeProfile from './pages/change-profile'
import ConfirmationList from './pages/confirmation-list'
import Wallet from './pages/wallet'
import Payments from './pages/payments'
import RoomPrice from './pages/room-price'
import TransportPrice from './pages/transport-price'
import SightseeingPrice from './pages/sightseeing-price'
import PrivacyPolicy from './pages/privacy-policy'
import RefundPolicy from './pages/refund-policy'
import TermsAndConditions from './pages/terms-and-conditions'

import Calculator from './pages/calculator'
import AddWallet from './pages/add-wallet'
import WhatsappCustomer from './pages/whatsapp-customer'
import Itinerary from './pages/itinerary'
import AgentWallets from './pages/admin/agent-wallets'
import EditCalculator from './pages/edit-calculator'
import Layout from './layout'
import Summary from './pages/summary'

function App() {
  const { loggedIn, authUser } = useAuth()
  const adminRole = 'admin'
  const agentRole = 'agent'

  return (
    <div className="App">
      <NavContextProvider>
        <Routes>
          <Route
            path="/"
            element={loggedIn ? <Layout /> : <Navigate to={'/login'} />}
          >
            {/* Private Routes */}
            <Route
              index
              element={
                loggedIn ? (
                  <Navigate to={'/dashboard'} />
                ) : (
                  <Navigate to={'/login'} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={loggedIn ? <Dashboard /> : <Navigate to={'/'} />}
            />
            <Route
              path="/customers"
              element={loggedIn ? <Customers /> : <Navigate to={'/'} />}
            />
            <Route
              path="/final-customers"
              element={loggedIn ? <FinalCustomer /> : <Navigate to={'/'} />}
            />
            <Route
              path="/confirmation-list"
              element={loggedIn ? <ConfirmationList /> : <Navigate to={'/'} />}
            />
            <Route
              path="/wallet"
              element={loggedIn ? <Wallet /> : <Navigate to={'/'} />}
            />
            <Route
              path="/payments"
              element={loggedIn ? <Payments /> : <Navigate to={'/'} />}
            />
            <Route
              path="/change-password"
              element={loggedIn ? <ChangePassword /> : <Navigate to={'/'} />}
            />
            <Route
              path="/change-profile"
              element={loggedIn ? <ChangeProfile /> : <Navigate to={'/'} />}
            />
            <Route
              path="/room-price"
              element={loggedIn ? <RoomPrice /> : <Navigate to={'/'} />}
            />
            <Route
              path="/transport-price"
              element={loggedIn ? <TransportPrice /> : <Navigate to={'/'} />}
            />
            <Route
              path="/sightseeing-price"
              element={loggedIn ? <SightseeingPrice /> : <Navigate to={'/'} />}
            />

            {/* Extra pages */}
            <Route
              path="/calculator"
              element={
                loggedIn && authUser.role === agentRole ? (
                  <Calculator />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/calculator/:bookingId"
              element={loggedIn ? <EditCalculator /> : <Navigate to={'/'} />}
            />
            <Route
              path="/add-wallet"
              element={
                loggedIn && authUser.role === agentRole ? (
                  <AddWallet />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/whatsapp-customer/:id"
              element={loggedIn ? <WhatsappCustomer /> : <Navigate to={'/'} />}
            />
            <Route
              path="/itinerary/:id"
              element={loggedIn ? <Itinerary /> : <Navigate to={'/'} />}
            />
            <Route
              path="/summary/:id"
              element={loggedIn ? <Summary /> : <Navigate to={'/'} />}
            />
            <Route
              path="/banking"
              element={loggedIn ? <Banking /> : <Navigate to={'/'} />}
            />

            {/* Admin */}
            <Route
              path="/destinations"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Destinations />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/hotels"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Hotels />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/sightseeing"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Sightseeing />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/transportation"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Transportation />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />

            {/* added by me  */}
            <Route
              path="/tickets"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Tickets />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />

            {/*  end  */}

            <Route
              path="/taxes"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Taxes />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/agents"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Agents />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/staff"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <Staff />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/all-accounts"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <AllAccounts />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
            <Route
              path="/agent-wallets"
              element={
                loggedIn && authUser.role === adminRole ? (
                  <AgentWallets />
                ) : (
                  <Navigate to={'/'} />
                )
              }
            />
          </Route>

          {/* Auth */}
          <Route
            path="/login"
            element={loggedIn ? <Navigate to={'/'} /> : <Login />}
          />
          <Route
            path="/register"
            element={loggedIn ? <Navigate to={'/'} /> : <Register />}
          />

          {/* Sitemaps */}
          <Route
            path="/privacy-policy"
            element={loggedIn ? <PrivacyPolicy /> : <Navigate to={'/'} />}
          />
          <Route
            path="/refund-policy"
            element={loggedIn ? <RefundPolicy /> : <Navigate to={'/'} />}
          />
          <Route
            path="/terms-and-conditions"
            element={loggedIn ? <TermsAndConditions /> : <Navigate to={'/'} />}
          />

          <Route
            path="*"
            element={<h1 className="text-center">Page not found!</h1>}
          />
        </Routes>
      </NavContextProvider>
    </div>
  )
}

export default App
