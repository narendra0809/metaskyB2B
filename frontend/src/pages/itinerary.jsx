import { useParams } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { createDateArray, getDaysBetweenDates } from "../functions/date";
import Loader from "../Loader";
import "../Loader.css";
import { useAuth } from "../context/AuthContext";

const Itinerary = () => {
  const { id } = useParams();

  // User Data
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const adminRole = "admin";

  const transportData = useApiData(
    `${base_url}/api/transportations`,
    authToken
  );
  const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
  const countriesData = useApiData(`${base_url}/api/countries`, authToken);
  const destinationsData = useApiData(
    `${base_url}/api/getdestinations`,
    authToken
  );
  const hotelsData = useApiData(`${base_url}/api/hotels`, authToken);

  const { data, loading, error, refetch } = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? "showbookings"
        : `showbooking/${authUser.id}`
    }`,
    authToken
  );

  const items = data?.data?.filter((item) => {
    if (authUser.role === adminRole) {
      return item?.id == id;
    } else {
      return item.booking?.id == id;
    }
  });

  let item = null;
  if (items?.length >= 1) {
    if (authUser.role === adminRole) {
      item = items[0];
    } else {
      item = items[0].booking;
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
        <div className="title">Itinerary</div>
        <section className="page-section">
          <div className="px-2 py-2 px-md-4 text-center">
            <Loader />{" "}
          </div>
        </section>
      </>
    );
  }

  if (items && items.length >= 1) {
    const transports = JSON.parse(item.transport_info);
    const sightseeings = JSON.parse(item.sightseeing_info);

    const dates = createDateArray(item.travel_date_from, item.travel_date_to);
    const transportsDates = transports.map(({ date }) => date);
    const sightseeingsDates = sightseeings.map(({ date }) => date);

    const itinDates = dates.filter(
      (item) =>
        transportsDates.some((tDate) => tDate === item.date) ||
        sightseeingsDates.some((sDate) => sDate === item.date)
    );

    console.log(itinDates);

    return (
      <>
        <div className="title">Itinerary</div>
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
                  <p>{item.travel_date_from.split("T")[0]}</p>
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
                    {
                      createDateArray(
                        item.travel_date_from,
                        item.travel_date_to
                      ).length
                    }{" "}
                    Days
                  </p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">PAX</p>
                  <p>
                    {item.no_adults} Adults{" "}
                    {item.no_children >= 1 && `+ ${item.no_children} Children`}
                  </p>
                </div>
                <div className="col">
                  <p className="fw-bold lh-1 mb-2">Payment Status</p>
                  <p>{item.payment_status}</p>
                </div>
              </div>
            </div>

            {/* Transportations & Activities */}
            <div className="container-fluid mt-4">
              <div className="title-line">
                <span>Transportations & Activities</span>
              </div>
              <div>
                <div className="listing-card-container">
                  {itinDates.length > 1 ? (
                    <p className="text-center">No record found!</p>
                  ) : (
                    itinDates.map((item, i) => {
                      return (
                        <div className="listing-card mb-4" key={i}>
                          <div className="listing-card--head text-center">
                            <p className="fw-bold lh-1 my-2">Day {item.day}</p>
                            <p className="lh-1 mb-0 fs-8">{item.date}</p>
                          </div>
                          <div className="listing-card--body">
                            <div className="container px-4">
                              {transports.map((transport) => {
                                const thisTransport =
                                  transportData.data.data.find(
                                    (transItem) =>
                                      transItem.id == transport.transport_id
                                  );

                                if (transport.date === item.date) {
                                  return (
                                    <div className="row pb-2 border-bottom">
                                      <div className="col-12 col-sm-6">
                                        {thisTransport?.transport}
                                      </div>
                                      <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                        {transport.v_type}
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                              {sightseeings.map((sightseeing) => {
                                const thissightseeing =
                                  sightseeingData.data.data.find(
                                    (item) =>
                                      item.id == sightseeing.sightseeing_id
                                  );

                                if (sightseeing.date === item.date) {
                                  return (
                                    <div className="row pb-2 border-bottom">
                                      <div className="col-12 col-sm-6">
                                        {thissightseeing?.description}
                                      </div>
                                      <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                        {sightseeing.adults} Adults{" "}
                                        {sightseeing.children >= 1 &&
                                          `+ ${sightseeing.children} Children`}
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="title">Itinerary</div>
      <section className="page-section">
        <div className="px-2 py-2 px-md-4 text-center">No data Found!</div>
      </section>
    </>
  );
};
export default Itinerary;

{
  /* <div className="listing-card mb-4" key={i}>
                          <div className="listing-card--head">
                            <p className="fw-bold lh-1 my-2">
                              {transport.date}
                            </p>
                            <p className="lh-1 mb-0">{transport.date}</p>
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
                        </div> */
}
