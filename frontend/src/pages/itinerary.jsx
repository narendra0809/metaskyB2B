// import { useParams } from "react-router-dom";
// import useApiData from "../hooks/useApiData";
// import { createDateArray } from "../functions/date";
// import Loader from "../Loader";
// import "../Loader.css";
// import { useAuth } from "../context/AuthContext";

// const Itinerary = () => {
//   const { id } = useParams();
//   const base_url = import.meta.env.VITE_API_URL;
//   const { authUser, authToken } = useAuth();
//   const adminRole = "admin";

//   const transportData = useApiData(
//     `${base_url}/api/transportations`,
//     authToken
//   );
//   const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
//   const countriesData = useApiData(`${base_url}/api/countries`, authToken);
//   const destinationsData = useApiData(
//     `${base_url}/api/getdestinations`,
//     authToken
//   );

//   const { data, loading } = useApiData(
//     `${base_url}/api/${
//       authUser.role === adminRole
//         ? "showbookings"
//         : `showbooking/${authUser.id}`
//     }`,
//     authToken
//   );

//   const items = data?.data?.filter((item) => {
//     if (authUser.role === adminRole) {
//       return item?.id == id;
//     } else {
//       return item.booking?.id == id;
//     }
//   });

//   let item = null;
//   if (items?.length >= 1) {
//     if (authUser.role === adminRole) {
//       item = items[0];
//     } else {
//       item = items[0].booking;
//     }
//   }

//   const getLocationDetails = (destination_id) => {
//     const destination = destinationsData.data?.destinations?.find(
//       (des) => des.id === destination_id
//     );
//     if (!destination) return "N/A";

//     const city = countriesData.data?.cities.find(
//       (c) => c.id === destination.city_id
//     );
//     const state = countriesData.data?.states.find(
//       (s) => s.id === destination.state_id
//     );
//     const country = countriesData.data?.countries.find(
//       (c) => c.id === destination.country_id
//     );

//     return `${city?.name || "N/A"}, ${state?.name || "N/A"}, ${
//       country?.name || "N/A"
//     }`;
//   };

//   if (
//     loading ||
//     transportData.loading ||
//     sightseeingData.loading ||
//     destinationsData.loading ||
//     countriesData.loading
//   ) {
//     return (
//       <div className="container py-4">
//         <h1 className="h3 mb-4">Itinerary</h1>
//         <div className="text-center">
//           <Loader />
//         </div>
//       </div>
//     );
//   }

//   if (items && items.length >= 1) {
//     const tickets = JSON.parse(item.ticket_info);
//     const transports = JSON.parse(item.transport_info);
//     const sightseeings = JSON.parse(item.sightseeing_info);

//     const dates = createDateArray(item.travel_date_from, item.travel_date_to);
//     const transportsDates = transports.map(({ date }) => date);
//     const sightseeingsDates = sightseeings.map(({ date }) => date);
//     const ticketsDates = tickets.map(({ date }) => date);

//     const itinDates = dates.filter(
//       (item) =>
//         transportsDates.some((tDate) => tDate === item.date) ||
//         sightseeingsDates.some((sDate) => sDate === item.date) ||
//         ticketsDates.some((tDate) => tDate === item.date)
//     );

