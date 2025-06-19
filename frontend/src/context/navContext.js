import { createContext, useState } from 'react'

export const NavContext = createContext(null)

const NavContextProvider = ({ children }) => {
  const [navActive, setNavActive] = useState(false)
  return (
    <NavContext.Provider value={{ navActive, setNavActive }}>
      {children}
    </NavContext.Provider>
  )
}

export default NavContextProvider
