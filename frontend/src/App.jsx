import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavContextProvider from "./context/NavContext";
import Layout from "./Layout";
import AddWallet from "./pages/AddWallet";
import Agents from "./pages/admin/Agents";
import AgentWallets from "./pages/admin/AgentWallets";
import AllAccounts from "./pages/admin/AllAccounts";
import Banking from "./pages/admin/Banking";
import Destinations from "./pages/admin/Destinations";
import Hotels from "./pages/admin/Hotels";
import Sightseeing from "./pages/admin/Sightseeing";
import Staff from "./pages/admin/Staff";
import Taxes from "./pages/admin/Taxes";
import Tickets from "./pages/admin/Tickets";
import Transportation from "./pages/admin/Transportation";
import Calculator from "./pages/calculator";
import ChangePassword from "./pages/ChangePassword";
import ChangeProfile from "./pages/ChangeProfile";
import ConfirmationList from "./pages/ConfirmationList";
import Customers from "./pages/Customers";
import Dashboard from "./pages/dashboard";
import EditCalculator from "./pages/EditCalculator";
import FinalCustomer from "./pages/FinalCustomers";
import Itinerary from "./pages/Itinerary";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Register from "./pages/Register";
import SightseeingPrice from "./pages/SightseeingPrice";
import Summary from "./pages/Summary";
import TermsAndConditions from "./pages/TermsAndConditions";
import TicketPrice from "./pages/TicketPrice";
import TransportPrice from "./pages/TransportPrice";
import Wallet from "./pages/Wallet";
import WhatsappCustomer from "./pages/WhatsappCustomer";

function App() {
  const { loggedIn, authUser } = useAuth();
  const adminRole = "admin";
  const agentRole = "agent";

  const ProtectedRoute = ({ element, roles = [], ...rest }) => {
    if (!loggedIn) return <Navigate to="/login" />;
    if (roles.length && !roles.includes(authUser.role)) {
      return <Navigate to="/" />;
    }
    return element;
  };

  return (
    <div className="App">
      <NavContextProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={loggedIn ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={loggedIn ? <Navigate to="/" /> : <Register />}
          />

          {/* Policy Routes (accessible regardless of auth) */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />

          {/* Main Layout Protected Routes */}
          <Route
            path="/"
            element={loggedIn ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/dashboard" />} />
            {/* Common Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route
              path="/customers"
              element={<ProtectedRoute element={<Customers />} />}
            />
            <Route
              path="/final-customers"
              element={<ProtectedRoute element={<FinalCustomer />} />}
            />
            <Route
              path="/confirmation-list"
              element={<ProtectedRoute element={<ConfirmationList />} />}
            />
            <Route
              path="/wallet"
              element={<ProtectedRoute element={<Wallet />} />}
            />
            <Route
              path="/payments"
              element={<ProtectedRoute element={<Payments />} />}
            />
            <Route
              path="/change-password"
              element={<ProtectedRoute element={<ChangePassword />} />}
            />
            <Route
              path="/change-profile"
              element={<ProtectedRoute element={<ChangeProfile />} />}
            />
            <Route
              path="/ticket-price"
              element={<ProtectedRoute element={<TicketPrice />} />}
            />
            <Route
              path="/transport-price"
              element={<ProtectedRoute element={<TransportPrice />} />}
            />
            <Route
              path="/sightseeing-price"
              element={<ProtectedRoute element={<SightseeingPrice />} />}
            />
            {/* Agent-Specific Routes */}
            <Route
              path="/calculator"
              element={<ProtectedRoute element={<Calculator />} />}
              roles={[agentRole]}
            />
            <Route
              path="/calculator/:bookingId"
              element={<ProtectedRoute element={<EditCalculator />} />}
            />
            <Route
              path="/add-wallet"
              element={<ProtectedRoute element={<AddWallet />} />}
              roles={[agentRole]}
            />
            {/* Dynamic Parameter Routes */}
            <Route
              path="/whatsapp-customer/:id"
              element={<ProtectedRoute element={<WhatsappCustomer />} />}
            />
            <Route
              path="/itinerary/:id"
              element={<ProtectedRoute element={<Itinerary />} />}
            />
            <Route
              path="/summary/:id"
              element={<ProtectedRoute element={<Summary />} />}
            />
            {/* Admin-Only Routes */}
            <Route
              path="/destinations"
              element={
                <ProtectedRoute
                  element={<Destinations />}
                  roles={[adminRole]}
                />
              }
            />
            <Route
              path="/hotels"
              element={
                <ProtectedRoute element={<Hotels />} roles={[adminRole]} />
              }
            />
            <Route
              path="/sightseeing"
              element={
                <ProtectedRoute element={<Sightseeing />} roles={[adminRole]} />
              }
            />
            <Route
              path="/transportation"
              element={
                <ProtectedRoute
                  element={<Transportation />}
                  roles={[adminRole]}
                />
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute element={<Tickets />} roles={[adminRole]} />
              }
            />
            <Route
              path="/taxes"
              element={
                <ProtectedRoute element={<Taxes />} roles={[adminRole]} />
              }
            />
            <Route
              path="/agents"
              element={
                <ProtectedRoute element={<Agents />} roles={[adminRole]} />
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute element={<Staff />} roles={[adminRole]} />
              }
            />
            <Route
              path="/all-accounts"
              element={
                <ProtectedRoute element={<AllAccounts />} roles={[adminRole]} />
              }
            />
            <Route
              path="/agent-wallets"
              element={
                <ProtectedRoute
                  element={<AgentWallets />}
                  roles={[adminRole]}
                />
              }
            />
            <Route
              path="/banking"
              element={
                <ProtectedRoute element={<Banking />} roles={[adminRole]} />
              }
            />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={<h1 className="text-center">Page not found!</h1>}
          />
        </Routes>
      </NavContextProvider>
    </div>
  );
}

export default App;