//     return (
//       <div className="container py-4">
//         <h1 className="h3 mb-4">Itinerary</h1>
//         <div className="mb-4">
//           <div className="card">
//             <div className="card-body">
//               <h5 className="card-title">Trip Summary</h5>
//               <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
//                 <div className="col">
//                   <div className="border p-2 rounded">
//                     <p className="fw-bold mb-1 small">Travel Date</p>
//                     <p className="mb-0">
//                       {item.travel_date_from.split("T")[0]}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="col">
//                   <div className="border p-2 rounded">
//                     <p className="fw-bold mb-1 small">Guest Name</p>
//                     <p className="mb-0">
//                       {item.customer_name}
//                       <br />
//                       {item.phone_no}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="col">
//                   <div className="border p-2 rounded">
//                     <p className="fw-bold mb-1 small">Duration</p>
//                     <p className="mb-0">
//                       {
//                         createDateArray(
//                           item.travel_date_from,
//                           item.travel_date_to
//                         ).length
//                       }{" "}
//                       Days
//                     </p>
//                   </div>
//                 </div>
//                 <div className="col">
//                   <div className="border p-2 rounded">
//                     <p className="fw-bold mb-1 small">PAX</p>
//                     <p className="mb-0">
//                       {item.no_adults} Adults{" "}
//                       {item.no_children >= 1 &&
//                         `+ ${item.no_children} Children`}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="col">
//                   <div className="border p-2 rounded">
//                     <p className="fw-bold mb-1 small">Payment Status</p>
//                     <p className="mb-0">{item.payment_status}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div>
//           <div className="card">
//             <div className="card-body">
//               {itinDates.length === 0 ? (
//                 <div className="text-center py-4">
//                   <p className="text-muted">No activities scheduled</p>
//                 </div>
//               ) : (
//                 <div>
//                   {itinDates.map((day, i) => {
//                     const dayTransports = transports.filter(
//                       (t) => t.date === day.date
//                     );
//                     const daySightseeings = sightseeings.filter(
//                       (s) => s.date === day.date
//                     );
//                     const dayTickets = tickets.filter(
//                       (t) => t.date === day.date
//                     );

//                     return (
//                       <div key={day.date} className="list-group-item mb-3">
//                         <h5 className="mb-3">
//                           Day {day.day} - {day.date}
//                         </h5>
//                         <div
//                           className="overflow-auto"
//                           style={{ maxHeight: "400px" }}
//                         >
//                           {dayTickets.length > 0 && (
//                             <div className="card mb-3">
//                               <div className="card-header  text-dark">
//                                 <h6 className="mb-0">Tickets</h6>
//                               </div>
//                               <div className="card-body">
//                                 {dayTickets.map((ticket, idx) => (
//                                   <div
//                                     key={idx}
//                                     className="mb-3 pb-3 border-bottom"
//                                   >
//                                     <div className="row">
//                                       <div className="col-md-6">
//                                         <h6 className="fw-bold">
//                                           {ticket.name}
//                                         </h6>
//                                         <p className="mb-1">
//                                           <span className="text-muted">
//                                             Category:
//                                           </span>{" "}
//                                           {ticket.category}
//                                         </p>
//                                         <p className="mb-1">
//                                           <span className="text-muted">
//                                             Time:
//                                           </span>{" "}
//                                           {ticket.time_slot}
//                                         </p>
//                                         <p className="mb-1">
//                                           <span className="text-muted">
//                                             Transfer:
//                                           </span>{" "}
//                                           {ticket.transfer_option}
//                                         </p>
//                                       </div>
//                                       <div className="col-md-6">
//                                         <p>
//                                           <span className="text-muted">
//                                             Adults:
//                                           </span>{" "}
//                                           {ticket.adults} × {ticket.adult_price}{" "}
//                                           AED
//                                         </p>
//                                         <p>
//                                           <span className="text-muted">
//                                             Children:
//                                           </span>{" "}
//                                           {ticket.children} ×{" "}
//                                           {ticket.child_price} AED
//                                         </p>
//                                         <p className="fw-bold">
//                                           Total:{" "}
//                                           {ticket.adults * ticket.adult_price +
//                                             ticket.children *
//                                               ticket.child_price}{" "}
//                                           AED
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             </div>
//                           )}

//                           {dayTransports.length > 0 && (
//                             <div className="card mb-3">
//                               <div className="card-header  text-dark">
//                                 <h6 className="mb-0">Transportation</h6>
//                               </div>
//                               <div className="card-body">
//                                 {dayTransports.map((transport, idx) => {
//                                   const thisTransport =
//                                     transportData.data.data.find(
//                                       (item) =>
//                                         item.id == transport.transport_id
//                                     );

