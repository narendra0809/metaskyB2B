import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import Loader from '../Loader';
import '../Loader.css';

/* -- components -- */
import useApiData from '../hooks/useApiData'
import Alert from '../components/alert'

const FinalCustomer = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authUser, authToken } = useAuth()
  const agentRole = 'agent'
  const adminRole = 'admin'

  /* -- variables -- */
  let output, outputData, filteredData
  let totalPageNo = 0

  /* -- API URLs -- */
  const mainData = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? 'showbookings'
        : `showbooking/${authUser.id}`
    }`,
    authToken
  )

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
      } else {
        setUserDataLoading(true)
        try {
          const res = await fetch(`${base_url}/api/showuser/${authUser.id}`, {
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

  /* -- state variables -- */
  const [filterValue, setFilterValue] = useState({
    search: '',
  })
  let [perPage, setPerPage] = useState(10)
  let [currPageNo, setCurrPageNo] = useState(0)

  const [err, setErr] = useState(null)
  const [success, setSuccess] = useState(false)
  const [popUp, setPopUp] = useState(false)

  /* -- render data -- */
  if (!mainData.loading && mainData.data?.data) {
    // filtering

    const rawData = [...mainData.data?.data]

    let data
    if (authUser.role === adminRole) {
      data = rawData.filter((item) => item.customer_status === 'confirmed')
    } else {
      data = rawData.filter(
        (item) => item.booking.customer_status === 'confirmed'
      )
    }
    data?.reverse()

    filteredData = data?.filter((item) => {
      const curItem = authUser.role === adminRole ? item : item.booking
      return curItem?.customer_name
        .toLowerCase()
        .includes(filterValue.search.toLowerCase())
    })

    totalPageNo = Math.ceil(filteredData.length / perPage)

    // pagination
    outputData = filteredData.slice(
      perPage * currPageNo,
      perPage * currPageNo + perPage
    )

    // render
    output = outputData.map((item) =>
      authUser.role === adminRole ? (
        <tr key={item.id}>
          <td>{item.customer_name}</td>
          <td>{item.phone_no}</td>
          <td>{userData?.find((user) => user.id === item.user_id)?.email}</td>
          <td>
            {userData?.find((user) => user.id === item.user_id)?.company_name}
          </td>
          <td>
            {item.no_adults}
            {item.no_children > 0 && ` + ${item.no_children}`}
          </td>
          <td>{item.final_payment}</td>
          <td>{item.travel_date_from.split('T')[0]}</td>
          <td>{item.created_date.split('T')[0]}</td>
          <td>
            <button
              className="btn rounded-pill p-0"
              onClick={() => {
                handleCustomerStatus(item.id, item.payment_status)
              }}
            >
              {item.payment_status.toLowerCase() === 'paid' ? (
                <span className="bg-success text-light rounded-pill px-2 py-1">
                  Paid
                </span>
              ) : (
                <span className="bg-danger text-light rounded-pill px-2 py-1">
                  Unpaid
                </span>
              )}
            </button>
          </td>
          <td>
            <Link to={`/summary/${item.id}`} className="btn flex-shrink-0">
              <i className="fa-solid fa-eye text-primary"></i>
            </Link>
            <Link to={`/itinerary/${item.id}`} className="btn flex-shrink-0">
              <i className="fa-solid fa-circle-info text-primary"></i>
            </Link>
          </td>
        </tr>
      ) : (
        <tr key={item.booking?.id}>
          <td>{item.booking?.customer_name}</td>
          <td>{item.booking?.phone_no}</td>
          <td>{userData?.email}</td>
          <td>{userData?.company_name}</td>
          <td>
            {item.booking?.no_adults}
            {item.booking?.no_children > 0 && ` + ${item.booking?.no_children}`}
          </td>
          <td>{item.booking?.final_payment}</td>
          <td>{item.booking?.travel_date_from.split('T')[0]}</td>
          <td>{item.booking?.created_date.split('T')[0]}</td>
          <td>
            {item.booking?.payment_status?.toLowerCase() === 'paid' ? (
              <span className="bg-success text-light rounded-pill px-2 py-1">
                Paid
              </span>
            ) : (
              <span className="bg-danger text-light rounded-pill px-2 py-1">
                Unpaid
              </span>
            )}
          </td>
          <td>
            <Link
              to={`/summary/${item.booking?.id}`}
              className="btn flex-shrink-0"
            >
              <i className="fa-solid fa-eye text-primary"></i>
            </Link>
            <Link
              to={`/itinerary/${item.booking?.id}`}
              className="btn flex-shrink-0"
            >
              <i className="fa-solid fa-circle-info text-primary"></i>
            </Link>
          </td>
        </tr>
      )
    )
  } else {
    output = (
      <tr>
        <td><Loader /></td>
      </tr>
    )
  }

  /* -- functions -- */
  const handlePerPage = (e) => {
    setPerPage(e.target.value)
    setCurrPageNo(0)
  }

  const handleSort = (key) => {
    // data = data.sort((a, b) => a[key] - b[key])
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

  const handleCustomerStatus = async (id, status) => {
    if (authUser.role != adminRole) {
      return
    }
    if (status === 'unpaid') {
      const res = await fetch(`${base_url}/api/agent-payment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      })

      const response = await res.json()

      if (response) {
        if (response.success) {
          setSuccess(response.success)
          mainData.refetch()
        } else {
          setSuccess(response.success)
        }
        setErr(response.message)
        setPopUp(true)
      }
    }
  }

  return (
    <>
      {authUser.role === adminRole && (
        <Alert
          open={popUp}
          handleClose={() => {
            setPopUp(false)
          }}
          success={success}
        >
          <p>{err}</p>
        </Alert>
      )}

      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Final Customers</h1>
          {authUser.role === agentRole && (
            <Link to="/calculator" className="btn btn-primary">
              Add B2B
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
                    id="destination"
                    className="form-select"
                    name="country"
                    onChange={handleFilter}
                  >
                    <option value="">All Destination</option>
                    <option value="Thailand">Thailand</option>
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
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
                  name="search"
                  placeholder="search..."
                  className="form-control"
                  value={filterValue.search}
                  onChange={handleFilter}
                />
              </div>
            </div>

            <div style={{ display: 'grid' }}>
              <div className="table-responsive mt-4">
                <table className="table table-hover text-center">
                  <thead>
                    <tr>
                      <th
                        onClick={() => {
                          handleSort('')
                        }}
                      >
                        Customer Name
                      </th>
                      <th>Phone Number</th>
                      <th>Agent</th>
                      <th>Company Name</th>
                      <th>PAX</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>Created At</th>
                      <th>Payment Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {mainData.loading ? (
                      <tr>
                        <td colSpan={99}>Loading...</td>
                      </tr>
                    ) : output.length > 0 ? (
                      output
                    ) : (
                      <tr>
                        <td colSpan={99}>No record found</td>
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

export default FinalCustomer
