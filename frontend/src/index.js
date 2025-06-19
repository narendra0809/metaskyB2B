import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { HashRouter as Router } from 'react-router-dom'

import AuthContextProvider from './context/authContext'
import ScrollToTop from './components/ScrollToTop'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Router>
    <AuthContextProvider>
      <ScrollToTop>
        <App />
      </ScrollToTop>
    </AuthContextProvider>
  </Router>
)
