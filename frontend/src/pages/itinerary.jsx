import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { createDateArray } from "../functions/date";
import Loader from "../Loader";
import "../Loader.css";
import { useAuth } from "../context/AuthContext";
import TermsConditionsModal from "../components/TermsConditions";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Itinerary = () => {
  const { id } = useParams();
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const adminRole = "admin";

  const pdfRef = useRef(); // Ref for PDF generation

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

  // PDF Export Function
  const handleDownloadPdf = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

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

    // --- HEADER SECTION ---
    pdf.setFontSize(24);
    pdf.setTextColor(25, 118, 210); // Primary blue
    pdf.text("TRAVEL ITINERARY", margin, yPosition);
    yPosition += 12;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      margin,
      yPosition
    );
    yPosition += 15;

    // --- GUEST INFORMATION ---
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, "bold");
    pdf.text("GUEST INFORMATION", margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    const guestInfo = [
      [`Name:`, item.customer_name],
      [`Phone:`, item.phone_no],
      [
        `Travel Date:`,
        `${item.travel_date_from.split("T")[0]} to ${
          item.travel_date_to.split("T")[0]
        }`,
      ],
      [
        `Duration:`,
        `${
          createDateArray(item.travel_date_from, item.travel_date_to).length
        } Days`,
      ],
      [
        `Guests:`,
        `${item.no_adults} Adults${
          item.no_children > 0 ? `, ${item.no_children} Children` : ""
        }`,
      ],
    ];

    guestInfo.forEach(([label, value]) => {
      pdf.setFont(undefined, "bold");
      pdf.text(label, margin, yPosition);
      pdf.setFont(undefined, "normal");
      const splitValue = pdf.splitTextToSize(value, maxWidth - 40);
      pdf.text(splitValue, margin + 35, yPosition);
      yPosition += 6;
    });

    yPosition += 8;

    // --- ITINERARY BY DAY ---
    pdf.setFontSize(12);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("DAY-BY-DAY ITINERARY", margin, yPosition);
    yPosition += 10;

    if (itinDates.length === 0) {
      pdf.setFontSize(10);
      pdf.setFont(undefined, "normal");
      pdf.text("No activities scheduled for this trip.", margin, yPosition);
      yPosition += 10;
    } else {
      itinDates.forEach((day) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        const dayTransports = transports.filter((t) => t.date === day.date);
        const daySightseeings = sightseeings.filter((s) => s.date === day.date);
        const dayTickets = tickets.filter((t) => t.date === day.date);

        // Day Header
        pdf.setFontSize(11);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(25, 118, 210);
        pdf.text(`Day ${day.day} - ${day.date}`, margin, yPosition);
        yPosition += 8;

        // --- TICKETS ---
        if (dayTickets.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(60, 60, 60);
          pdf.text("TICKETS", margin, yPosition);
          yPosition += 7;

          dayTickets.forEach((ticket) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.setFont(undefined, "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`• ${ticket.name}`, margin + 5, yPosition);
            yPosition += 5;

            pdf.setFont(undefined, "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);

            const ticketDetails = [];
            if (ticket.category)
              ticketDetails.push(`Category: ${ticket.category}`);
            if (ticket.time_slot)
              ticketDetails.push(`Time Slot: ${ticket.time_slot}`);
            if (ticket.start_time)
              ticketDetails.push(`Time: ${ticket.start_time}`);
            if (ticket.transfer_option)
              ticketDetails.push(`Transfer: ${ticket.transfer_option}`);

            ticketDetails.forEach((detail) => {
              pdf.text(detail, margin + 10, yPosition);
              yPosition += 4;
            });
            yPosition += 2;
          });

          yPosition += 3;
        }

        // --- PRIVATE TRANSPORT ---
        if (dayTransports.length > 0) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(60, 60, 60);
          pdf.text("PRIVATE TRANSPORTATION", margin, yPosition);
          yPosition += 7;

          dayTransports.forEach((transport) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }

            const thisTransport = transportData.data.data.find(
              (t) => t.id == transport.transport_id
            );

            pdf.setFont(undefined, "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.text(
              `• ${thisTransport?.company_name || "N/A"}`,
              margin + 5,
              yPosition
            );
            yPosition += 5;

            pdf.setFont(undefined, "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);

            const transportDetails = [
              `Vehicle: ${thisTransport?.transport} (${transport.v_type})`,
              `Location: ${getLocationDetails(thisTransport?.destination_id)}`,
            ];

            // Add transport option details
            if (
              transport.option_index !== "" &&
              thisTransport?.options?.[transport.option_index]
            ) {
              const opt = thisTransport.options[transport.option_index];
              const route =
                opt.from && opt.to
                  ? `${opt.from} → ${opt.to}`
                  : "Route not specified";
              transportDetails.push(
                `Transfer: ${opt.transfer_type?.replace(/_/g, " ")} (${route})`
              );
            }

            transportDetails.forEach((detail) => {
              const splitDetail = pdf.splitTextToSize(detail, maxWidth - 20);
              pdf.text(splitDetail, margin + 10, yPosition);
              yPosition += 4 * splitDetail.length;
            });

            yPosition += 2;
          });

          yPosition += 3;
        }

        // --- SIGHTSEEING ---
        if (daySightseeings.length > 0) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.setTextColor(60, 60, 60);
          pdf.text("Sharing Transport", margin, yPosition);
          yPosition += 7;

          daySightseeings.forEach((sightseeing) => {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }

            const thisSightseeing = sightseeingData.data.data.find(
              (s) => s.id == sightseeing.sightseeing_id
            );

            pdf.setFont(undefined, "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(0, 0, 0);
            pdf.text(
              `• ${thisSightseeing?.company_name || "N/A"}`,
              margin + 5,
              yPosition
            );
            yPosition += 5;

            pdf.setFont(undefined, "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);

            const sightseeingDetails = [
              `Activity: ${thisSightseeing?.description || "N/A"}`,
              `Location: ${getLocationDetails(
                thisSightseeing?.destination_id
              )}`,
              `Address: ${thisSightseeing?.address || "N/A"}`,
            ];

            sightseeingDetails.forEach((detail) => {
              const splitDetail = pdf.splitTextToSize(detail, maxWidth - 20);
              pdf.text(splitDetail, margin + 10, yPosition);
              yPosition += 4 * splitDetail.length;
            });

            yPosition += 2;
          });

          yPosition += 5;
        }
      });
    }

    // --- FOOTER ---
    yPosition = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      "Thank you for booking with us! For more details, contact our support team.",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Save PDF
    pdf.save(
      `Itinerary_${item.customer_name}_${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  if (
    loading ||
    transportData.loading ||
    sightseeingData.loading ||
    destinationsData.loading ||
    countriesData.loading
  ) {
    return (
      <div className="container py-5 text-center">
        <Loader />
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold text-primary m-0">
            <i className="fa-solid fa-route me-2"></i> Travel Itinerary
          </h2>
          <button className="btn btn-primary" onClick={handleDownloadPdf}>
            <i className="fa-solid fa-download me-2"></i> Download PDF
          </button>
        </div>

        <div ref={pdfRef} className=" p-4 rounded shadow-sm">
          {/* Header Section */}
          <div className="border-bottom pb-4 mb-4">
            <h1 className="h3 fw-bold mb-1">{item.customer_name}'s Trip</h1>
            <p className="text-muted mb-3">
              <i className="fa-solid fa-phone me-2"></i>
              {item.phone_no}
            </p>
            <div className="row g-3 text-muted small">
              <div className="col-auto">
                <i className="fa-regular fa-calendar me-2"></i>
                {item.travel_date_from.split("T")[0]} to{" "}
                {item.travel_date_to.split("T")[0]}
              </div>
              <div className="col-auto border-start ps-3">
                <i className="fa-solid fa-clock me-2"></i>
                {
                  createDateArray(item.travel_date_from, item.travel_date_to)
                    .length
                }{" "}
                Days
              </div>
              <div className="col-auto border-start ps-3">
                <i className="fa-solid fa-users me-2"></i>
                {item.no_adults} Adults{" "}
                {item.no_children > 0 && `, ${item.no_children} Children`}
              </div>
            </div>
          </div>

          {/* Timeline */}
          {itinDates.length === 0 ? (
            <div className="text-center py-5  rounded">
              <p className="text-muted m-0">
                No activities scheduled for this trip.
              </p>
            </div>
          ) : (
            <div className="position-relative ps-3">
              {/* Timeline Vertical Line */}
              <div
                className="position-absolute start-0 top-0 bottom-0 border-start border-2 border-light"
                style={{ left: "24px" }}
              ></div>

              {itinDates.map((day, i) => {
                const dayTransports = transports.filter(
                  (t) => t.date === day.date
                );
                const daySightseeings = sightseeings.filter(
                  (s) => s.date === day.date
                );
                const dayTickets = tickets.filter((t) => t.date === day.date);
                return (
                  <div key={day.date} className="mb-5 position-relative">
                    {/* Day Badge */}
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                        style={{ width: "48px", height: "48px", zIndex: 1 }}
                      >
                        {day.day}
                      </div>
                      <div className="ms-3">
                        <h5 className="fw-bold m-0">Day {day.day}</h5>
                        <small className="text-muted">{day.date}</small>
                      </div>
                    </div>

                    <div className="ms-5">
                      {/* Tickets Card */}
                      {dayTickets.length > 0 && (
                        <div className="card border-0 shadow-sm mb-3 ">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="fa-solid fa-ticket me-2"></i>Tickets
                            </h6>
                            {dayTickets.map((ticket, idx) => (
                              <div
                                key={idx}
                                className="mb-3 pb-3 border-bottom last-child-no-border"
                              >
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <p className="fw-bold mb-1">
                                      {ticket.name}
                                    </p>
                                    {ticket.start_time && (
                                      <span className="badge  text-secondary border">
                                        <i className="fa-regular fa-clock me-1"></i>
                                        {ticket.start_time}
                                      </span>
                                    )}
                                  </div>

                                  {/* Terms & Conditions Button */}
                                  {ticket.terms_and_conditions_obj && (
                                    <button
                                      className="btn btn-link p-0 text-muted"
                                      onClick={() =>
                                        showTerms(
                                          ticket.terms_and_conditions_obj
                                        )
                                      }
                                      title="View Terms & Conditions"
                                    >
                                      <i className="fa-solid fa-circle-info"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transport Card */}
                      {dayTransports.length > 0 && (
                        <div className="card border-0 shadow-sm mb-3 ">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="fa-solid fa-car me-2"></i>Private
                              Transport
                            </h6>
                            {dayTransports.map((transport, idx) => {
                              const thisTransport =
                                transportData.data.data.find(
                                  (t) => t.id == transport.transport_id
                                );
                              return (
                                <div
                                  key={idx}
                                  className="mb-3 pb-3 border-bottom last-child-no-border"
                                >
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                      <p className="fw-bold mb-1">
                                        {thisTransport?.company_name}
                                      </p>
                                      <small className="text-muted">
                                        {thisTransport?.transport} (
                                        {transport.v_type})
                                      </small>
                                    </div>
                                    {transport.option_index !== "" &&
                                      transport.terms_and_conditions_obj && (
                                        <button
                                          className="btn btn-link p-0 text-muted"
                                          onClick={() =>
                                            showTerms(
                                              transport.terms_and_conditions_obj
                                            )
                                          }
                                        >
                                          <i className="fa-solid fa-circle-info"></i>
                                        </button>
                                      )}
                                  </div>

                                  {/* Updated Option Display Logic */}
                                  {transport.option_index !== "" &&
                                    thisTransport?.options?.[
                                      transport.option_index
                                    ] && (
                                      <div className=" p-2 rounded border small">
                                        {(() => {
                                          const opt =
                                            thisTransport.options[
                                              transport.option_index
                                            ];
                                          return (
                                            <div>
                                              <div className="fw-semibold text-capitalize mb-1">
                                                {opt.transfer_type?.replace(
                                                  /_/g,
                                                  " "
                                                ) || "Transfer"}
                                              </div>
                                              {opt.from && opt.to && (
                                                <div className="text-muted d-flex align-items-center">
                                                  <span>{opt.from}</span>
                                                  <i
                                                    className="fa-solid fa-arrow-right mx-2 text-primary"
                                                    style={{
                                                      fontSize: "0.7em",
                                                    }}
                                                  ></i>
                                                  <span>{opt.to}</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}

                                  <div className="mt-2 small text-muted">
                                    <i className="fa-solid fa-location-dot me-1"></i>
                                    {getLocationDetails(
                                      thisTransport?.destination_id
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Sightseeing Card */}
                      {daySightseeings.length > 0 && (
                        <div className="card border-0 shadow-sm mb-3 ">
                          <div className="card-body">
                            <h6 className="fw-bold text-primary mb-3">
                              <i className="fa-solid fa-binoculars me-2"></i>
                              Sharing Transport
                            </h6>
                            {daySightseeings.map((sightseeing, idx) => {
                              const thisSightseeing =
                                sightseeingData.data.data.find(
                                  (s) => s.id == sightseeing.sightseeing_id
                                );
                              return (
                                <div
                                  key={idx}
                                  className="mb-3 pb-3 border-bottom last-child-no-border"
                                >
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <p className="fw-bold mb-1">
                                        {thisSightseeing?.company_name}
                                      </p>
                                      <p className="small text-muted mb-1">
                                        "{thisSightseeing?.description}"
                                      </p>
                                      <div className="small text-muted">
                                        <i className="fa-solid fa-location-dot me-1"></i>
                                        {getLocationDetails(
                                          thisSightseeing?.destination_id
                                        )}
                                      </div>
                                    </div>
                                    {sightseeing.terms_and_conditions_obj && (
                                      <button
                                        className="btn btn-link p-0 text-muted"
                                        onClick={() =>
                                          showTerms(
                                            sightseeing.terms_and_conditions_obj
                                          )
                                        }
                                      >
                                        <i className="fa-solid fa-circle-info"></i>
                                      </button>
                                    )}
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

          <div className="text-center mt-5 pt-4 border-top">
            <small className="text-muted">Thank you for booking with us!</small>
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
    <div className="container py-5 text-center">
      <div className="d-flex flex-column align-items-center justify-content-center text-muted">
        <i className="fa-regular fa-folder-open fa-3x mb-3"></i>
        <h3 className="h5">No Itinerary Found</h3>
        <p>We couldn't find the details for this itinerary.</p>
      </div>
    </div>
  );
};

export default Itinerary;
