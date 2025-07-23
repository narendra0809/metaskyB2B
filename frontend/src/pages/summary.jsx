import { useParams } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { getDaysBetweenDates } from "../functions/date";
import { useAuth } from "../context/AuthContext";

const Summary = () => {
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

  // Helper function to get location details
  const getLocationDetails = (destination_id) => {
    const destination = destinationsData.data?.destinations?.find(
      (des) => des.id === destination_id
    );
    if (!destination) return "N/A";

    const city = countriesData.data?.cities.find(
      (c) => c.id === destination.city_id
    );
    const state = countriesData.data?.states.find(
      (s) => s.id === destination.state_id
    );
    const country = countriesData.data?.countries.find(
      (c) => c.id === destination.country_id
    );

    return `${city?.name || "N/A"}, ${state?.name || "N/A"}, ${
      country?.name || "N/A"
    }`;
  };

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
    );
  }

  if (items && items.length >= 1) {
    const tickets = JSON.parse(item.ticket_info);
    const transports = JSON.parse(item.transport_info);
    const sightseeings = JSON.parse(item.sightseeing_info);

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
                  <p>
                    {getDaysBetweenDates(
                      item.travel_date_from,
                      item.travel_date_to
                    )}{" "}
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

            {/* Tickets Section */}
            {tickets.length > 0 && (
              <div className="container-fluid mt-4">
                <div className="title-line">
                  <span>Tickets</span>
                </div>
                <div>
                  <div className="listing-card-container">
                    {tickets.length === 0 ? (
                      <p className="text-center">No ticket record found!</p>
                    ) : (
                      tickets.map((ticket, i) => (
                        <div className="listing-card mb-4" key={i}>
                          <div className="listing-card--head">
                            <p className="fw-bold lh-1 my-2">{ticket.date}</p>
                          </div>
                          <div className="listing-card--body">
                            <div className="container px-4">
                              <div className="row pb-2 border-bottom">
                                <div className="col-12 col-sm-6">
                                  <p className="fw-bold">{ticket.name}</p>
                                  <p>
                                    <span className="text-muted">
                                      Category:
                                    </span>{" "}
                                    {ticket.category}
                                  </p>
                                  <p>
                                    <span className="text-muted">
                                      Time Slot:
                                    </span>{" "}
                                    {ticket.time_slot}
                                  </p>
                                  <p>
                                    <span className="text-muted">
                                      Transfer:
                                    </span>{" "}
                                    {ticket.transfer_option}
                                  </p>
                                </div>
                                <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                  <p>
                                    <span className="text-muted">Adults:</span>{" "}
                                    {ticket.adults} × {ticket.adult_price} AED
                                  </p>
                                  <p>
                                    <span className="text-muted">
                                      Children:
                                    </span>{" "}
                                    {ticket.children} × {ticket.child_price} AED
                                  </p>
                                  <div className="mt-2 pt-2 border-top">
                                    <p className="fw-bold">
                                      Total:{" "}
                                      {ticket.adults * ticket.adult_price +
                                        ticket.children *
                                          ticket.child_price}{" "}
                                      AED
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transportations */}
            {transports.length > 0 && (
              <div className="container-fluid mt-4">
                <div className="title-line">
                  <span>Transportations</span>
                </div>
                <div>
                  <div className="listing-card-container">
                    {transports.length == 0 ? (
                      <p className="text-center">
                        No transportation record found!
                      </p>
                    ) : (
                      transports.map((transport, i) => {
                        const thisTransport = transportData.data.data.find(
                          (item) => item.id == transport.transport_id
                        );

                        return (
                          <div className="listing-card mb-4" key={i}>
                            <div className="listing-card--head">
                              <p className="fw-bold lh-1 my-2">
                                {transport.date}
                              </p>
                            </div>
                            <div className="listing-card--body">
                              <div className="container px-4">
                                <div className="row pb-2 border-bottom">
                                  <div className="col-12 col-sm-6">
                                    <p className="fw-bold">
                                      <span className="fw-normal">
                                        Transporter :
                                      </span>{" "}
                                      {thisTransport?.company_name}
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Vehicle:
                                      </span>{" "}
                                      {thisTransport?.transport} (
                                      {thisTransport?.vehicle_type})
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Location:
                                      </span>{" "}
                                      {getLocationDetails(
                                        thisTransport?.destination_id
                                      )}
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Address:
                                      </span>{" "}
                                      {thisTransport?.address}
                                    </p>
                                  </div>
                                  <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                    {thisTransport?.options?.length > 0 && (
                                      <>
                                        <p className="fw-bold">Options:</p>
                                        {thisTransport.options.map(
                                          (option, idx) => (
                                            <p key={idx}>
                                              {option.type}: {option.rate} AED
                                            </p>
                                          )
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Sightseeings */}
            {sightseeings.length > 0 && (
              <div className="container-fluid mt-4">
                <div className="title-line">
                  <span>Sightseeings</span>
                </div>
                <div>
                  <div className="listing-card-container">
                    {sightseeings.length === 0 ? (
                      <p className="text-center">
                        No sightseeing record found!
                      </p>
                    ) : (
                      sightseeings.map((sightseeing, i) => {
                        const thisSightseeing = sightseeingData.data.data.find(
                          (item) => item.id == sightseeing.sightseeing_id
                        );

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
                                    <p className="fw-bold">
                                      <span className="fw-normal">
                                        Sightseeing Authority :{" "}
                                      </span>
                                      {thisSightseeing?.company_name}
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Description:
                                      </span>{" "}
                                      {thisSightseeing?.description}
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Location:
                                      </span>{" "}
                                      {getLocationDetails(
                                        thisSightseeing?.destination_id
                                      )}
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Address:
                                      </span>{" "}
                                      {thisSightseeing?.address}
                                    </p>
                                  </div>
                                  <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                    <p>
                                      <span className="text-muted">
                                        Adult Rate:
                                      </span>{" "}
                                      {thisSightseeing?.rate_adult} AED
                                    </p>
                                    <p>
                                      <span className="text-muted">
                                        Child Rate:
                                      </span>{" "}
                                      {thisSightseeing?.rate_child} AED
                                    </p>
                                    <div className="mt-2 pt-2 border-top">
                                      <p>
                                        {sightseeing.adults} Adults ×{" "}
                                        {thisSightseeing?.rate_adult} AED ={" "}
                                        {sightseeing.adults *
                                          thisSightseeing?.rate_adult}{" "}
                                        AED
                                      </p>
                                      {sightseeing.children >= 1 && (
                                        <p>
                                          {sightseeing.children} Children ×{" "}
                                          {thisSightseeing?.rate_child} AED ={" "}
                                          {sightseeing.children *
                                            thisSightseeing?.rate_child}{" "}
                                          AED
                                        </p>
                                      )}
                                      <p className="fw-bold">
                                        Total:{" "}
                                        {sightseeing.adults *
                                          thisSightseeing?.rate_adult +
                                          (sightseeing.children *
                                            thisSightseeing?.rate_child ||
                                            0)}{" "}
                                        AED
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="title">Whatsapp Customer</div>
      <section className="page-section">
        <div className="px-2 py-2 px-md-4 text-center">No data Found!</div>
      </section>
    </>
  );
};
export default Summary;
