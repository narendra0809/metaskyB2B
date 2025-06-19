import { useContext } from 'react'
import { useAuth } from '../context/authContext'
import { NavContext } from '../context/navContext'
import { Link } from 'react-router-dom'
import React from 'react'
import './header.css'
import { useBalance } from '../context/balanceContext'

const Header = () => {
  const agentRole = 'agent'
  const { authUser, logout } = useAuth()
  const { balance } = useBalance()
  const { navActive, setNavActive } = useContext(NavContext)
  
  const activateNav = () => {
    setNavActive(!navActive)
  }

  return (
    <header>
      <div className="header-left">
        <div className={`header-logo ${navActive ? 'deactive' : ''}`}>
          <img src="/images/metalogo.webp" alt="TripOcio Logo" />
        </div>
        {/* Separate button from the transformation logic */}
        <div className="arrow-btn-container">
          <button
            className="arrow-btn"
            onClick={activateNav}
            aria-label={navActive ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fa-solid fa-arrow-left ${navActive ? 'rotated' : ''}`}></i>
          </button>
        </div>
      </div>
      
      <div className="header-right">
        {authUser.role === agentRole && (
          <div className="balance-display">
            <span className="balance-label">Balance:</span>
            <span className="balance-amount">{balance ? `₹ ${balance}` : <div className="loader"></div>}</span>
          </div>
        )}
        
        <div className="profile-section">
          <div className="user-info">
            {/* <i className="fa-solid fa-user"></i> */}
            <div className='user-details'>
            <span>{authUser.username}</span>
            <span className="emailProfile">{authUser.email}</span>
            </div>
            
          </div>
          
          <div className="header-icons">
            <Link to="/change-password" className="icon-link">
              <img src="/images/change.png" alt="Change Password" />
              <span className="icon-tooltip">Change Password</span>
            </Link>
            
            <Link to="/change-profile" className="icon-link">
              <img src="/images/changeProfile.png" alt="Change Profile" />
              <span className="icon-tooltip">Change Profile</span>
            </Link>
            
            <button onClick={logout} className="icon-link logout-btn">
              <img src="/images/logout.png" alt="Logout" />
              <span className="icon-tooltip">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>


  )
}

export default Header
