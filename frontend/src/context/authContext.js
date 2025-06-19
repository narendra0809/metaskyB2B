import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  return useContext(AuthContext)
}

const verifyToken = async (token) => {
  const base_url = process.env.REACT_APP_API_URL
  try {
    const response = await fetch(`${base_url}/api/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    return false
  }
}

const AuthContextProvider = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'))
  const storedAuthToken = sessionStorage.getItem('authToken')
  const [authUser, setAuthUser] = useState(storedUser || null)
  const [authToken, setAuthToken] = useState(storedAuthToken || null)
  const [loggedIn, setLoggedIn] = useState(storedUser ? true : false)

  const login = (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.setItem('authToken', token)
    setLoggedIn(true)
    setAuthUser(userData)
    setAuthToken(token)
  }
  const logout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('authToken')
    setLoggedIn(false)
    setAuthUser(null)
    setAuthToken(null)
  }

  /* Check if the user is logged in based on sessionStorage */
  useEffect(() => {
    const storedAuthToken = sessionStorage.getItem('authToken')
    const storedUser = sessionStorage.getItem('user')

    if (storedUser && storedAuthToken) {
      login(JSON.parse(storedUser), storedAuthToken)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        authUser,
        authToken,
        loggedIn,
        setAuthUser,
        setLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export default AuthContextProvider