//                                   return (
//                                     <div
//                                       key={idx}
//                                       className="mb-3 pb-3 border-bottom"
//                                     >
//                                       <div className="row">
//                                         <div className="col-md-6">
//                                           <h6 className="fw-bold">
//                                             {thisTransport?.transport}
//                                           </h6>
//                                           <p className="mb-1">
//                                             <span className="text-muted">
//                                               Transporter:
//                                             </span>{" "}
//                                             {thisTransport?.company_name}
//                                           </p>
//                                           <p className="mb-1">
//                                             <span className="text-muted">
//                                               Vehicle Type:
//                                             </span>{" "}
//                                             {transport.v_type}
//                                           </p>
//                                           <p className="mb-1">
//                                             <span className="text-muted">
//                                               Location:
//                                             </span>{" "}
//                                             {getLocationDetails(
//                                               thisTransport?.destination_id
//                                             )}
//                                           </p>
//                                         </div>
//                                         <div className="col-md-6">
//                                           {thisTransport?.options?.length >
//                                             0 && (
//                                             <>
//                                               <p className="fw-bold">
//                                                 Options:
//                                               </p>
//                                               {thisTransport.options.map(
//                                                 (option, optIdx) => (
//                                                   <p
//                                                     key={optIdx}
//                                                     className="mb-1"
//                                                   >
//                                                     {option.type}: {option.rate}{" "}
//                                                     AED
//                                                   </p>
//                                                 )
//                                               )}
//                                             </>
//                                           )}
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}

//                           {daySightseeings.length > 0 && (
//                             <div className="card mb-3">
//                               <div className="card-header  text-dark">
//                                 <h6 className="mb-0">Sightseeing</h6>
//                               </div>
//                               <div className="card-body">
//                                 {daySightseeings.map((sightseeing, idx) => {
//                                   const thisSightseeing =
//                                     sightseeingData.data.data.find(
//                                       (item) =>
//                                         item.id == sightseeing.sightseeing_id
//                                     );

//                                   return (
//                                     <div
//                                       key={idx}
//                                       className="mb-3 pb-3 border-bottom"
//                                     >
//                                       <div className="row">
//                                         <div className="col-md-6">
//                                           <h6 className="fw-bold">
//                                             {thisSightseeing?.company_name}
//                                           </h6>
//                                           <p className="mb-1">
//                                             <span className="text-muted">
//                                               Description:
//                                             </span>{" "}
//                                             {thisSightseeing?.description}
//                                           </p>
//                                           <p className="mb-1">
//                                             <span className="text-muted">
//                                               Location:
//                                             </span>{" "}
//                                             {getLocationDetails(
//                                               thisSightseeing?.destination_id
//                                             )}
//                                           </p>
//                                         </div>
//                                         <div className="col-md-6">
//                                           <p>
//                                             <span className="text-muted">
//                                               Adult Rate:
//                                             </span>{" "}
//                                             {thisSightseeing?.rate_adult} AED
//                                           </p>
//                                           <p>
//                                             <span className="text-muted">
//                                               Child Rate:
//                                             </span>{" "}
//                                             {thisSightseeing?.rate_child} AED
//                                           </p>
//                                           <p className="fw-bold">
//                                             Total:{" "}
//                                             {sightseeing.adults *
//                                               thisSightseeing?.rate_adult +
//                                               (sightseeing.children *
//                                                 thisSightseeing?.rate_child ||
//                                                 0)}{" "}
//                                             AED
//                                           </p>
//                                         </div>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container py-4">
//       <h1 className="h3 mb-4">Itinerary</h1>
//       <div className="text-center">No data Found!</div>
//     </div>
//   );
// };

// export default Itinerary;

import { useState } from "react";
import { useParams } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { createDateArray } from "../functions/date";
import Loader from "../Loader";
import "../Loader.css";
import { useAuth } from "../context/AuthContext";
import TermsConditionsModal from "../components/TermsConditions";

