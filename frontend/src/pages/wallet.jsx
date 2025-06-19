import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useApiData from '../hooks/useApiData'

/* -- components -- */
import { useAuth } from '../context/authContext'

const Wallet = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authUser, authToken } = useAuth()
  const agentRole = 'agent'
  const adminRole = 'admin'

  /* -- variables -- */
  let output, outputData, filteredData
  let totalPageNo = 0

  /* -- state variables -- */
  const [filterValue, setFilterValue] = useState({
    name: '',
  })
  let [perPage, setPerPage] = useState(10)
  let [currPageNo, setCurrPageNo] = useState(0)
  let [sortOrder, setSortOrder] = useState('desc')
  let [sortKey, setSortKey] = useState('created_at')

  // user data states
  const [userDataLoading, setUserDataLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userDataError, setUserDataError] = useState(null)

  useEffect(() => {
    ;(async () => {
      if (authUser.role === adminRole) {
        setUserDataLoading(true)
        try {
          const res = await fetch(`${base_url}/api/agent`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': true,
            },
          })

          const resData = await res.json()

          if (resData) {
            setUserData(resData)
          }
        } catch (error) {
          setUserDataError(error)
        } finally {
          setUserDataLoading(false)
        }
      }
    })()
  }, [])

  /* -- API URLs -- */
  const mainData = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole ? 'gettransaction' : 'getusertransaction'
    }`,
    authToken
  )

  /* -- render data -- */
  if (mainData?.data && !mainData?.loading && !userDataLoading) {
    // filtering
    filteredData = mainData.data.transactions?.filter((item) => item)

    // Sort filtered data based on sortKey and sortOrder
    filteredData = filteredData.sort((a, b) => {
      const dateA = new Date(a[sortKey])
      const dateB = new Date(b[sortKey])

      if (sortOrder === 'desc') {
        return dateB - dateA // Descending order
      } else {
        return dateA - dateB // Ascending order
      }
    })

    totalPageNo = Math.ceil(filteredData.length / perPage)

    // pagination
    outputData = filteredData.slice(
      perPage * currPageNo,
      perPage * currPageNo + perPage
    )

    // render
    output = outputData.map((item) => (
      <tr key={item.id}>
        {authUser.role === adminRole && (
          <td>
            {userData?.find((user) => user.id === item.user_id)?.username}
          </td>
        )}
        <td>{item.payment_date}</td>
        <td>{item.created_at?.split('T')[0]}</td>
        <td>
          {item.payment_status.toLowerCase() === 'Debit'.toLowerCase()
            ? item.amount
            : ''}
        </td>
        <td>
          {item.payment_status.toLowerCase() === 'Credit'.toLowerCase()
            ? item.amount
            : ''}
        </td>
        <td>
          {item.status === 'approved' ? (
            <i className="fa-solid fa-check text-success"></i>
          ) : (
            <i className="fa-solid fa-xmark text-danger"></i>
          )}
        </td>
      </tr>
    ))
  } else {
    output = (
      <tr>
        <td colSpan="6">Loading...</td>
      </tr>
    )
  }

  /* -- functions -- */
  const handlePerPage = (e) => {
    setPerPage(e.target.value)
    setCurrPageNo(0)
  }

  const handleSort = (key) => {
    // Toggle sort order
    if (key === sortKey) {
      setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortOrder('desc') // Default to descending when changing column
    }
  }

  const handleFilter = ({ currentTarget }) => {
    setFilterValue((item) => ({
      ...item,
      [currentTarget.name]: currentTarget.value,
    }))
    setCurrPageNo(0)
  }

  const handlePageInc = () => {
    if (currPageNo + 1 < totalPageNo) {
      setCurrPageNo((item) => item + 1)
    }
  }

  const handlePageDec = () => {
    if (currPageNo > 0) {
      setCurrPageNo((item) => item - 1)
    }
  }

  return (
    <>
      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Wallet</h1>
          {authUser.role === agentRole && (
            <Link to="/add-wallet" className="btn btn-primary">
              Add Wallet
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="mt-4">
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <select
                  id="show"
                  className="form-select"
                  onChange={handlePerPage}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="search..."
                  className="form-control"
                  value={filterValue.name}
                  onChange={handleFilter}
                />
              </div>
            </div>

            <div style={{ display: 'grid' }}>
              <div className="table-responsive mt-4">
                <table className="table table-hover text-center">
                  <thead>
                    <tr>
                      {authUser.role === adminRole && <th>Name</th>}
                      <th>
                        <button
                          className="th-btn"
                          onClick={() => handleSort('payment_date')}
                        >
                          Payment Date
                          <i className="fa-solid fa-arrow-down-wide-short ms-2"></i>
                        </button>
                      </th>
                      <th>
                        <button
                          className="th-btn"
                          onClick={() => handleSort('created_at')}
                        >
                          Created At
                          <i className="fa-solid fa-arrow-down-wide-short ms-2"></i>
                        </button>
                      </th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {output.length > 0 ? (
                      output
                    ) : (
                      <tr>
                        <td colSpan="6">No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  Showing {(currPageNo + 1) * perPage - (perPage - 1)} to{' '}
                  {(currPageNo + 1) * perPage < filteredData?.length
                    ? (currPageNo + 1) * perPage
                    : filteredData?.length}{' '}
                  of {filteredData?.length} entries
                </small>
                <ul className="pagination mt-4">
                  <li className="page-item">
                    <button
                      className={`page-link ${currPageNo <= 0 && 'disabled'}`}
                      onClick={handlePageDec}
                    >
                      Prev
                    </button>
                  </li>
                  <li className="page-item">
                    <button
                      className={`page-link ${
                        currPageNo + 1 >= totalPageNo && 'disabled'
                      }`}
                      onClick={handlePageInc}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Wallet
