// import { useState } from "react";
// import { useParams } from "react-router-dom";
// import useApiData from "../hooks/useApiData";
// import { getDaysBetweenDates } from "../functions/date";
// import { useAuth } from "../context/AuthContext";
// import TermsConditionsModal from "../components/TermsConditions";

// const Summary = () => {
//   const { id } = useParams();

//   // User Data and API URLs
//   const base_url = import.meta.env.VITE_API_URL;
//   const { authUser, authToken } = useAuth();
//   const adminRole = "admin";

//   // Fetch relevant data
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

//   const { data, loading, error } = useApiData(
//     `${base_url}/api/${
//       authUser.role === adminRole
//         ? "showbookings"
//         : `showbooking/${authUser.id}`
//     }`,
//     authToken
//   );

//   // Modal state for Terms & Conditions
//   const [termsModalOpen, setTermsModalOpen] = useState(false);
//   const [currentTermsData, setCurrentTermsData] = useState(null);

//   // Filter and find current booking item
//   const items = data?.data?.filter((item) => {
//     if (authUser.role === adminRole) {
//       return item?.id == id;
//     } else {
//       return item.booking?.id == id;
//     }
//   });

//   let item = null;
//   if (items?.length >= 1) {
//     item = authUser.role === adminRole ? items[0] : items[0].booking;
//   }

//   // Parse JSON safely
//   const parseJSON = (str) => {
//     try {
//       return JSON.parse(str);
//     } catch {
//       return null;
//     }
//   };

//   // Add parsed terms to each item in array
//   const parseDataWithTerms = (arr) =>
//     arr.map((entry) => ({
//       ...entry,
//       terms_and_conditions_obj: entry.terms_and_conditions
//         ? parseJSON(entry.terms_and_conditions)
//         : null,
//     }));

//   // Function to get location details from destination_id
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

//   // Show Terms & Conditions modal
//   const showTerms = (terms) => {
//     setCurrentTermsData(terms);
//     setTermsModalOpen(true);
//   };

//   // Close modal handler
//   const closeTerms = () => {
//     setTermsModalOpen(false);
//     setCurrentTermsData(null);
//   };

//   if (
//     loading ||
//     transportData.loading ||
//     sightseeingData.loading ||
//     destinationsData.loading ||
//     countriesData.loading
//   ) {
//     return (
//       <>
//         <div className="title">Summary</div>
//         <section className="page-section">
//           <div className="px-2 py-2 px-md-4 text-center">Loading...</div>
//         </section>
//       </>
//     );
//   }

//   if (item) {
//     const ticketsRaw = parseJSON(item.ticket_info) || [];
//     const transportsRaw = parseJSON(item.transport_info) || [];
//     const sightseeingsRaw = parseJSON(item.sightseeing_info) || [];

