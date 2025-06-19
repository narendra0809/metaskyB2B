import { Link } from 'react-router-dom';
import Loader from '../Loader';
import '../Loader.css';

/* -- components -- */
import './dashboard.css'
import useApiData from '../hooks/useApiData'
import { useAuth } from '../context/authContext'
import { useEffect, useState } from 'react'
import { colors } from '@mui/material';

const Dashboard = () => {
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
      authUser?.role === adminRole
        ? 'showbookings'
        : `showbooking/${authUser?.id}`
    }`,
    authToken
  )

  // For cards
  const data = mainData?.data?.data

  const unpaid = data?.filter((item) => {
    const thisData = authUser?.role === adminRole ? item : item.booking

    return (
      thisData.payment_status.toLowerCase() === 'unpaid' &&
      thisData.customer_status?.toLowerCase() !== 'cancelled'
    )
  })
  const paid = data?.filter((item) => {
    const thisData = authUser?.role === adminRole ? item : item.booking
    return thisData.payment_status?.toLowerCase() === 'paid'
  })
  const confirmed = data?.filter((item) => {
    const thisData = authUser?.role === adminRole ? item : item.booking
    return thisData.customer_status?.toLowerCase() === 'confirmed'
  })

  // user data states
  const [userDataLoading, setUserDataLoading] = useState(false)
  const [userData, setUserData] = useState(null)
  const [userDataError, setUserDataError] = useState(null)

  useEffect(() => {
    ;(async () => {
      if (authUser?.role === adminRole) {
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
          const res = await fetch(`${base_url}/api/showuser/${authUser?.id}`, {
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
  let [sortOrder, setSortOrder] = useState('asc')
  let [sortKey, setSortKey] = useState('travel_date_from')

  const [err, setErr] = useState(null)
  const [success, setSuccess] = useState(false)
  const [popUp, setPopUp] = useState(false)

  /* -- render data -- */
  if (!mainData.loading && mainData.data?.data) {
    // filtering

    const rawData = [...mainData.data?.data]

    let data
    if (authUser?.role === adminRole) {
      data = rawData.filter((item) => {
        const today = new Date()
        const travelDate = new Date(item.travel_date_from.split('T')[0])

        return travelDate > today
      })
    } else {
      data = rawData.filter((item) => {
        const today = new Date()
        const travelDate = new Date(
          item.booking?.travel_date_from.split('T')[0]
        )

        return travelDate > today
      })
    }

    filteredData = data?.filter((item) => {
      const cusData = authUser?.role === adminRole ? item : item.booking
      return (
        cusData.customer_name
          .toLowerCase()
          .includes(filterValue.search.toLowerCase()) ||
        cusData.userData
          ?.find((user) => user.id === cusData.user_id)
          ?.email.includes(filterValue.search.toLowerCase())
      )
    })

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
    output = outputData.map((item) =>
      authUser?.role === adminRole ? (
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
            <div className="d-flex">
              <Link to={`/itinerary/${item.id}`} className="btn flex-shrink-0">
                <i className="fa-solid fa-eye text-primary"></i>
              </Link>
            </div>
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
            <div className="d-flex">
              <Link
                to={`/itinerary/${item.booking?.id}`}
                className="btn flex-shrink-0"
              >
                <i className="fa-solid fa-eye text-primary"></i>
              </Link>
            </div>
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
    <div className="dashboard">
      <div className="marquee-container">
        <div className="sliding-txt">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        </div>
      </div>
    
      <section className="dashboard-section">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-grid-container">
          <div className="dashboard-grid">
            {/* Top row - 3 boxes */}
            <div className="dashboard-grid-row1">
              <article className="dashboard-grid-card" id="box1">
                <img
                  src="/images/unpaid.png" 
                  alt="UnPaid booking"
                />
                <div className="card-content">
                  <span className="nums">{data ? unpaid?.length : '...'}</span>
                  <small>Unpaid Booking</small>
                </div>
              </article>
              
              <article className="dashboard-grid-card" id="box2">
                <img
                  src="/images/paidBooking.png" 
                  alt="Paid booking"
                />
                <div className="card-content">
                  <span className="nums">{data ? paid?.length : '...'}</span>
                  <small>Paid Booking</small>
                </div>
              </article>
              
              <article className="dashboard-grid-card" id="box3">
                <img
                  src="/images/confirmationBooking.png"
                  alt="Confirmed booking"
                />
                <div className="card-content">
                  <span className="nums">{data ? confirmed?.length : '...'}</span>
                  <small>Confirmed Booking</small>
                </div>
              </article>
            </div>
            
            {/* Bottom row - 6 boxes for admin, 4 boxes for customers */}
            <div className={`dashboard-grid-row2 ${authUser?.role !== adminRole ? 'customer-view' : ''}`}>
              <article className="dashboard-grid-card vertical-layout" id="box4">
                <div className="card-img-container">
                  <img
                    src="/images/destination.png" 
                    alt="Destinations"
                    className="card-icon"
                  />
                </div>
                <div className="card-content-vertical">
                  <span className="nums">{data ? confirmed?.length : '...'}</span>
                  <small>Destinations</small>
                </div>
              </article>
              
              <article className="dashboard-grid-card vertical-layout" id="box5">
                <div className="card-img-container">
                  <img
                    src="/images/hotels.png" 
                    alt="Hotels"
                    className="card-icon"
                  />
                </div>
                <div className="card-content-vertical">
                  <span className="nums">{data ? confirmed?.length : '...'}</span>
                  <small>Hotels</small>
                </div>
              </article>
              
              <article className="dashboard-grid-card vertical-layout" id="box6">
                <div className="card-img-container">
                  <img
                    src="/images/SightSeeing.png" 
                    alt="SightSeeings"
                    className="card-icon"
                  />
                </div>
                <div className="card-content-vertical">
                  <span className="nums">{data ? confirmed?.length : '...'}</span>
                  <small>Sightseeings</small>
                </div>
              </article>
              
              <article className="dashboard-grid-card vertical-layout" id="box7">
                <div className="card-img-container">
                  <img
                    src="/images/transportation.png" 
                    alt="Transportation"
                    className="card-icon"
                  />
                </div>
                <div className="card-content-vertical">
                  <span className="nums">{data ? confirmed?.length : '...'}</span>
                  <small>Transportation</small>
                </div>
              </article>
              
              {/* Only show these boxes for admin users */}
              {authUser?.role === adminRole && (
                <>
                  <article className="dashboard-grid-card vertical-layout" id="box8">
                    <div className="card-img-container">
                      <img
                        src="/images/agent.png" 
                        alt="Agent"
                        className="card-icon"
                      />
                    </div>
                    <div className="card-content-vertical">
                      <span className="nums">{userData?.length || '...'}</span>
                      <small>Agent</small>
                    </div>
                  </article>
                  
                  <article className="dashboard-grid-card vertical-layout" id="box9">
                    <div className="card-img-container">
                      <img
                        src="/images/staff.png" 
                        alt="Staff"
                        className="card-icon"
                      />
                    </div>
                    <div className="card-content-vertical">
                      <span className="nums">{userData?.length || '...'}</span>
                      <small>Staff</small>
                    </div>
                  </article>
                </>
              )}
            </div>
            
            {/* Banner row */}
            <div className="dashboard-grid-row3">
              <article className="dashboard-grid-banner">
                <p className="title">
                  Explore
                  <br />
                  <span>The World</span>
                </p>
                <Link
                  to={'/calculator'}
                  className="btn btn-responsive rounded-4 bg-[#1cb3be] text-white py-2 px-4"
                >
                  Get Quotation
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h1 className="dashboard-title">Upcoming Bookings</h1>

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
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>Agent</th>
                      <th>Company Name</th>
                      <th>PAX</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>Created At</th>
                      <th>Action</th>
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
    </div>
  )
}

export default Dashboard