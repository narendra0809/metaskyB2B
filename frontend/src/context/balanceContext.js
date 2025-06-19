import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './authContext'
import useApiData from '../hooks/useApiData'

const userBalance = createContext(null)

export const useBalance = () => {
  return useContext(userBalance)
}

const BalanceContextProvider = ({ children }) => {
  const base_url = process.env.REACT_APP_API_URL
  const [balance, setBalance] = useState(null)
  const { authUser, authToken } = useAuth()

  const balanceData = useApiData(
    `${base_url}/api/userbalance/${authUser.id}`,
    authToken
  )

  useEffect(() => {
    if (balanceData.data && !balanceData.loading) {
      setBalance(balanceData.data?.wallet?.balance)
    }
  }, [balanceData])

  return (
    <userBalance.Provider
      value={{
        balance,
      }}
    >
      {children}
    </userBalance.Provider>
  )
}
export default BalanceContextProvider