//     // Attach parsed terms objects
//     const tickets = parseDataWithTerms(ticketsRaw);
//     const transports = parseDataWithTerms(transportsRaw);
//     const sightseeings = parseDataWithTerms(sightseeingsRaw);
//     return (
//       <>
//         <div className="title">Summary</div>
//         <section className="page-section">
//           <div className="px-2 py-2 px-md-4">
//             {/* Summary info */}
//             <div className="container-fluid">
//               <div className="title-line">
//                 <span>Summary</span>
//               </div>
//               <div className="row row-cols-1 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">
//                 <div className="col">
//                   <p className="fw-bold lh-1 mb-2">Travel Date</p>
//                   <p>{item.travel_date_from.split("T")[0]}</p>
//                 </div>
//                 <div className="col">
//                   <p className="fw-bold lh-1 mb-2">Guest Name</p>
//                   <p>
//                     {item.customer_name}
//                     <br />
//                     {item.phone_no}
//                   </p>
//                 </div>
//                 <div className="col">
//                   <p className="fw-bold lh-1 mb-2">Duration</p>
//                   <p>
//                     {getDaysBetweenDates(
//                       item.travel_date_from,
//                       item.travel_date_to
//                     )}{" "}
//                     Days
//                   </p>
//                 </div>
//                 <div className="col">
//                   <p className="fw-bold lh-1 mb-2">PAX</p>
//                   <p>
//                     {item.no_adults} Adults{" "}
//                     {item.no_children >= 1 && `+ ${item.no_children} Children`}
//                   </p>
//                 </div>
//                 <div className="col">
//                   <p className="fw-bold lh-1 mb-2">Confirmation Status</p>
//                   <p>{item.customer_status}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Tickets Section */}
//             {tickets.length > 0 && (
//               <div className="container-fluid mt-4">
//                 <div className="title-line">
//                   <span>Tickets</span>
//                 </div>
//                 <div className="listing-card-container">
//                   {tickets.map((ticket, i) => (
//                     <div className="listing-card mb-4" key={i}>
//                       <div className="listing-card--head d-flex align-items-center">
//                         <p className="fw-bold lh-1 my-2 flex-grow-1">
//                           {ticket.date}
//                         </p>
//                         {ticket.terms_and_conditions_obj && (
//                           <button
//                             className="btn btn-info btn-sm ms-2"
//                             onClick={() =>
//                               showTerms(ticket.terms_and_conditions_obj)
//                             }
//                             title="View Terms & Conditions"
//                           >
//                             i
//                           </button>
//                         )}
//                       </div>
//                       <div className="listing-card--body">
//                         <div className="container px-4">
//                           <div className="row pb-2 border-bottom">
//                             <div className="col-12 col-sm-6">
//                               <p className="fw-bold">{ticket.name}</p>
//                               <p>
//                                 <span className="text-muted">Category: </span>
//                                 {ticket.category}
//                               </p>
//                               <p>
//                                 <span className="text-muted">Time Slot: </span>
//                                 {ticket.time_slot}
//                               </p>
//                               <p>
//                                 <span className="text-muted">Transfer: </span>
//                                 {ticket.transfer_option || "N/A"}
//                               </p>
//                             </div>
//                             <div className="col-12 col-sm-6 mt-3 mt-sm-0">
//                               <p>
//                                 <span className="text-muted">Adults: </span>
//                                 {ticket.adults} × {ticket.adult_price} AED
//                               </p>
//                               <p>
//                                 <span className="text-muted">Children: </span>
//                                 {ticket.children} × {ticket.child_price} AED
//                               </p>
//                               <div className="mt-2 pt-2 border-top">
//                                 <p className="fw-bold">
//                                   Total:{" "}
//                                   {ticket.adults * ticket.adult_price +
//                                     ticket.children * ticket.child_price}{" "}
//                                   AED
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Private Transportations Section */}
//             {transports.length > 0 && (
//               <div className="container-fluid mt-4">
//                 <div className="title-line">
//                   <span>Private Transportations</span>
//                 </div>
//                 <div className="listing-card-container">
//                   {transports.map((transport, i) => {
//                     const thisTransport = transportData.data.data.find(
//                       (t) => t.id == transport.transport_id
//                     );

