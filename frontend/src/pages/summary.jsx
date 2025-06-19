import { useParams } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import useApiData from '../hooks/useApiData'
import { getDaysBetweenDates } from '../functions/date'

const Summary = () => {
  const { id } = useParams()

  // User Data
  const base_url = process.env.REACT_APP_API_URL
  const { authUser, authToken } = useAuth()
  const adminRole = 'admin'

  const transportData = useApiData(`${base_url}/api/transportations`, authToken)
  const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken)
  const countriesData = useApiData(`${base_url}/api/countries`, authToken)
  const destinationsData = useApiData(
    `${base_url}/api/getdestinations`,
    authToken
  )
  const hotelsData = useApiData(`${base_url}/api/hotels`, authToken)

  const { data, loading, error, refetch } = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? 'showbookings'
        : `showbooking/${authUser.id}`
    }`,
    authToken
  )

  const items = data?.data?.filter((item) => {
    if (authUser.role === adminRole) {
      return item?.id == id
    } else {
      return item.booking?.id == id
    }
  })

  let item = null
  if (items?.length >= 1) {
    if (authUser.role === adminRole) {
      item = items[0]
    } else {
      item = items[0].booking
    }
  }

  if (
    loading ||
    transportData.loading ||
    sightseeingData.loading ||
    destinationsData.loading ||
    countriesData.loading
  ) {
    return (
      <>
        <div className="title">Summary</div>
        <section className="page-section">
          <div className="px-2 py-2 px-md-4 text-center">Loading...</div>
        </section>
      </>
    )
  }

  if (items && items.length >= 1) {
    const hotels = JSON.parse(item.hotel_info)
    const transports = JSON.parse(item.transport_info)
    const sightseeings = JSON.parse(item.sightseeing_info)

    return (
      <>
        <div className="title">Summary</div>
        <section className="page-section">
          <div className="px-2 py-2 px-md-4">
            {/* Summary */}
            <div className="container-fluid">
              <div className="title-line">
                <span>Summary</span>
              </div>
              <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">Travel Date</p>
                  <p>{item.travel_date_from.split('T')[0]}</p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">Guest Name</p>
                  <p>
                    {item.customer_name}
                    <br />
                    {item.phone_no}
                  </p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">Duration</p>
                  {/* <p>7 Nights, 8 Day</p> */}
                  <p>
                    {getDaysBetweenDates(
                      item.travel_date_from,
                      item.travel_date_to
                    )}{' '}
                    Days
                  </p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">PAX</p>
                  <p>
                    {item.no_adults} Adults{' '}
                    {item.no_children >= 1 && `+ ${item.no_children} Children`}
                  </p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">Payment Status</p>
                  <p>{item.payment_status}</p>
                </div>
              </div>
            </div>

            {/* Hotels */}
            <div className="container-fluid">
              <div className="title-line">
                <span>Hotels</span>
              </div>
              {hotels.map((item, index) => {
                const tempDes = destinationsData.data?.destinations?.find(
                  (destination) => destination.id == item.destination_id
                )

                const thisDes = countriesData.data?.cities.find(
                  (city) => city.id === tempDes.city_id
                )

                const thisHotel = hotelsData.data?.data?.find(
                  (hotel) => hotel.id == item.hotel_id
                )

                return (
                  <div
                    key={index}
                    className={`${
                      hotels.length != index + 1
                        ? 'border-bottom pb-4 mb-5'
                        : ''
                    }`}
                  >
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Check In</p>
                        <p>{item.check_in}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Check Out</p>
                        <p>{item.check_out}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Destination</p>
                        {/* <p>7 Nights, 8 Day</p> */}
                        <p>{thisDes?.name}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Hotel</p>
                        <p>{thisHotel?.name}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Room Type</p>
                        <p className="mb-0">{item.room_type}</p>
                        <p>₹ {item.room_type_cost}/-</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Rooms</p>
                        <p className="mb-0">{item.rooms}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Ex Adults</p>
                        <p className="mb-0">{item.ex_adults || 0}</p>
                      </div>
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Ex Children</p>
                        <p className="mb-0">{item.ex_children || 0}</p>
                      </div>
                    </div>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                      <div className="col">
                        <p className="fw-bold lh-1 mb-2">Meals</p>
                        <div className="d-flex row-gap-1 column-gap-4 flex-wrap mt-1">
                          {item.meals?.map((meal, i) => (
                            <div className="form-check" key={i}>
                              <p className="text-capitalize mb-0">
                                {meal.name}
                              </p>
                              <p>₹ {meal.rate}/-</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Transportations */}
            <div className="container-fluid mt-4">
              <div className="title-line">
                <span>Transportations</span>
              </div>
              <div>
                <div className="listing-card-container">
                  {transports.length == 1 && !transports[0].destination_id ? (
                    <p className="text-center">
                      No transportation record found!
                    </p>
                  ) : (
                    transports.map((transport, i) => {
                      const thisTransport = transportData.data.data.find(
                        (item) => item.id == transport.transport_id
                      )

                      return (
                        <div className="listing-card mb-4" key={i}>
                          <div className="listing-card--head">
                            <p className="fw-bold lh-1 my-2">
                              {transport.date}
                            </p>
                            {/* <p className="lh-1 mb-0">{transport.date}</p> */}
                          </div>
                          <div className="listing-card--body">
                            <div className="container px-4">
                              <div className="row pb-2 border-bottom">
                                <div className="col-12 col-sm-6">
                                  {thisTransport?.transport}
                                </div>
                                <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                  {transport.v_type}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Sightseeings */}
            <div className="container-fluid mt-4">
              <div className="title-line">
                <span>Sightseeings</span>
              </div>
              <div>
                <div className="listing-card-container">
                  {sightseeings.length == 1 &&
                  !sightseeings[0].destination_id ? (
                    <p className="text-center">No sightseeing record found!</p>
                  ) : (
                    sightseeings.map((sightseeing, i) => {
                      const thissightseeing = sightseeingData.data.data.find(
                        (item) => item.id == sightseeing.sightseeing_id
                      )

                      return (
                        <div className="listing-card mb-4" key={i}>
                          <div className="listing-card--head">
                            <p className="fw-bold lh-1 my-2">
                              {sightseeing.date}
                            </p>
                          </div>
                          <div className="listing-card--body">
                            <div className="container px-4">
                              <div className="row pb-2 border-bottom">
                                <div className="col-12 col-sm-6">
                                  {thissightseeing?.description}
                                </div>
                                <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                  {sightseeing.adults} Adults{' '}
                                  {sightseeing.children >= 1 &&
                                    `+ ${item.children} Children`}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <div className="title">Whatsapp Customer</div>
      <section className="page-section">
        <div className="px-2 py-2 px-md-4 text-center">No data Found!</div>
      </section>
    </>
  )
}
export default Summary
