import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HashRouter } from "react-router-dom"; // Changed from Router to HashRouter
import AuthContextProvider from "./context/AuthContext.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <HashRouter>
    <AuthContextProvider>
      <ScrollToTop>
        <App />
      </ScrollToTop>
    </AuthContextProvider>
  </HashRouter>
);