const Itinerary = () => {
  const { id } = useParams();
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

  const { data, loading } = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? "showbookings"
        : `showbooking/${authUser.id}`
    }`,
    authToken
  );

  // For modal
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalData, setTermsModalData] = useState(null);
  const showTerms = (termsObj) => {
    setTermsModalData(termsObj);
    setTermsModalOpen(true);
  };

  const closeTerms = () => {
    setTermsModalOpen(false);
    setTermsModalData(null);
  };

  // Find booking item
  const items = data?.data?.filter((item) => {
    if (authUser.role === adminRole) {
      return item?.id == id;
    } else {
      return item.booking?.id == id;
    }
  });

  let item = null;
  if (items?.length >= 1) {
    item = authUser.role === adminRole ? items[0] : items[0].booking;
  }

  // Parse JSON safely
  const parseJSON = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  // Add parsed terms
  const parseDataWithTerms = (arr) =>
    arr.map((entry) => ({
      ...entry,
      terms_and_conditions_obj: entry.terms_and_conditions
        ? parseJSON(entry.terms_and_conditions)
        : null,
    }));

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
      <div className="container py-4">
        <h1 className="h3 mb-4">Itinerary</h1>
        <div className="text-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (item) {
    const ticketsRaw = parseJSON(item.ticket_info) || [];
    const transportsRaw = parseJSON(item.transport_info) || [];
    const sightseeingsRaw = parseJSON(item.sightseeing_info) || [];
    const tickets = parseDataWithTerms(ticketsRaw);

    const transports = parseDataWithTerms(transportsRaw);
    const sightseeings = parseDataWithTerms(sightseeingsRaw);

    const dates = createDateArray(item.travel_date_from, item.travel_date_to);
    const transportsDates = transports.map(({ date }) => date);
    const sightseeingsDates = sightseeings.map(({ date }) => date);
    const ticketsDates = tickets.map(({ date }) => date);

    const itinDates = dates.filter(
      (item) =>
        transportsDates.some((tDate) => tDate === item.date) ||
        sightseeingsDates.some((sDate) => sDate === item.date) ||
        ticketsDates.some((tDate) => tDate === item.date)
    );

    return (
      <div className="container py-4">
        <h1 className="h3 mb-4">Itinerary</h1>
        <div className="mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Trip Summary</h5>
              <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                <div className="col">
                  <div className="border p-2 rounded">
                    <p className="fw-bold mb-1 small">Travel Date</p>
                    <p className="mb-0">
                      {item.travel_date_from.split("T")[0]}
                    </p>
                  </div>
                </div>
                <div className="col">
                  <div className="border p-2 rounded">
                    <p className="fw-bold mb-1 small">Guest Name</p>
                    <p className="mb-0">
                      {item.customer_name}
                      <br />
                      {item.phone_no}
                    </p>
                  </div>
                </div>
                <div className="col">
                  <div className="border p-2 rounded">
                    <p className="fw-bold mb-1 small">Duration</p>
                    <p className="mb-0">
                      {
                        createDateArray(
                          item.travel_date_from,
                          item.travel_date_to
                        ).length
                      }{" "}
                      Days
                    </p>
                  </div>
                </div>
                <div className="col">
                  <div className="border p-2 rounded">
                    <p className="fw-bold mb-1 small">PAX</p>
                    <p className="mb-0">
                      {item.no_adults} Adults{" "}
                      {item.no_children >= 1 &&
                        `+ ${item.no_children} Children`}
                    </p>
                  </div>
                </div>
                <div className="col">
                  <div className="border p-2 rounded">
                    <p className="fw-bold mb-1 small">Payment Status</p>
                    <p className="mb-0">{item.payment_status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-body">
              {itinDates.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No activities scheduled</p>
                </div>
              ) : (
                <div>
                  {itinDates.map((day, i) => {
                    const dayTransports = transports.filter(
                      (t) => t.date === day.date
                    );
                    const daySightseeings = sightseeings.filter(
                      (s) => s.date === day.date
                    );
                    const dayTickets = tickets.filter(
                      (t) => t.date === day.date
                    );

                    return (
                      <div key={day.date} className="list-group-item mb-3">
                        <h5 className="mb-3">
                          Day {day.day} - {day.date}
                        </h5>
                        <div
                          className="overflow-auto"
                          style={{ maxHeight: "400px" }}
                        >
                          {/* Tickets */}
                          {dayTickets.length > 0 && (
                            <div className="card mb-3">
                              <div className="card-header text-dark d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Tickets</h6>
                              </div>
                              <div className="card-body">
                                {dayTickets.map((ticket, idx) => (
                                  <div
                                    key={idx}
                                    className="mb-3 pb-3 border-bottom"
                                  >
                                    <div className="row">
                                      <div className="col-md-6">
                                        <div className="d-flex align-items-center mb-1">
                                          <h6 className="fw-bold mb-0">
                                            {ticket.name}
                                          </h6>
                                          {ticket.terms_and_conditions_obj && (
                                            <button
                                              className="btn btn-info btn-sm ms-2"
                                              onClick={() =>
                                                showTerms(
                                                  ticket.terms_and_conditions_obj
                                                )
                                              }
                                              title="View Terms & Conditions"
                                            >
                                              i
                                            </button>
                                          )}
                                        </div>
                                        <p className="mb-1">
                                          <span className="text-muted">
                                            Category:
                                          </span>{" "}
                                          {ticket.category}
                                        </p>
                                        <p className="mb-1">
                                          <span className="text-muted">
                                            Time:
                                          </span>{" "}
                                          {ticket.time_slot}
                                        </p>
                                        <p className="mb-1">
                                          <span className="text-muted">
                                            Transfer:
                                          </span>{" "}
                                          {ticket.transfer_option}
                                        </p>
                                      </div>
                                      <div className="col-md-6">
                                        <p>
                                          <span className="text-muted">
                                            Adults:
                                          </span>{" "}
                                          {ticket.adults} × {ticket.adult_price}{" "}
                                          AED
                                        </p>
                                        <p>
                                          <span className="text-muted">
                                            Children:
                                          </span>{" "}
                                          {ticket.children} ×{" "}
                                          {ticket.child_price} AED
                                        </p>
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
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Transports */}
                          {dayTransports.length > 0 && (
                            <div className="card mb-3">
                              <div className="card-header text-dark">
                                <h6 className="mb-0">Private Transportation</h6>
                              </div>
                              <div className="card-body">
                                {dayTransports.map((transport, idx) => {
                                  const thisTransport =
                                    transportData.data.data.find(
                                      (item) =>
                                        item.id == transport.transport_id
                                    );
                                  return (
                                    <div
                                      key={idx}
                                      className="mb-3 pb-3 border-bottom"
                                    >
                                      <div className="row">
                                        <div className="col-md-6">
                                          <div className="d-flex align-items-center mb-1">
                                            <h6 className="fw-bold mb-0">
                                              {thisTransport?.transport}
                                            </h6>
                                            {transport.option_index !== "" &&
                                              transport.terms_and_conditions_obj && (
                                                <button
                                                  className="btn btn-info btn-sm ms-2"
                                                  onClick={() =>
                                                    showTerms(
                                                      transport.terms_and_conditions_obj
                                                    )
                                                  }
                                                  title="View Terms & Conditions"
                                                >
                                                  i
                                                </button>
                                              )}
                                          </div>
                                          <p className="mb-1">
                                            <span className="text-muted">
                                              Transporter:
                                            </span>{" "}
                                            {thisTransport?.company_name}
                                          </p>
                                          <p className="mb-1">
                                            <span className="text-muted">
                                              Vehicle Type:
                                            </span>{" "}
                                            {transport.v_type}
                                          </p>
                                          <p className="mb-1">
                                            <span className="text-muted">
                                              Location:
                                            </span>{" "}
                                            {getLocationDetails(
                                              thisTransport?.destination_id
                                            )}
                                          </p>
                                        </div>
                                        <div className="col-md-6">
                                          {thisTransport?.options?.length >
                                            0 && (
                                            <>
                                              <p className="fw-bold">
                                                Options:
                                              </p>
                                              {thisTransport.options.map(
                                                (option, optIdx) => (
                                                  <p
                                                    key={optIdx}
                                                    className="mb-1"
                                                  >
                                                    {option.type}: {option.rate}{" "}
                                                    AED
                                                  </p>
                                                )
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Sightseeings */}
                          {daySightseeings.length > 0 && (
                            <div className="card mb-3">
                              <div className="card-header text-dark">
                                <h6 className="mb-0">Sightseeing</h6>
                              </div>
                              <div className="card-body">
                                {daySightseeings.map((sightseeing, i) => {
                                  const thisSightseeing =
                                    sightseeingData.data.data.find(
                                      (s) => s.id == sightseeing.sightseeing_id
                                    );

                                  const adults = Number(sightseeing.adults);
                                  const childs = Number(sightseeing.children);
                                  const totalAdultRate =
                                    Number(thisSightseeing?.rate_adult || 0) +
                                    Number(
                                      thisSightseeing?.sharing_transfer_adult ||
                                        0
                                    );
                                  const totalChildRate =
                                    Number(thisSightseeing?.rate_child || 0) +
                                    Number(
                                      thisSightseeing?.sharing_transfer_child ||
                                        0
                                    );
                                  const totalAdultCost =
                                    adults * totalAdultRate;
                                  const totalChildCost =
                                    childs * totalChildRate;
                                  const total = totalAdultCost + totalChildCost;

                                  return (
                                    <div className="listing-card mb-4" key={i}>
                                      <div className="listing-card--head d-flex justify-content-between align-items-center">
                                        <p className="fw-bold lh-1 my-2">
                                          {sightseeing.date}
                                        </p>
                                        {sightseeing.terms_and_conditions_obj && (
                                          <button
                                            className="btn btn-info btn-sm"
                                            onClick={() =>
                                              showTerms(
                                                sightseeing.terms_and_conditions_obj
                                              )
                                            }
                                            title="View Terms & Conditions"
                                          >
                                            i
                                          </button>
                                        )}
                                      </div>
                                      <div className="listing-card--body">
                                        <div className="container px-4">
                                          <div className="row pb-2 border-bottom">
                                            <div className="col-12 col-sm-6">
                                              <p className="fw-bold">
                                                <span className="fw-normal">
                                                  Name:{" "}
                                                </span>
                                                {thisSightseeing?.company_name ||
                                                  "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Description:{" "}
                                                </span>
                                                {thisSightseeing?.description ||
                                                  "N/A"}
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Location:{" "}
                                                </span>
                                                {getLocationDetails(
                                                  thisSightseeing?.destination_id
                                                )}
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Address:{" "}
                                                </span>
                                                {thisSightseeing?.address ||
                                                  "N/A"}
                                              </p>
                                            </div>
                                            <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                                              <p>
                                                <span className="text-muted">
                                                  Adult Rate:{" "}
                                                </span>
                                                {thisSightseeing?.rate_adult ||
                                                  0}{" "}
                                                AED
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Child Rate:{" "}
                                                </span>
                                                {thisSightseeing?.rate_child ||
                                                  0}{" "}
                                                AED
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Sharing Transfer Adult Rate:{" "}
                                                </span>
                                                {thisSightseeing?.sharing_transfer_adult ||
                                                  0}{" "}
                                                AED
                                              </p>
                                              <p>
                                                <span className="text-muted">
                                                  Sharing Transfer Child Rate:{" "}
                                                </span>
                                                {thisSightseeing?.sharing_transfer_child ||
                                                  0}{" "}
                                                AED
                                              </p>
                                              <div className="mt-2 pt-2 border-top">
                                                <p>
                                                  {adults} Adults ×{" "}
                                                  {totalAdultRate} AED ={" "}
                                                  {totalAdultCost} AED
                                                </p>
                                                {childs >= 1 && (
                                                  <p>
                                                    {childs} Children ×{" "}
                                                    {totalChildRate} AED ={" "}
                                                    {totalChildCost} AED
                                                  </p>
                                                )}
                                                <p className="fw-bold">
                                                  Total: {total} AED
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms & Conditions Modal */}
        {termsModalOpen && (
          <TermsConditionsModal
            open={termsModalOpen}
            onClose={closeTerms}
            initialData={termsModalData}
            readOnly={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Itinerary</h1>
      <div className="text-center">No data Found!</div>
    </div>
  );
};

export default Itinerary;
