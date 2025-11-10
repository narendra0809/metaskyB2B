import { useEffect, useState, useMemo } from "react";
import useApiData from "../hooks/useApiData";
import useSendData from "../hooks/useSendData";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";
import { extractRates } from "../functions/utils";
import TermsConditionsModal from "../components/TermsConditions";

const primeSlots = [
  "3:30 PM - 4:00 PM",
  "4:00 PM - 4:30 PM",
  "4:30 PM - 5:00 PM",
  "5:00 PM - 5:30 PM",
  "5:30 PM - 6:00 PM",
  "6:00 PM - 6:30 PM",
  "6:30 PM - 7:00 PM",
];

const nonPrimeSlots = [
  "7:30 AM - 8:00 AM",
  "8:00 AM - 8:30 AM",
  "8:30 AM - 9:00 AM",
  "11:00 AM - 11:30 AM",
];

const Calculator = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalData, setTermsModalData] = useState(null);
  // Fetch Data
  const countriesData = useApiData(`${base_url}/api/countries`, authToken);
  const destinationsData = useApiData(
    `${base_url}/api/getdestinations`,
    authToken
  );
  // const hotelsData = useApiData(`${base_url}/api/hotels`, authToken);
  const transportData = useApiData(
    `${base_url}/api/transportations`,
    authToken
  );
  const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
  const taxesData = useApiData(`${base_url}/api/taxes`, authToken);
  const subFormData = useSendData(`${base_url}/api/addbooking`, authToken);
  const tickets = useApiData(`${base_url}/api/tickets`, authToken);

  // Memoize the default form object
  const defaultForm = useMemo(
    () => ({
      user_id: authUser.id,
      customer_name: "",
      phone_no: "",
      travel_date_from: "",
      travel_date_to: "",
      no_adults: 0,
      no_children: 0,
      ticket_info: [],
      transport_info: [],
      sightseeing_info: [],
      remarks: "",
      taxes: [],
      customer_status: "pending",
      payment_status: "unpaid",
      final_payment: "",
      total_per_adult: "",
      total_per_child: "",
    }),
    [authUser.id]
  );

  const [formData, setFormData] = useState({ ...defaultForm });
  const [showTransportPrompt, setShowTransportPrompt] = useState(true);
  const [showTicketPrompt, setShowTicketPrompt] = useState(true);
  const [showSightseeingPrompt, setShowSightseeingPrompt] = useState(true);
  console.log(formData.transport_info);
  // Calculate values
  const [calc, setCalc] = useState({
    total: 0,
    adultsTotal: 0,
    childrenTotal: 0,
    perAdult: 0,
    perChild: 0,
    taxAmount: 0,
    finalAmount: 0,
  });

  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [popUp, setPopUp] = useState(false);
  const [toSubmit, setToSubmit] = useState(false);

  useEffect(() => {
    if (taxesData.data?.data) {
      const taxes = [...taxesData.data.data];
      setFormData((prev) => ({
        ...prev,
        taxes: taxes.map((tax) => ({
          tax_name: tax.name,
          tax_value: tax.percentage,
        })),
      }));
    }
  }, [taxesData.loading, taxesData.data?.data]);

  // Add Info functions
  const handleAddInfo = (type) => {
    setToSubmit(false);
    switch (type) {
      case "transport":
        setShowTransportPrompt(false);
        setFormData((prev) => ({
          ...prev,
          transport_info: [
            ...prev.transport_info,
            {
              destination_id: "",
              transport_id: "",
              no_of_people: 0,
              date: "",
              transport_cost: 0,
            },
          ],
        }));
        break;
      case "sightseeing":
        setShowSightseeingPrompt(false);
        setFormData((prev) => ({
          ...prev,
          sightseeing_info: [
            ...prev.sightseeing_info,
            {
              destination_id: "",
              sightseeing_id: "",
              adults: 0,
              children: 0,
              date: "",
              adult_cost: 0,
              children_cost: 0,
            },
          ],
        }));
        break;
      case "ticket":
        setShowTicketPrompt(false);
        if (!formData.ticket_info || formData.ticket_info.length === 0) {
          setFormData((prev) => ({
            ...prev,
            ticket_info: [
              ...(prev.ticket_info || []),
              {
                time_slot: "",
                transfer_option: "",
                adults: 0,
                children: 0,
              },
            ],
          }));
        }
        break;
      default:
        console.warn(`Unhandled type: ${type}`);
    }
  };

  // Delete Info functions
  const handleDeleteInfo = (key, index) => {
    setToSubmit(false);
    const data = { ...formData };
    data[key].splice(index, 1);
    setFormData(data);

    // Show prompt again if all items are deleted
    if (key === "transport_info" && data[key].length === 0) {
      setShowTransportPrompt(true);
    }
    if (key === "sightseeing_info" && data[key].length === 0) {
      setShowSightseeingPrompt(true);
    }
    if (key === "ticket_info" && data[key].length === 0) {
      setShowTicketPrompt(true);
    }
  };

  // Handle Data Change
  const handleDataChange = ({ currentTarget }) => {
    setToSubmit(false);
    const { name, value } = currentTarget;
    let filteredValue = value;

    if (
      (name == "no_adults" ||
        name == "no_children" ||
        name == "no_of_people") &&
      value < 0
    ) {
      return;
    }

    if (name == "travel_date_from") {
      formData.travel_date_to = "";
    }

    switch (name) {
      case "phone_no":
        filteredValue = value.replace(/[^0-9]/g, "");
        break;
      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
  };

  const handleNestedDataChange = ({ currentTarget }, infoType, index) => {
    setToSubmit(false);
    const { name, value } = currentTarget;
    const data = { ...formData };
    if (infoType === "transport_info") {
      switch (name) {
        case "destination_id":
          data.transport_info[index].transport_id = "";
          data.transport_info[index].option_index = null;
          data.transport_info[index].transport_cost = 0;
          break;
        case "transport_id":
          data.transport_info[index].option_index = null;
          data.transport_info[index].transport_cost = 0;
          data.transport_info[index].v_type = transportData.data?.data?.find(
            (t) => t.id == value
          ).vehicle_type;
          break;
        case "option_index":
          const selectedTransport = transportData.data?.data?.find(
            (t) => t.id == data.transport_info[index].transport_id
          );
          if (selectedTransport && selectedTransport.options) {
            const selectedOption = selectedTransport.options[value];
            data.transport_info[index].transport_cost = selectedOption
              ? Number(selectedOption.rate)
              : 0;
            data.transport_info[index].terms_and_conditions =
              JSON.stringify(selectedTransport?.terms_and_conditions) || null;
          }
          break;
        default:
          console.warn(`Unhandled case in transport_info: ${name}`);
          break;
      }
    } else if (infoType === "sightseeing_info") {
      switch (name) {
        case "destination_id":
          data.sightseeing_info[index].sightseeing_id = "";
          data.sightseeing_info[index].rate_adult = 0;
          data.sightseeing_info[index].rate_child = 0;
          data.sightseeing_info[index].sharing_transfer_adult = 0;
          data.sightseeing_info[index].sharing_transfer_child = 0;
          break;
        case "sightseeing_id":
          const selectedSightseeing = sightseeingData.data?.data?.find(
            (s) => s.id == value
          );
          if (selectedSightseeing) {
            data.sightseeing_info[index].rate_adult = Number(
              selectedSightseeing.rate_adult
            );
            data.sightseeing_info[index].rate_child = Number(
              selectedSightseeing.rate_child
            );
            data.sightseeing_info[index].sharing_transfer_adult = Number(
              selectedSightseeing.sharing_transfer_adult
            );
            data.sightseeing_info[index].sharing_transfer_child = Number(
              selectedSightseeing.sharing_transfer_child
            );
            data.sightseeing_info[index].sightseeing_id = value;
            data.sightseeing_info[index].terms_and_conditions =
              JSON.stringify(selectedSightseeing?.terms_and_conditions) || null;
          }
          break;
        default:
          console.warn(`Unhandled case in sightseeing_info: ${name}`);
          break;
      }
    } else if (infoType === "ticket_info") {
      if (name === "id") {
        data.ticket_info[index] = {
          ...data.ticket_info[index],
          id: value,
          name: tickets.data?.data?.find((t) => t.id == value)?.name || "",
          category: [],
          time_slot: "",
          adult_price: 0,
          child_price: 0,
          adults: 0,
          children: 0,
          transfer_option: "",
        };
      } else if (name === "category") {
        data.ticket_info[index] = {
          ...data.ticket_info[index],
          category: value,
          time_slot: "",
          adult_price: 0,
          child_price: 0,
          transfer_option: "",
        };
      } else if (name === "time_slot") {
        const selectedTicket = tickets.data?.data?.find(
          (t) => t.id == data.ticket_info[index].id
        );
        const rates = extractRates(value);
        const selectedTime = selectedTicket?.time_slots?.find(
          (slot) =>
            slot.slot == value ||
            (!slot.slot &&
              Number(slot.adult_price) === rates.adultRate &&
              Number(slot.child_price) === rates.childRate)
        );

        data.ticket_info[index] = {
          ...data.ticket_info[index],
          time_slot: value,
          adult_price: Number(selectedTime.adult_price),
          child_price: Number(selectedTime.child_price),
          terms_and_conditions:
            JSON.stringify(selectedTicket?.terms_and_conditions) || null,
          transfer_option: "",
        };
      } else {
        data.ticket_info[index][name] = value;

        // Calculate prices when transfer option is selected (if applicable)
        if (name === "transfer_option") {
          const selectedTicket = tickets.data?.data?.find(
            (t) => t.id === data.ticket_info[index].id
          );
          // Find transfer option prices if available in your data model (adjust if needed)
          // Assuming transfer_option may modify price here similar to old logic
          // This part depends on how transfer prices come with tickets
        }
      }
    }
    data[infoType][index][name] = value;
    setFormData(data);
  };
  // Updated Calculate function to sum values considering new data structure
  const handleCalculate = () => {
    if (!formData.customer_name) {
      setErr("Customer name field is required!");
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (!formData.phone_no) {
      setErr("Phone Number field is required!");
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (!formData.travel_date_from || !formData.travel_date_to) {
      setErr("Travelling dates are required!");
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (formData.no_adults < 1) {
      setErr("At least 1 adult is required!");
      setSuccess(false);
      setPopUp(true);
      return;
    }

    let transportAdults = 0,
      transportChildren = 0,
      sightseeingAdults = 0,
      sightseeingChildren = 0,
      ticketAdults = 0,
      ticketChildren = 0;

    formData.transport_info.forEach((transport) => {
      // Include transport cost directly since you have option_index selected
      transportAdults += Number(transport.transport_cost) || 0;
    });

    formData.sightseeing_info.forEach((sight) => {
      sightseeingAdults +=
        (Number(sight.rate_adult) || 0) * (sight.adults || 0);
      sightseeingChildren +=
        (Number(sight.rate_child) || 0) * (sight.children || 0);
      // Add sharing transfer cost if applicable, assuming it should be added once per person
      sightseeingAdults +=
        (Number(sight.sharing_transfer_adult) || 0) * (sight.adults || 0);
      sightseeingChildren +=
        (Number(sight.sharing_transfer_child) || 0) * (sight.children || 0);
    });

    formData.ticket_info.forEach((ticket) => {
      ticketAdults +=
        (Number(ticket.adult_price) || 0) * (Number(ticket.adults) || 0);
      ticketChildren +=
        (Number(ticket.child_price) || 0) * (Number(ticket.children) || 0);
    });
    const adultsTotal = transportAdults + sightseeingAdults + ticketAdults;
    const childrenTotal =
      transportChildren + sightseeingChildren + ticketChildren;

    const total = adultsTotal + childrenTotal;

    // Calculate tax
    let taxAmount = 0;
    formData.taxes.forEach((tax) => {
      taxAmount += total * (tax.tax_value / 100);
    });
    console.log(formData.taxes);
    const finalAmount = total + taxAmount;

    const perAdult =
      formData.no_adults > 0 ? Math.round(adultsTotal / formData.no_adults) : 0;
    const perChild =
      formData.no_children > 0
        ? Math.round(childrenTotal / formData.no_children)
        : 0;

    setCalc({
      adultsTotal,
      childrenTotal,
      total,
      taxAmount,
      finalAmount,
      perAdult,
      perChild,
    });

    setToSubmit(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(Number(calc.finalAmount) >= 1)) {
      setErr("Please make an appropriate package");
      setSuccess(false);
      setPopUp(true);
      return;
    }

    const data = { ...formData };
    data.ticket_info = data.ticket_info.map((tck) =>
      tck.category.length === 0 ? { ...tck, category: "" } : tck
    );
    data.final_payment = Number(calc.finalAmount);
    data.total_per_adult = Number(calc.perAdult);
    data.total_per_child = Number(calc.perChild);
    console.log("Data to be sent: ", data);
    const result = await subFormData.sendData(data);
    console.log("Response from server : ", result);
  };

  const handleShowTerms = (itemTerms) => {
    setTermsModalData(JSON.parse(itemTerms));
    setTermsModalOpen(true);
  };

  const handleCloseTerms = () => {
    setTermsModalOpen(false);
    setTermsModalData(null);
  };

  useEffect(() => {
    if (!subFormData.loading && subFormData.response) {
      setSuccess(subFormData.response?.success);

      if (subFormData.response?.success) {
        setToSubmit(false);
        setErr(subFormData.response?.message);
        setFormData({ ...defaultForm });
      } else {
        setErr(subFormData.response?.error);
      }

      setPopUp(true);
    }
  }, [subFormData.loading, subFormData.response, defaultForm]);

  return (
    <>
      <Alert open={popUp} handleClose={() => setPopUp(false)} success={success}>
        <p>{err}</p>
      </Alert>
      <>
        <div className="title">Make your package</div>
        <section className="page-section">
          <div>
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Basic info</span>
              </div>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                {/* Basic Inputs (Customer name, phone, dates, adults, children) */}
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="customer_number" className="fw-bold">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    id="customer_number"
                    className="form-control mt-1"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleDataChange}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="phone_no" className="fw-bold">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone_no"
                    className="form-control mt-1"
                    maxLength={10}
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleDataChange}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="travel_date_from" className="fw-bold">
                    Travel Date From
                  </label>
                  <input
                    type="date"
                    id="travel_date_from"
                    className="form-control mt-1 text-white"
                    min={today}
                    name="travel_date_from"
                    value={formData.travel_date_from}
                    onChange={handleDataChange}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="travel_date_to" className="fw-bold">
                    Travel Date To
                  </label>
                  <input
                    type="date"
                    id="travel_date_to"
                    className="form-control mt-1"
                    name="travel_date_to"
                    min={formData.travel_date_from}
                    value={formData.travel_date_to}
                    onChange={handleDataChange}
                    disabled={!formData.travel_date_from}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="no_adults" className="fw-bold">
                    Adults
                  </label>
                  <input
                    id="no_adults"
                    type="number"
                    className="form-control mt-1"
                    name="no_adults"
                    value={formData.no_adults}
                    onChange={handleDataChange}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="no_children" className="fw-bold">
                    Children
                  </label>
                  <input
                    type="number"
                    id="no_children"
                    className="form-control mt-1"
                    name="no_children"
                    value={formData.no_children}
                    onChange={handleDataChange}
                  />
                </div>
              </div>
            </div>

            {/* Transport Info */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Transport info</span>
              </div>

              {showTransportPrompt && (
                <div
                  className="mb-3 p-3 rounded"
                  style={{ border: "1px solid #16acbf" }}
                >
                  <p className="mb-2 fw-bold">
                    Do you need transportation services for your trip?
                  </p>
                  <button
                    className="btn btn-main"
                    onClick={() => handleAddInfo("transport")}
                  >
                    <i className="fas fa-car me-2"></i> Add Transport
                  </button>
                </div>
              )}

              {formData.transport_info.length > 0 &&
                formData.transport_info.map((item, index) => (
                  <div className="mb-3" key={index}>
                    <div className="d-flex align-items-center justify-content-between column-gap-3">
                      <h5 className="fs-6 fw-bold">Transport {index + 1}</h5>
                      <div className="d-flex gap-3">
                        <button
                          className="btn btn-danger rounded-circle"
                          onClick={() =>
                            handleDeleteInfo("transport_info", index)
                          }
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                        {item.option_index !== null &&
                          item.option_index !== undefined &&
                          item.option_index !== "" && (
                            <button
                              className="btn btn-info rounded-circle"
                              title="View Terms & Conditions"
                              onClick={() =>
                                handleShowTerms(item.terms_and_conditions || {})
                              }
                            >
                              <i className="fa-solid fa-info"></i>
                            </button>
                          )}
                      </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                      {/* Destination */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="destination_id" className="fw-bold">
                          City
                        </label>
                        <select
                          id="destination_id"
                          className="form-control mt-1"
                          name="destination_id"
                          value={item.destination_id}
                          onChange={(e) =>
                            handleNestedDataChange(e, "transport_info", index)
                          }
                          disabled={
                            !formData.travel_date_from ||
                            !formData.travel_date_to ||
                            formData.no_adults < 1
                          }
                        >
                          <option value="">-- select --</option>
                          {!destinationsData.loading &&
                            destinationsData.data?.destinations?.map((dest) => (
                              <option key={dest.id} value={dest.id}>
                                {countriesData.data?.cities.find(
                                  (city) => city.id == dest.city_id
                                )?.name || "N/A"}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Transport company */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="transport_id" className="fw-bold">
                          Transport
                        </label>
                        <select
                          id="transport_id"
                          className="form-control mt-1"
                          name="transport_id"
                          value={item.transport_id}
                          onChange={(e) =>
                            handleNestedDataChange(e, "transport_info", index)
                          }
                          disabled={!item.destination_id}
                        >
                          <option value="">-- select --</option>
                          {transportData.data?.data
                            ?.filter(
                              (transport) =>
                                transport.destination_id == item.destination_id
                            )
                            .map((transport) => (
                              <option key={transport.id} value={transport.id}>
                                {transport.transport || "N/A"}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col mb-3 mb-md-4">
                        <label
                          htmlFor="v_type"
                          className="fw-bold d-block mb-1"
                        >
                          Vehicle Capacity
                        </label>
                        <select
                          id="v_type"
                          className="form-control mt-1"
                          name="v_type"
                          disabled
                        >
                          <option value="">{item.v_type}</option>
                        </select>
                      </div>

                      {/* Option selection */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="option_index" className="fw-bold">
                          Transfer Options
                        </label>
                        <select
                          id="option_index"
                          className="form-control mt-1"
                          name="option_index"
                          value={
                            item.option_index !== null &&
                            item.option_index !== undefined
                              ? String(item.option_index)
                              : ""
                          }
                          onChange={(e) =>
                            handleNestedDataChange(e, "transport_info", index)
                          }
                          disabled={!item.transport_id}
                        >
                          <option value="">-- select --</option>
                          {transportData.data?.data
                            ?.find((t) => t.id == item.transport_id)
                            ?.options.map((option, i) => (
                              <option key={i} value={String(i)}>
                                {option.from || "N/A"} → {option.to || "N/A"}{" "}
                                AED {option.rate} /- ({option.transfer_type})
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="date" className="fw-bold">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          className="form-control mt-1"
                          min={formData.travel_date_from}
                          max={formData.travel_date_to}
                          name="date"
                          value={item.date}
                          onChange={(e) =>
                            handleNestedDataChange(e, "transport_info", index)
                          }
                          disabled={
                            !formData.travel_date_from ||
                            !formData.travel_date_to
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

              {formData.transport_info.length > 0 && (
                <button
                  className="btn btn-info"
                  onClick={() => handleAddInfo("transport")}
                >
                  Add Another Transport
                </button>
              )}
            </div>

            {/* Sightseeing Info */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Sightseeing info</span>
              </div>

              {showSightseeingPrompt && (
                <div
                  className="mb-3 p-3 rounded"
                  style={{ border: "1px solid #16acbf" }}
                >
                  <p className="mb-2 fw-bold">
                    Would you like to add any sightseeing activities?
                  </p>
                  <button
                    className="btn btn-main"
                    onClick={() => handleAddInfo("sightseeing")}
                  >
                    <i className="fas fa-binoculars me-2"></i> Add Sightseeing
                  </button>
                </div>
              )}

              {formData.sightseeing_info.length > 0 &&
                formData.sightseeing_info.map((item, index) => (
                  <div className="mb-3" key={index}>
                    <div className="d-flex align-items-center justify-content-between column-gap-3">
                      <h5 className="fs-6 fw-bold">Sightseeing {index + 1}</h5>
                      <div className="d-flex gap-3">
                        <button
                          className="btn btn-danger rounded-circle"
                          onClick={() =>
                            handleDeleteInfo("sightseeing_info", index)
                          }
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                        {item.sightseeing_id && (
                          <button
                            className="btn btn-info rounded-circle"
                            title="View Terms & Conditions"
                            onClick={() =>
                              handleShowTerms(item.terms_and_conditions || {})
                            }
                          >
                            <i className="fa-solid fa-info"></i>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                      {/* Destination */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="destination_id" className="fw-bold">
                          City
                        </label>
                        <select
                          id="destination_id"
                          className="form-control mt-1"
                          name="destination_id"
                          value={item.destination_id}
                          onChange={(e) =>
                            handleNestedDataChange(e, "sightseeing_info", index)
                          }
                          disabled={
                            !formData.travel_date_from ||
                            !formData.travel_date_to ||
                            formData.no_adults < 1
                          }
                        >
                          <option value="">-- select --</option>
                          {!destinationsData.loading &&
                            destinationsData.data?.destinations?.map((dest) => (
                              <option key={dest.id} value={dest.id}>
                                {countriesData.data?.cities.find(
                                  (city) => city.id == dest.city_id
                                )?.name || "N/A"}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Sightseeing */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="sightseeing_id" className="fw-bold">
                          Sightseeing
                        </label>
                        <select
                          id="sightseeing_id"
                          className="form-control mt-1"
                          name="sightseeing_id"
                          value={item.sightseeing_id}
                          onChange={(e) =>
                            handleNestedDataChange(e, "sightseeing_info", index)
                          }
                          disabled={!item.destination_id}
                        >
                          <option value="">-- select --</option>
                          {sightseeingData.data?.data
                            ?.filter(
                              (sight) =>
                                sight.destination_id == item.destination_id
                            )
                            .map((sight) => (
                              <option key={sight.id} value={sight.id}>
                                {sight.company_name || "N/A"}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* No of adults */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="adults" className="fw-bold">
                          No Of Adult
                        </label>
                        <input
                          type="number"
                          id="adults"
                          className="form-control mt-1"
                          name="adults"
                          value={item.adults}
                          onChange={(e) =>
                            handleNestedDataChange(e, "sightseeing_info", index)
                          }
                          disabled={!item.sightseeing_id}
                        />
                      </div>

                      {/* No of children */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="children" className="fw-bold">
                          No Of Children
                        </label>
                        <input
                          id="children"
                          className="form-control mt-1"
                          name="children"
                          value={item.children}
                          onChange={(e) =>
                            handleNestedDataChange(e, "sightseeing_info", index)
                          }
                          disabled={!item.sightseeing_id}
                        />
                      </div>
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="adults" className="fw-bold">
                          Adult Rate
                        </label>
                        <input
                          type="number"
                          className="form-control mt-1"
                          value={item.rate_adult}
                          disabled
                        />
                      </div>
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="adults" className="fw-bold">
                          Child Rate
                        </label>
                        <input
                          type="number"
                          className="form-control mt-1"
                          value={item.rate_child}
                          disabled
                        />
                      </div>
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="adults" className="fw-bold">
                          Sharing Transfer Adult Rate
                        </label>

                        <input
                          type="number"
                          className="form-control mt-1"
                          value={item.sharing_transfer_adult}
                          disabled
                        />
                      </div>
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="adults" className="fw-bold">
                          Sharing Transfer Child Rate
                        </label>

                        <input
                          type="number"
                          className="form-control mt-1"
                          value={item.sharing_transfer_child}
                          disabled
                        />
                      </div>

                      {/* Date */}
                      <div className="col mb-3 mb-md-4">
                        <label htmlFor="date" className="fw-bold">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          className="form-control mt-1"
                          min={formData.travel_date_from}
                          max={formData.travel_date_to}
                          name="date"
                          value={item.date}
                          onChange={(e) =>
                            handleNestedDataChange(e, "sightseeing_info", index)
                          }
                          disabled={
                            !formData.travel_date_from ||
                            !formData.travel_date_to
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

              {formData.sightseeing_info.length > 0 && (
                <button
                  className="btn btn-info"
                  onClick={() => handleAddInfo("sightseeing")}
                >
                  Add Another Sightseeing
                </button>
              )}
            </div>

            {/* Tickets */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Tickets</span>
              </div>

              {showTicketPrompt ? (
                <div
                  className="mb-3 p-3 rounded"
                  style={{ border: "1px solid #16acbf" }}
                >
                  <p className="mb-2 fw-bold">
                    Would you like to add any tickets to your package?
                  </p>
                  <button
                    className="btn btn-main"
                    onClick={() => {
                      setShowTicketPrompt(false);
                      if (
                        !formData.ticket_info ||
                        formData.ticket_info.length === 0
                      ) {
                        handleAddInfo("ticket");
                      }
                    }}
                  >
                    <i className="fas fa-ticket me-2"></i> Add Ticket
                  </button>
                </div>
              ) : (
                <>
                  {formData.ticket_info?.length > 0 ? (
                    formData.ticket_info.map((item, index) => (
                      <div className="mb-3" key={index}>
                        <div className="d-flex align-items-center justify-content-between column-gap-3">
                          <h5 className="fs-6 fw-bold">Ticket {index + 1}</h5>
                          <div className="d-flex gap-3">
                            <button
                              className="btn btn-danger rounded-circle"
                              onClick={() =>
                                handleDeleteInfo("ticket_info", index)
                              }
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                            {item.time_slot && (
                              <button
                                className="btn btn-info rounded-circle"
                                title="View Terms & Conditions"
                                onClick={() =>
                                  handleShowTerms(
                                    item.terms_and_conditions || {}
                                  )
                                }
                              >
                                <i className="fa-solid fa-info"></i>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                          {/* Ticket */}
                          <div className="col mb-3 mb-md-4">
                            <label
                              htmlFor={`ticket_${index}`}
                              className="fw-bold"
                            >
                              Ticket
                            </label>
                            <select
                              id={`ticket_${index}`}
                              className="form-control mt-1"
                              name="id"
                              value={item.id}
                              onChange={(e) =>
                                handleNestedDataChange(e, "ticket_info", index)
                              }
                            >
                              <option value="">-- Select Ticket --</option>
                              {tickets.data?.data?.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                  {ticket.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Category */}
                          {item.id && (
                            <div className="col mb-3 mb-md-4">
                              <label
                                htmlFor={`category_${index}`}
                                className="fw-bold"
                              >
                                Category
                              </label>
                              <select
                                id={`category_${index}`}
                                className="form-control mt-1"
                                name="category"
                                value={item.category}
                                onChange={(e) =>
                                  handleNestedDataChange(
                                    e,
                                    "ticket_info",
                                    index
                                  )
                                }
                              >
                                <option value="">-- Select Category --</option>
                                {tickets.data?.data
                                  ?.find((t) => t.id == item.id)
                                  ?.category?.map((cat, catIndex) => (
                                    <option key={catIndex} value={cat}>
                                      {cat}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          {/* Time Slot */}
                          {item.category && (
                            <div className="col mb-3 mb-md-4">
                              <label
                                htmlFor={`time_slot_${index}`}
                                className="fw-bold"
                              >
                                Time Slot
                              </label>
                              <select
                                id={`time_slot_${index}`}
                                className="form-control mt-1"
                                name="time_slot"
                                value={item.time_slot}
                                onChange={(e) =>
                                  handleNestedDataChange(
                                    e,
                                    "ticket_info",
                                    index
                                  )
                                }
                              >
                                <option value="">-- Select Time Slot --</option>
                                {tickets.data?.data
                                  ?.find((t) => t.id == item.id)
                                  ?.time_slots // ?.filter((slot) =>
                                  //   item.category == "Prime"
                                  //     ? primeSlots.includes(slot.slot)
                                  //     : nonPrimeSlots.includes(slot.slot)
                                  // )
                                  ?.map((slot, i) => (
                                    <option key={i} value={slot.slot}>
                                      {slot.slot} (Adult: {slot.adult_price},
                                      Child: {slot.child_price})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          )}

                          <div className="col mb-3 mb-md-4">
                            <label
                              htmlFor={`ticket_adults_${index}`}
                              className="fw-bold"
                            >
                              No. of Adults
                            </label>
                            <input
                              type="number"
                              id={`ticket_adults_${index}`}
                              className="form-control mt-1"
                              name="adults"
                              value={item.adults}
                              onChange={(e) =>
                                handleNestedDataChange(e, "ticket_info", index)
                              }
                              min="0"
                            />
                          </div>

                          <div className="col mb-3 mb-md-4">
                            <label
                              htmlFor={`ticket_children_${index}`}
                              className="fw-bold"
                            >
                              No. of Children
                            </label>
                            <input
                              type="number"
                              id={`ticket_children_${index}`}
                              className="form-control mt-1"
                              name="children"
                              value={item.children}
                              onChange={(e) =>
                                handleNestedDataChange(e, "ticket_info", index)
                              }
                              min="0"
                            />
                          </div>
                          <div className="col mb-3 mb-md-4">
                            <label
                              htmlFor={`ticket_date_${index}`}
                              className="fw-bold"
                            >
                              Date
                            </label>
                            <input
                              type="date"
                              id={`ticket_date_${index}`}
                              className="form-control mt-1"
                              name="date"
                              value={item.date}
                              onChange={(e) =>
                                handleNestedDataChange(e, "ticket_info", index)
                              }
                              min={formData.travel_date_from}
                              max={formData.travel_date_to}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="mb-3 p-3 rounded"
                      style={{ border: "1px solid #16acbf" }}
                    >
                      <p className="mb-2 fw-bold">
                        Would you like to add any tickets to your package?
                      </p>
                      <button
                        className="btn btn-main"
                        onClick={() => handleAddInfo("ticket")}
                      >
                        <i className="fas fa-ticket me-2"></i> Add Ticket
                      </button>
                    </div>
                  )}

                  {formData.ticket_info?.length > 0 && (
                    <button
                      className="btn btn-info"
                      onClick={() => handleAddInfo("ticket")}
                    >
                      Add Another Ticket
                    </button>
                  )}
                </>
              )}
            </div>

            {termsModalOpen && (
              <TermsConditionsModal
                open={termsModalOpen}
                onClose={handleCloseTerms}
                initialData={termsModalData}
                readOnly={true}
              />
            )}

            {/* Remarks */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="row row-cols-1">
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="remarks" className="fw-bold">
                    Remarks
                  </label>
                  <textarea
                    className="form-control"
                    style={{ resize: "vertical" }}
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleDataChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pricing Display */}
            {toSubmit && (
              <div className="px-2 py-2 px-md-4 mb-4">
                <div className="title-line">
                  <span>Pricing</span>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                  <div className="col mb-3 mb-md-4">Adult's Total:-</div>
                  <div className="col mb-3 mb-md-4">{calc.adultsTotal}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                  <div className="col mb-3 mb-md-4">Children's Total:-</div>
                  <div className="col mb-3 mb-md-4">{calc.childrenTotal}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                  <div className="col mb-3 mb-md-4">Per Adult:-</div>
                  <div className="col mb-3 mb-md-4">{calc.perAdult}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                  <div className="col mb-3 mb-md-4">Per Children:-</div>
                  <div className="col mb-3 mb-md-4">{calc.perChild}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                  <div className="col mb-3 mb-md-4">Total:-</div>
                  <div className="col mb-3 mb-md-4">{calc.total}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                  <div className="col mb-3 mb-md-4">Taxed Amount:-</div>
                  <div className="col mb-3 mb-md-4">{calc.taxAmount}/-</div>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                  <div className="col mb-3 mb-md-4">Final Payment:-</div>
                  <div className="col mb-3 mb-md-4">{calc.finalAmount}/-</div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="px-2 py-2 px-md-4 mb-4">
              {!toSubmit ? (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleCalculate}
                >
                  Calculate
                </button>
              ) : (
                <button
                  className="btn btn-main"
                  type="button"
                  onClick={handleSubmit}
                >
                  Make Package
                </button>
              )}
            </div>
          </div>
        </section>
      </>
    </>
  );
};

export default Calculator;