//                     return (
//                       <div className="listing-card mb-4" key={i}>
//                         <div className="listing-card--head d-flex justify-content-between align-items-center">
//                           <p className="fw-bold lh-1 my-2">{transport.date}</p>
//                           {transport.option_index !== "" &&
//                             transport.terms_and_conditions_obj && (
//                               <button
//                                 className="btn btn-info btn-sm"
//                                 onClick={() =>
//                                   showTerms(transport.terms_and_conditions_obj)
//                                 }
//                                 title="View Terms & Conditions"
//                               >
//                                 i
//                               </button>
//                             )}
//                         </div>
//                         <div className="listing-card--body">
//                           <div className="container px-4">
//                             <div className="row pb-2 border-bottom">
//                               <div className="col-12 col-sm-6">
//                                 <p className="fw-bold">
//                                   <span className="fw-normal">
//                                     Transporter:{" "}
//                                   </span>
//                                   {thisTransport?.company_name || "N/A"}
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">Vehicle: </span>
//                                   {thisTransport?.transport} (
//                                   {thisTransport?.vehicle_type})
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">Location: </span>
//                                   {getLocationDetails(
//                                     thisTransport?.destination_id
//                                   )}
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">Address: </span>
//                                   {thisTransport?.address || "N/A"}
//                                 </p>
//                               </div>
//                               <div className="col-12 col-sm-6 mt-3 mt-sm-0">
//                                 {thisTransport?.options?.length > 0 && (
//                                   <>
//                                     <p className="fw-bold">Options:</p>
//                                     {thisTransport.options.map(
//                                       (option, idx) => (
//                                         <p key={idx}>
//                                           {option.type}: {option.rate} AED
//                                         </p>
//                                       )
//                                     )}
//                                   </>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Sightseeings Section */}
//             {sightseeings.length > 0 && (
//               <div className="container-fluid mt-4">
//                 <div className="title-line">
//                   <span>Sharing transport</span>
//                 </div>
//                 <div className="listing-card-container">
//                   {sightseeings.map((sightseeing, i) => {
//                     const thisSightseeing = sightseeingData.data.data.find(
//                       (s) => s.id == sightseeing.sightseeing_id
//                     );
//                     const adults = Number(sightseeing.adults);
//                     const childs = Number(sightseeing.children);
//                     const totalAdultRate =
//                       Number(thisSightseeing.rate_adult) +
//                       Number(thisSightseeing.sharing_transfer_adult);
//                     const totalChildRate =
//                       Number(thisSightseeing.rate_child) +
//                       Number(thisSightseeing.sharing_transfer_child);
//                     const totalAdultCost = adults * totalAdultRate;
//                     const totalChildCost = childs * totalChildRate;
//                     const total = totalAdultCost + totalChildCost;
//                     return (
//                       <div className="listing-card mb-4" key={i}>
//                         <div className="listing-card--head d-flex justify-content-between align-items-center">
//                           <p className="fw-bold lh-1 my-2">
//                             {sightseeing.date}
//                           </p>
//                           {sightseeing.terms_and_conditions_obj && (
//                             <button
//                               className="btn btn-info btn-sm"
//                               onClick={() =>
//                                 showTerms(sightseeing.terms_and_conditions_obj)
//                               }
//                               title="View Terms & Conditions"
//                             >
//                               i
//                             </button>
//                           )}
//                         </div>
//                         <div className="listing-card--body">
//                           <div className="container px-4">
//                             <div className="row pb-2 border-bottom">
//                               <div className="col-12 col-sm-6">
//                                 <p className="fw-bold">
//                                   <span className="fw-normal">Name: </span>
//                                   {thisSightseeing?.company_name || "N/A"}
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">
//                                     Description:{" "}
//                                   </span>
//                                   {thisSightseeing?.description || "N/A"}
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">Location: </span>
//                                   {getLocationDetails(
//                                     thisSightseeing?.destination_id
//                                   )}
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">Address: </span>
//                                   {thisSightseeing?.address || "N/A"}
//                                 </p>
//                               </div>
//                               <div className="col-12 col-sm-6 mt-3 mt-sm-0">
//                                 <p>
//                                   <span className="text-muted">
//                                     Adult Rate:{" "}
//                                   </span>
//                                   {thisSightseeing?.rate_adult || 0} AED
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">
//                                     Child Rate:{" "}
//                                   </span>
//                                   {thisSightseeing?.rate_child || 0} AED
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">
//                                     Sharing Transfer Adult Rate:{" "}
//                                   </span>
//                                   {thisSightseeing?.sharing_transfer_adult || 0}{" "}
//                                   AED
//                                 </p>
//                                 <p>
//                                   <span className="text-muted">
//                                     Sharing Transfer Child Rate:{" "}
//                                   </span>
//                                   {thisSightseeing?.sharing_transfer_child || 0}{" "}
//                                   AED
//                                 </p>
//                                 <div className="mt-2 pt-2 border-top">
//                                   <p>
//                                     {adults} Adults × {totalAdultRate} AED ={" "}
//                                     {totalAdultCost} AED
//                                   </p>
//                                   {sightseeing.children >= 1 && (
//                                     <p>
//                                       {childs} Childrens × {totalChildRate} AED
//                                       = {totalChildCost} AED
//                                     </p>
//                                   )}
//                                   <p className="fw-bold">Total: {total} AED</p>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Terms & Conditions Modal */}
//             {termsModalOpen && (
//               <TermsConditionsModal
//                 open={termsModalOpen}
//                 onClose={closeTerms}
//                 initialData={currentTermsData}
//                 readOnly={true}
//               />
//             )}
//           </div>
//         </section>
//       </>
//     );
//   }

