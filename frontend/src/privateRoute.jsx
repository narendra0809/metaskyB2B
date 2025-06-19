import { Navigate } from 'react-router-dom'
import { useAuth } from './context/authContext'

const PrivateRoute = ({ children }) => {
  const [loggedIn] = useAuth()
  if (!loggedIn) {
    return <Navigate to="/" />
  }
  return children
}

export default PrivateRoute
