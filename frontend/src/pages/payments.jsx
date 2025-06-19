import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/* -- components -- */
import useApiData from '../hooks/useApiData'
import { useAuth } from '../context/authContext'
import Loader from '../Loader';
import '../Loader.css';
import Modal from '../components/modal'

const Payments = () => {
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
    status: '',
    date: '',
    mode: '',
  })
  const [statusId, setStatusId] = useState({ id: '', status: '' })
  const [modals, setModals] = useState({
    editModalOpen: false,
  })
  let [perPage, setPerPage] = useState(10)
  let [currPageNo, setCurrPageNo] = useState(0)
  let [sortOrder, setSortOrder] = useState('desc')
  let [sortKey, setSortKey] = useState('created_at')

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
      authUser.role === adminRole ? 'getpayment' : 'getuserpayment'
    }`,
    authToken
  )

  /* -- render data -- */
  if (mainData?.data && !mainData?.loading && !userDataLoading) {
    // filtering
    filteredData = mainData.data.payments?.filter(
      (item) =>
        item.status.toLowerCase().includes(filterValue.status.toLowerCase()) &&
        item.payment_date
          .toLowerCase()
          .includes(filterValue.date.toLowerCase()) &&
        item.mode.toLowerCase().includes(filterValue.mode.toLowerCase())
    )

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
        <td>{item.description}</td>
        <td>{item.payment_date}</td>
        <td>{item.amount}</td>
        <td className="text-capitalize">{item.mode}</td>
        <td>{item.created_at.split('T')[0]}</td>
        <td>
          {authUser.role === adminRole ? (
            <button
              className="btn p-0"
              onClick={() => {
                setStatusId((prev) => ({
                  ...prev,
                  id: item.id,
                  status: item.status,
                }))
                toggleModal('editModalOpen', true)
              }}
            >
              {item.status === 'pending' ? (
                <span className="bg-warning text-dark rounded-pill px-2 py-1">
                  Pending
                </span>
              ) : item.status === 'approved' ? (
                <span className="bg-success text-light rounded-pill px-2 py-1">
                  Accepted
                </span>
              ) : (
                <span className="bg-danger text-light rounded-pill px-2 py-1">
                  Denied
                </span>
              )}
            </button>
          ) : item.status === 'pending' ? (
            <span className="bg-warning text-dark rounded-pill px-2 py-1">
              Pending
            </span>
          ) : item.status === 'approved' ? (
            <span className="bg-success text-light rounded-pill px-2 py-1">
              Accepted
            </span>
          ) : (
            <span className="bg-danger text-light rounded-pill px-2 py-1">
              Denied
            </span>
          )}
        </td>
      </tr>
    ))
  } else {
    output = (
      <tr>
        <td colSpan="6"><Loader /></td>
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

  const toggleModal = (modalType, isOpen) => {
    if (authUser.role != adminRole) {
      return
    }
    setModals((prev) => ({ ...prev, [modalType]: isOpen }))
  }

  const handlePaymentStatus = async (status) => {
    toggleModal('editModalOpen', false)
    if (authUser.role != adminRole) {
      return
    }
    const res = await fetch(`${base_url}/api/approvepayment/${statusId.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        status: status,
      }),
    })

    mainData.refetch()
  }

  return (
    <>
      {authUser.role === adminRole && (
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal('editModalOpen', false)}
          title="Payment Stauts"
        >
          {/* Modal content */}
          <div className="container p-3">
            {statusId.status === 'pending' ? (
              <>
                <div className="container border-bottom border-light-subtle">
                  <p>Actions to perform</p>
                </div>
                <div className="container p-3">
                  <button
                    className="btn btn-success me-3"
                    onClick={() => {
                      handlePaymentStatus('approved')
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handlePaymentStatus('denied')
                    }}
                  >
                    Deny
                  </button>
                </div>
              </>
            ) : (
              <p>
                The transaction has already been{' '}
                {statusId.status === 'approved' ? 'Accepted' : 'Denied'}
              </p>
            )}
          </div>
        </Modal>
      )}

      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Payments List</h1>

          {authUser.role === agentRole && (
            <Link to="/add-wallet" className="btn btn-primary">
              Add Wallet
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="mt-4">
          <div className="table-container">
            <div className="border-bottom">
              <div className="row g-3 pb-3">
                <div className="col-12 col-md-4 col-lg-3">
                  <select
                    className="form-select"
                    name="status"
                    onChange={handleFilter}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Disapproved</option>
                  </select>
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                  <select
                    className="form-select"
                    name="date"
                    onChange={handleFilter}
                  >
                    <option value="">All Time</option>
                    <option value="this-month">This Month</option>
                    <option value="last-year">Last Month</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>
                <div className="col-12 col-md-4 col-lg-3">
                  <select
                    className="form-select"
                    name="mode"
                    onChange={handleFilter}
                  >
                    <option value="">Payment Mode</option>
                    <option value="Online">Online</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>
            </div>
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
                      <th>Description</th>
                      <th>
                        <button
                          className="th-btn"
                          onClick={() => handleSort('payment_date')}
                        >
                          Payment Date
                          <i className="fa-solid fa-arrow-down-wide-short ms-2"></i>
                        </button>
                      </th>
                      <th>Amount</th>
                      <th>Mode</th>
                      <th>
                        <button
                          className="th-btn"
                          onClick={() => handleSort('created_at')}
                        >
                          Created At
                          <i className="fa-solid fa-arrow-down-wide-short ms-2"></i>
                        </button>
                      </th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {!mainData.loading && output.length > 0 ? (
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

export default Payments
