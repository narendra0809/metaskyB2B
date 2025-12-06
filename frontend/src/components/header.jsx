import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { NavContext } from "../context/NavContext";
import { Link } from "react-router-dom";
import metalLogo from "../public/images/metalogo.webp";
import change from "../public/images/change.png";
import changeProfile from "../public/images/changeProfile.png";
import logoutPic from "../public/images/Logout.png";
import "./header.css";

const Header = () => {
  const agentRole = "agent";
  const { authUser, logout } = useAuth();
  const { navActive, setNavActive } = useContext(NavContext);

  const activateNav = () => {
    setNavActive(!navActive);
  };

  return (
    <header>
      <div className="header-left">
        <div className={`header-logo ${navActive ? "deactive" : ""}`}>
          <img src={metalLogo} alt="TripOcio Logo" />
        </div>
        {/* Separate button from the transformation logic */}
        <div className="arrow-btn-container">
          <button
            className="arrow-btn"
            onClick={activateNav}
            aria-label={navActive ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i
              className={`fa-solid fa-arrow-left ${navActive ? "rotated" : ""}`}
            ></i>
          </button>
        </div>
      </div>

      <div className="header-right">
        <div className="profile-section">
          <div className="user-info">
            {/* <i className="fa-solid fa-user"></i> */}
            <div className="user-details">
              <span>{authUser.username}</span>
              <span className="emailProfile">{authUser.email}</span>
            </div>
          </div>

          <div className="header-icons">
            <Link to="/change-password" className="icon-link">
              <img src={change} alt="Change Password" />
              <span className="icon-tooltip">Change Password</span>
            </Link>

            <Link to="/change-profile" className="icon-link">
              <img src={changeProfile} alt="Change Profile" />
              <span className="icon-tooltip">Change Profile</span>
            </Link>

            <button onClick={logout} className="icon-link logout-btn">
              <img src={logoutPic} alt="Logout" />
              <span className="icon-tooltip">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
