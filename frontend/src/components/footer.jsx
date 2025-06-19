// import { Link } from 'react-router-dom';
// import './footer.css';

// const Footer = () => {
//   return (
//     <footer class="foot-clr">
//       {/* Details Section */}
//       <div class="dashboard-grid-details">
//         <div className="detail-cont">
//           <h4>Account Manager</h4>
//           <p>Firstname Surname</p>
//           <p>9876543210</p>
//         </div>
//         <div className="detail-cont">
//           <h4>Support Team</h4>
//           <p>+91 9876543210</p>
//           <p>someone@mail.to</p>
//         </div>
//         <div className="detail-cont">
//           <h4>Group Desk</h4>
//           <p>+91 9876543210</p>
//           <p>someone@mail.to</p>
//         </div>
//         </div>

//       {/* Copyright and Links Section */}
//       <div className="footer-bottom">
//         <p className="footer-copyright">
//           Copyright &copy; 2024. All rights reserved.
//         </p>
//         <ul className="footer-links">
//           <li>
//             <Link to="/privacy-policy" className="footer-link">
//               Privacy Policy
//             </Link>
//           </li>
//           <li>
//             <Link to="/terms-and-conditions" className="footer-link">
//               Terms and Conditions
//             </Link>
//           </li>
//           <li>
//             <Link to="/refund-policy" className="footer-link">
//               Refund Policy
//             </Link>
//           </li>
//         </ul>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import { Link } from "react-router-dom";
import metalLogo from "../public/images/metalogo.webp";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Logo Section */}
        <div className="footer-logo">
          <img src={metalLogo} alt="Trip Edo Logo" />
        </div>

        {/* Details Section */}
        <div className="footer-details">
          <div className="detail-column">
            <h4>Account Manager</h4>
            <p>Brooklyn Simmons</p>
            <p>+91 9876543210</p>
          </div>
          <div className="detail-column">
            <h4>Support Team</h4>
            <p>+91 9876543210</p>
            <p>someone@mail.to</p>
          </div>
          <div className="detail-column">
            <h4>Group Desk</h4>
            <p>+91 9876543210</p>
            <p>someone@mail.to</p>
          </div>
        </div>
      </div>

      {/* Copyright and Links Section */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          Copyright &copy; 2024. All rights reserved.
        </p>
        <ul className="footer-links">
          <li>
            <Link to="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="/terms-and-conditions" className="footer-link">
              Terms & Conditions
            </Link>
          </li>
          <li>
            <Link to="/refund-policy" className="footer-link">
              Refund Policy
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
