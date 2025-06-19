// import { Children, useState } from 'react'

// const NavLinkDropdown = ({ title, iconClass, children }) => {
//   const [navDropdown, setNavDropdown] = useState(false)

//   const handleDropdown = () => {
//     setNavDropdown(!navDropdown)
//   }

//   const isSubActive = () => {
//     return Children.toArray(children).some(
//       (child) => child.props && child.props.isActive && child.props.isActive()
//     )
//   }

//   return (
//     <div className="nav-link-dropdown-cont">
//       <button
//         className={`nav-link nav-dropdown-btn ${isSubActive() ? 'active' : ''}`}
//         onClick={handleDropdown}
//       >
//         <div className="nav-dropdown-title">
//           <i className={`${iconClass} nav-icons`}></i>
//           <span className="no-display">{title}</span>
//         </div>
//         <i className={`fa-solid fa-chevron-right dropdown-arrow ${navDropdown ? 'rotate' : ''}`}></i>
//       </button>
//       <div className={`nav-link-dropdown-menu ${navDropdown ? 'active' : ''}`}>
//         <div className="nav-dropdown-link-cont">{children}</div>
//       </div>
//     </div>
//   )
// }

// export default NavLinkDropdown

import { Children, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavLinkDropdown = ({ title, iconClass, children }) => {
  const [navDropdown, setNavDropdown] = useState(false);
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);

  // Check if any child route is active
  useEffect(() => {
    const childRoutes = Children.toArray(children).map(
      (child) => child.props.to
    );

    const isAnyChildActive = childRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    setIsActive(isAnyChildActive);

    // Auto-open dropdown if one of its items is active
    if (isAnyChildActive && !navDropdown) {
      setNavDropdown(true);
    }
  }, [location, children, navDropdown]);

  const handleDropdown = () => {
    setNavDropdown(!navDropdown);
  };

  return (
    <div className="nav-link-dropdown-cont">
      <button
        className={`nav-link nav-dropdown-btn ${isActive ? "active" : ""}`}
        onClick={handleDropdown}
      >
        <div className="nav-dropdown-title">
          <i className={`${iconClass} nav-icons`}></i>
          <span className="no-display">{title}</span>
        </div>
        <i
          className={`fa-solid fa-chevron-right dropdown-arrow ${
            navDropdown ? "rotate" : ""
          }`}
        ></i>
      </button>
      <div className={`nav-link-dropdown-menu ${navDropdown ? "active" : ""}`}>
        <div className="nav-dropdown-link-cont">{children}</div>
      </div>
    </div>
  );
};

export default NavLinkDropdown;