//   return (
//     <>
//       <div className="title">Whatsapp Customer</div>
//       <section className="page-section">
//         <div className="px-2 py-2 px-md-4 text-center">No data Found!</div>
//       </section>
//     </>
//   );
// };

// export default Summary;

import { useState } from "react";
import { useParams } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { getDaysBetweenDates } from "../functions/date";
import { useAuth } from "../context/AuthContext";
import TermsConditionsModal from "../components/TermsConditions";

const Summary = () => {
  const { id } = useParams();

  // User Data and API URLs
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const adminRole = "admin";

  // Fetch relevant data
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

  const { data, loading, error } = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? "showbookings"
        : `showbooking/${authUser.id}`
    }`,
    authToken
  );

  // Modal state
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [currentTermsData, setCurrentTermsData] = useState(null);

  // Filter and find current booking item
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

  // Add parsed terms to each item in array
  const parseDataWithTerms = (arr) =>
    arr.map((entry) => ({
      ...entry,
      terms_and_conditions_obj: entry.terms_and_conditions
        ? parseJSON(entry.terms_and_conditions)
        : null,
    }));

  // Function to get location details
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

  const showTerms = (terms) => {
    setCurrentTermsData(terms);
    setTermsModalOpen(true);
  };

  const closeTerms = () => {
    setTermsModalOpen(false);
    setCurrentTermsData(null);
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
          <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (item) {
    const ticketsRaw = parseJSON(item.ticket_info) || [];
    const transportsRaw = parseJSON(item.transport_info) || [];
    const sightseeingsRaw = parseJSON(item.sightseeing_info) || [];

    const tickets = parseDataWithTerms(ticketsRaw);
    const transports = parseDataWithTerms(transportsRaw);
    const sightseeings = parseDataWithTerms(sightseeingsRaw);

    return (
      <>
        <div className="title">Summary</div>
        <section className="page-section">
          <div className="container-fluid px-3 px-md-4 py-4">
            {/* --- Master Summary Card --- */}
            <div className="card shadow-sm border-0 mb-5 ">
              <div className="card-body p-4">
                <h5 className="card-title text-primary mb-4">
                  <i className="fa-solid fa-clipboard-list me-2"></i> Booking
                  Overview
                </h5>
                <div className="row g-4">
                  <div className="col-12 col-sm-6 col-md">
                    <div className="d-flex align-items-start">
                      <div className="me-3 text-primary">
                        <i className="fa-regular fa-calendar-days fa-lg"></i>
                      </div>
                      <div>
                        <small
                          className="text-muted d-block text-uppercase fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Travel Date
                        </small>
                        <span className="fw-semibold">
                          {item.travel_date_from.split("T")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <div className="d-flex align-items-start">
                      <div className="me-3 text-primary">
                        <i className="fa-regular fa-user fa-lg"></i>
                      </div>
                      <div>
                        <small
                          className="text-muted d-block text-uppercase fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Guest
                        </small>
                        <span className="fw-semibold d-block">
                          {item.customer_name}
                        </span>
                        <small className="text-muted">{item.phone_no}</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <div className="d-flex align-items-start">
                      <div className="me-3 text-primary">
                        <i className="fa-regular fa-clock fa-lg"></i>
                      </div>
                      <div>
                        <small
                          className="text-muted d-block text-uppercase fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Duration
                        </small>
                        <span className="fw-semibold">
                          {getDaysBetweenDates(
                            item.travel_date_from,
                            item.travel_date_to
                          )}{" "}
                          Days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <div className="d-flex align-items-start">
                      <div className="me-3 text-primary">
                        <i className="fa-solid fa-users fa-lg"></i>
                      </div>
                      <div>
                        <small
                          className="text-muted d-block text-uppercase fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          PAX
                        </small>
                        <span className="fw-semibold">
                          {item.no_adults} Adults
                          {item.no_children >= 1 &&
                            `, ${item.no_children} Kids`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-sm-6 col-md">
                    <div className="d-flex align-items-start">
                      <div className="me-3 text-primary">
                        <i className="fa-solid fa-check-circle fa-lg"></i>
                      </div>
                      <div>
                        <small
                          className="text-muted d-block text-uppercase fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Status
                        </small>
                        <span
                          className={`badge ${
                            item.customer_status === "confirmed"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {item.customer_status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Tickets Section --- */}
            {tickets.length > 0 && (
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle p-2 me-2 text-white d-flex justify-content-center align-items-center"
                    style={{ width: 32, height: 32 }}
                  >
                    <i className="fa-solid fa-ticket"></i>
                  </div>
                  <h5 className="m-0 fw-bold text-secondary">Tickets</h5>
                </div>

                <div className="row row-cols-1 g-4">
                  {tickets.map((ticket, i) => (
                    <div className="col" key={i}>
                      <div className="card shadow-sm border-0 h-100">
                        <div className="card-header border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                          <span className="badge  text-primary border border-primary">
                            <i className="fa-regular fa-calendar me-1"></i>{" "}
                            {ticket.date}
                          </span>
                          {ticket.terms_and_conditions_obj && (
                            <button
                              className="btn btn-info btn-sm text-white rounded-circle"
                              style={{ width: 30, height: 30, padding: 0 }}
                              onClick={() =>
                                showTerms(ticket.terms_and_conditions_obj)
                              }
                              title="Terms & Conditions"
                            >
                              <i className="fa-solid fa-info"></i>
                            </button>
                          )}
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-7 border-end-md">
                              <h5 className="card-title fw-bold mb-1">
                                {ticket.name}
                              </h5>
                              <div className="mb-2">
                                <span className="badge bg-secondary me-2">
                                  {ticket.category}
                                </span>
                                <span className="badge  text-dark border">
                                  <i className="fa-regular fa-clock me-1"></i>{" "}
                                  {ticket.time_slot}
                                </span>
                              </div>
                              {ticket.transfer_option && (
                                <p className="text-muted small mb-0">
                                  <i className="fa-solid fa-bus me-1"></i>{" "}
                                  Transfer: {ticket.transfer_option}
                                </p>
                              )}
                            </div>
                            <div className="col-md-5 d-flex flex-column justify-content-center mt-3 mt-md-0 ps-md-4">
                              <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>
                                  Adults ({ticket.adults} × {ticket.adult_price}
                                  )
                                </span>
                                <span>
                                  {ticket.adults * ticket.adult_price} AED
                                </span>
                              </div>
                              <div className="d-flex justify-content-between small text-muted mb-2">
                                <span>
                                  Children ({ticket.children} ×{" "}
                                  {ticket.child_price})
                                </span>
                                <span>
                                  {ticket.children * ticket.child_price} AED
                                </span>
                              </div>
                              <div className="d-flex justify-content-between border-top pt-2 fw-bold text-dark">
                                <span>Total</span>
                                <span>
                                  {ticket.adults * ticket.adult_price +
                                    ticket.children * ticket.child_price}{" "}
                                  AED
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- Transport Section --- */}
            {transports.length > 0 && (
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-primary rounded-circle p-2 me-2 text-white d-flex justify-content-center align-items-center"
                    style={{ width: 32, height: 32 }}
                  >
                    <i className="fa-solid fa-car"></i>
                  </div>
                  <h5 className="m-0 fw-bold text-secondary">
                    Private Transportations
                  </h5>
                </div>

                <div className="row row-cols-1 g-4">
                  {transports.map((transport, i) => {
                    const thisTransport = transportData.data.data.find(
                      (t) => t.id == transport.transport_id
                    );
                    console.log(thisTransport);
                    return (
                      <div className="col" key={i}>
                        <div className="card shadow-sm border-0 h-100">
                          <div className="card-header border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <span className="badge  text-primary border border-primary">
                              <i className="fa-regular fa-calendar me-1"></i>{" "}
                              {transport.date}
                            </span>
                            {transport.terms_and_conditions_obj && (
                              <button
                                className="btn btn-info btn-sm text-white rounded-circle"
                                style={{ width: 30, height: 30, padding: 0 }}
                                onClick={() =>
                                  showTerms(transport.terms_and_conditions_obj)
                                }
                                title="Terms & Conditions"
                              >
                                <i className="fa-solid fa-info"></i>
                              </button>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-7 border-end-md">
                                <h5 className="card-title fw-bold mb-1">
                                  {thisTransport?.company_name || "N/A"}
                                </h5>
                                <div className="text-muted small mb-2">
                                  {thisTransport?.transport}{" "}
                                  <span className="badge bg-secondary ms-1">
                                    {thisTransport?.vehicle_type}
                                  </span>
                                </div>
                                <p className="mb-1 small">
                                  <i className="fa-solid fa-location-dot me-2 text-danger"></i>
                                  {getLocationDetails(
                                    thisTransport?.destination_id
                                  )}
                                </p>
                                <p className="mb-0 small text-muted">
                                  <i className="fa-regular fa-map me-2"></i>
                                  {thisTransport?.address ||
                                    "Address not available"}
                                </p>
                              </div>
                              <div className="col-md-5 mt-3 mt-md-0 ps-md-4 rounded p-3">
                                {transport.option_index !== "" &&
                                thisTransport?.options?.[
                                  transport.option_index
                                ] ? (
                                  <>
                                    <h6 className="fw-bold small mb-2">
                                      Selected Option
                                    </h6>
                                    {(() => {
                                      const selectedOpt =
                                        thisTransport.options[
                                          transport.option_index
                                        ];
                                      return (
                                        <div className="small">
                                          <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted text-capitalize">
                                              {selectedOpt.transfer_type?.replace(
                                                /_/g,
                                                " "
                                              ) || "Transfer"}
                                            </span>
                                            <span className="fw-bold">
                                              {selectedOpt.rate} AED
                                            </span>
                                          </div>

                                          {selectedOpt.from &&
                                            selectedOpt.to && (
                                              <div className="p-2  rounded border">
                                                <div className="d-flex align-items-center text-muted">
                                                  <span
                                                    className="text-truncate"
                                                    style={{ maxWidth: "45%" }}
                                                    title={selectedOpt.from}
                                                  >
                                                    {selectedOpt.from}
                                                  </span>
                                                  <i
                                                    className="fa-solid fa-arrow-right mx-2 text-primary"
                                                    style={{
                                                      fontSize: "0.7rem",
                                                    }}
                                                  ></i>
                                                  <span
                                                    className="text-truncate"
                                                    style={{ maxWidth: "45%" }}
                                                    title={selectedOpt.to}
                                                  >
                                                    {selectedOpt.to}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  <small className="text-muted fst-italic">
                                    No specific option selected
                                  </small>
                                )}
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

            {/* --- Sightseeing Section --- */}
            {sightseeings.length > 0 && (
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-primary rounded-circle p-2 me-2 text-white d-flex justify-content-center align-items-center"
                    style={{ width: 32, height: 32 }}
                  >
                    <i className="fa-solid fa-binoculars"></i>
                  </div>
                  <h5 className="m-0 fw-bold text-secondary">
                    Sharing Transport
                  </h5>
                </div>

                <div className="row row-cols-1 g-4">
                  {sightseeings.map((sightseeing, i) => {
                    const thisSightseeing = sightseeingData.data.data.find(
                      (s) => s.id == sightseeing.sightseeing_id
                    );
                    const adults = Number(sightseeing.adults);
                    const childs = Number(sightseeing.children);
                    const totalAdultRate = Number(thisSightseeing.rate_adult);
                    const totalChildRate = Number(thisSightseeing.rate_child);
                    const totalAdultCost = adults * totalAdultRate;
                    const totalChildCost = childs * totalChildRate;
                    const total = totalAdultCost + totalChildCost;

                    return (
                      <div className="col" key={i}>
                        <div className="card shadow-sm border-0 h-100">
                          <div className="card-header border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <span className="badge  text-primary border border-primary">
                              <i className="fa-regular fa-calendar me-1"></i>{" "}
                              {sightseeing.date}
                            </span>
                            {sightseeing.terms_and_conditions_obj && (
                              <button
                                className="btn btn-info btn-sm text-white rounded-circle"
                                style={{ width: 30, height: 30, padding: 0 }}
                                onClick={() =>
                                  showTerms(
                                    sightseeing.terms_and_conditions_obj
                                  )
                                }
                                title="Terms & Conditions"
                              >
                                <i className="fa-solid fa-info"></i>
                              </button>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-7 border-end-md">
                                <h5 className="card-title fw-bold mb-2">
                                  {thisSightseeing?.company_name || "N/A"}
                                </h5>
                                <p className="text-muted small mb-2 fst-italic">
                                  "
                                  {thisSightseeing?.description ||
                                    "No description"}
                                  "
                                </p>
                                <p className="mb-1 small">
                                  <i className="fa-solid fa-location-dot me-2 text-danger"></i>
                                  {getLocationDetails(
                                    thisSightseeing?.destination_id
                                  )}
                                </p>
                                <p className="mb-0 small text-muted">
                                  <i className="fa-regular fa-map me-2"></i>
                                  {thisSightseeing?.address ||
                                    "Address not available"}
                                </p>
                              </div>
                              <div className="col-md-5 d-flex flex-column justify-content-center mt-3 mt-md-0 ps-md-4">
                                <div className="d-flex justify-content-between small text-muted mb-1">
                                  <span>
                                    Adults ({adults} × {totalAdultRate})
                                  </span>
                                  <span>{totalAdultCost} AED</span>
                                </div>
                                {sightseeing.children >= 1 && (
                                  <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>
                                      Children ({childs} × {totalChildRate})
                                    </span>
                                    <span>{totalChildCost} AED</span>
                                  </div>
                                )}
                                <div className="d-flex justify-content-between border-top pt-2 fw-bold text-dark">
                                  <span>Total</span>
                                  <span>{total} AED</span>
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

            {/* Terms & Conditions Modal */}
            {termsModalOpen && (
              <TermsConditionsModal
                open={termsModalOpen}
                onClose={closeTerms}
                initialData={currentTermsData}
                readOnly={true}
              />
            )}
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="title">Summary</div>
      <section className="page-section">
        <div className="d-flex flex-column justify-content-center align-items-center py-5 text-muted">
          <i className="fa-regular fa-folder-open fa-3x mb-3"></i>
          <h5>No Data Found</h5>
          <p>We couldn't find the booking details you requested.</p>
        </div>
      </section>
    </>
  );
};

export default Summary;
