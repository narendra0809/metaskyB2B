import { Navigate, Route, Routes } from "react-router-dom";
import NavContextProvider from "./context/NavContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./Layout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Wallet from "./pages/Wallet";
import AddWallet from "./pages/AddWallet";
import Calculator from "./pages/Calculator";
import ChangePassword from "./pages/ChangePassword";
import ChangeProfile from "./pages/ChangeProfile";
import FinalCustomer from "./pages/FinalCustomers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ConfirmationList from "./pages/ConfirmationList";
import Customers from "./pages/Customers";
import EditCalculator from "./pages/EditCalculator";
import Itinerary from "./pages/Itinerary";
import Payments from "./pages/Payments";
import RoomPrice from "./pages/RoomPrice";
import SightseeingPrice from "./pages/SightseeingPrice";
import Summary from "./pages/Summary";
import TermsAndConditions from "./pages/TermsAndConditions";
import TransportPrice from "./pages/TransportPrice";
import WhatsappCustomer from "./pages/WhatsappCustomer";
import Destinations from "./pages/admin/Destinations";
import Hotels from "./pages/admin/Hotels";
import Sightseeing from "./pages/admin/Sightseeing";
import Transportation from "./pages/admin/Transportation";
import Tickets from "./pages/admin/Tickets";
import Taxes from "./pages/admin/Taxes";
import Agents from "./pages/admin/Agents";
import Staff from "./pages/admin/Staff";
import AllAccounts from "./pages/admin/AllAccounts";
import Banking from "./pages/admin/Banking";
import AgentWallets from "./pages/admin/AgentWallets";

// Lazy-loaded pages for better performance
// const Login = () => import("./pages/Login");
// const Register = () => import("./pages/Register");
// const Dashboard = () => import("./pages/Dashboard");
// ... (similar for all other page components)

function App() {
  const { loggedIn, authUser } = useAuth();
  const adminRole = "admin";
  const agentRole = "agent";

  // Protected Route component
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
              path="/room-price"
              element={<ProtectedRoute element={<RoomPrice />} />}
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
