import { useEffect, useState, useMemo } from "react";
import useApiData from "../hooks/useApiData";
import useSendData from "../hooks/useSendData";
import Loader from "../Loader";
import "../Loader.css";
import Alert from "../components/Alert";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { extractRates } from "../functions/utils"; // same as Add
import TermsConditionsModal from "../components/TermsConditions";
import BasicInfo from "../components/agent/calculator/BasicInfo";
import TransportInfo from "../components/agent/calculator/TransportInfo";
import SightseeingInfo from "../components/agent/calculator/SightseeingInfo";
import TicketInfo from "../components/agent/calculator/TicketInfo";
import PricingSummary from "../components/agent/calculator/PricingSummary";

const EditCalculator = () => {
  // const { bookingId } = useParams();
  // const base_url = import.meta.env.VITE_API_URL;
  // const { authUser, authToken } = useAuth();
  // const today = new Date().toISOString().split("T")[0]; // Fetch Data
  // const [termsModalOpen, setTermsModalOpen] = useState(false);
  // const [termsModalData, setTermsModalData] = useState(null);
  // const countriesData = useApiData(`${base_url}/api/countries`, authToken);
  // const destinationsData = useApiData(
  //   `${base_url}/api/getdestinations`,
  //   authToken
  // );
  // const transportData = useApiData(
  //   `${base_url}/api/transportations`,
  //   authToken
  // );
  // const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
  // const tickets = useApiData(`${base_url}/api/tickets`, authToken);
  // const taxesData = useApiData(`${base_url}/api/taxes`, authToken); // Booking Data
  // const bookingData = useApiData(
  //   `${base_url}/api/showbooking/${authUser.id}`,
  //   authToken
  // );
  // const bookingRecord = bookingData.data?.data?.find(
  //   (booking) => booking.booking?.id == bookingId
  // )?.booking;

  // const subFormData = useSendData(
  //   `${base_url}/api/editbooking/${bookingRecord?.id}`,
  //   authToken
  // ); // Default/memoized form object, matching Add/Calculator style

  // const defaultForm = useMemo(
  //   () => ({
  //     user_id: authUser.id,
  //     customer_name: "",
  //     phone_no: "",
  //     travel_date_from: "",
  //     travel_date_to: "",
  //     no_adults: 0,
  //     no_children: 0,
  //     ticket_info: [],
  //     transport_info: [],
  //     sightseeing_info: [],
  //     remarks: "",
  //     taxes: [],
  //     customer_status: "pending",
  //     payment_status: "unpaid",
  //     final_payment: "",
  //     total_per_adult: "",
  //     total_per_child: "",
  //   }),
  //   [authUser.id]
  // );

  // const [formData, setFormData] = useState({ ...defaultForm });
  // const [showTransportPrompt, setShowTransportPrompt] = useState(true);
  // const [showTicketPrompt, setShowTicketPrompt] = useState(true);
  // const [showSightseeingPrompt, setShowSightseeingPrompt] = useState(true); // Calculate values

  // const [calc, setCalc] = useState({
  //   total: 0,
  //   adultsTotal: 0,
  //   childrenTotal: 0,
  //   perAdult: 0,
  //   perChild: 0,
  //   taxAmount: 0,
  //   finalAmount: 0,
  // });

  // const [err, setErr] = useState(null);
  // const [success, setSuccess] = useState(false);
  // const [popUp, setPopUp] = useState(false);
  // const [toSubmit, setToSubmit] = useState(false); // Prefill on bookingData change (edit-specific)

  // useEffect(() => {
  //   if (bookingRecord) {
  //     console.log(bookingRecord);
  //     setFormData({
  //       user_id: authUser.id,
  //       customer_name: bookingRecord.customer_name || "",
  //       phone_no: bookingRecord.phone_no || "",
  //       travel_date_from: bookingRecord.travel_date_from?.split("T")[0] || "",
  //       travel_date_to: bookingRecord.travel_date_to?.split("T")[0] || "",
  //       no_adults: bookingRecord.no_adults || 0,
  //       no_children: bookingRecord.no_children || 0,
  //       ticket_info: JSON.parse(bookingRecord.ticket_info || "[]") || [],
  //       transport_info: JSON.parse(bookingRecord.transport_info || "[]") || [],
  //       sightseeing_info:
  //         JSON.parse(bookingRecord.sightseeing_info || "[]") || [],
  //       remarks: bookingRecord.remarks || "",
  //       taxes: JSON.parse(bookingRecord.taxes || "[]") || [],
  //       customer_status: bookingRecord.customer_status || "pending",
  //       payment_status: bookingRecord.payment_status || "unpaid",
  //       final_payment: bookingRecord.final_payment || "",
  //       total_per_adult: bookingRecord.total_per_adult || "",
  //       total_per_child: bookingRecord.total_per_child || "",
  //     });
  //     setShowTransportPrompt(
  //       (JSON.parse(bookingRecord.transport_info || "[]") || []).length === 0
  //     );
  //     setShowSightseeingPrompt(
  //       (JSON.parse(bookingRecord.sightseeing_info || "[]") || []).length === 0
  //     );
  //     setShowTicketPrompt(
  //       (JSON.parse(bookingRecord.ticket_info || "[]") || []).length === 0
  //     );
  //   }
  // }, [bookingData?.loading, bookingRecord]); // Populate taxes, if not already filled by prefill

  // useEffect(() => {
  //   if (taxesData.data?.data) {
  //     const taxes = [...taxesData.data.data];
  //     if (taxes.length > 0) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         taxes: taxes.map((tax) => ({
  //           tax_name: tax.name,
  //           tax_value: tax.percentage,
  //         })),
  //       }));
  //     }
  //   }
  // }, [taxesData.loading, taxesData.data?.data]); // Add Info
  // console.log(formData.taxes);
  // const handleAddInfo = (type) => {
  //   setToSubmit(false);
  //   switch (type) {
  //     case "transport":
  //       setShowTransportPrompt(false);
  //       setFormData((prev) => ({
  //         ...prev,
  //         transport_info: [
  //           ...prev.transport_info,
  //           {
  //             destination_id: "",
  //             transport_id: "",
  //             no_of_people: 0,
  //             date: "",
  //             transport_cost: 0,
  //           },
  //         ],
  //       }));
  //       break;
  //     case "sightseeing":
  //       setShowSightseeingPrompt(false);
  //       setFormData((prev) => ({
  //         ...prev,
  //         sightseeing_info: [
  //           ...prev.sightseeing_info,
  //           {
  //             destination_id: "",
  //             sightseeing_id: "",
  //             adults: 0,
  //             children: 0,
  //             date: "",
  //             adult_cost: 0,
  //             children_cost: 0,
  //             rate_adult: 0,
  //             rate_child: 0,
  //             sharing_transfer_adult: 0,
  //             sharing_transfer_child: 0,
  //           },
  //         ],
  //       }));
  //       break;
  //     case "ticket":
  //       setShowTicketPrompt(false);
  //       setFormData((prev) => ({
  //         ...prev,
  //         ticket_info: [
  //           ...prev.ticket_info,
  //           {
  //             id: "",
  //             name: "",
  //             category: [],
  //             start_time: "",
  //             ,
  //             adults: 0,
  //             children: 0,
  //             date: "",
  //             adult_price: 0,
  //             child_price: 0,
  //           },
  //         ],
  //       }));
  //       break;
  //     default:
  //       console.warn(`Unhandled type: ${type}`);
  //   }
  // }; // Delete Info

  // const handleDeleteInfo = (key, index) => {
  //   setToSubmit(false);
  //   const data = { ...formData };
  //   data[key].splice(index, 1);
  //   setFormData(data);
  //   if (key === "transport_info" && data[key].length === 0)
  //     setShowTransportPrompt(true);
  //   if (key === "sightseeing_info" && data[key].length === 0)
  //     setShowSightseeingPrompt(true);
  //   if (key === "ticket_info" && data[key].length === 0)
  //     setShowTicketPrompt(true);
  // }; // Handle flat field changes

  // const handleDataChange = ({ currentTarget }) => {
  //   setToSubmit(false);
  //   const { name, value } = currentTarget;
  //   let filteredValue = value;
  //   if (
  //     (name === "no_adults" ||
  //       name === "no_children" ||
  //       name === "no_of_people") &&
  //     value < 0
  //   )
  //     return;
  //   if (name === "travel_date_from") formData.travel_date_to = "";
  //   if (name === "phone_no") filteredValue = value.replace(/[^0-9]/g, "");
  //   setFormData((prev) => ({ ...prev, [name]: filteredValue }));
  // }; // Handle nested data changes, matches Add version for types/logic

  // const handleNestedDataChange = ({ currentTarget }, infoType, index) => {
  //   setToSubmit(false);
  //   const { name, value } = currentTarget;
  //   const data = { ...formData };
  //   if (infoType === "transport_info") {
  //     switch (name) {
  //       case "destination_id":
  //         data.transport_info[index].transport_id = "";
  //         data.transport_info[index].option_index = null;
  //         data.transport_info[index].transport_cost = 0;
  //         break;
  //       case "transport_id":
  //         data.transport_info[index].option_index = null;
  //         data.transport_info[index].transport_cost = 0;
  //         data.transport_info[index].v_type = transportData.data?.data?.find(
  //           (t) => t.id == value
  //         ).vehicle_type;
  //         break;
  //       case "option_index":
  //         const selectedTransport = transportData.data?.data?.find(
  //           (t) => t.id == data.transport_info[index].transport_id
  //         );
  //         if (selectedTransport && selectedTransport.options) {
  //           const selectedOption = selectedTransport.options[value];
  //           data.transport_info[index].transport_cost = selectedOption
  //             ? Number(selectedOption.rate)
  //             : 0;
  //           data.transport_info[index].terms_and_conditions =
  //             JSON.stringify(selectedTransport?.terms_and_conditions) || null;
  //         }
  //         break;
  //       default:
  //         data.transport_info[index][name] = value;
  //     }
  //   } else if (infoType === "sightseeing_info") {
  //     switch (name) {
  //       case "destination_id":
  //         data.sightseeing_info[index].sightseeing_id = "";
  //         data.sightseeing_info[index].rate_adult = 0;
  //         data.sightseeing_info[index].rate_child = 0;
  //         data.sightseeing_info[index].sharing_transfer_adult = 0;
  //         data.sightseeing_info[index].sharing_transfer_child = 0;
  //         break;
  //       case "sightseeing_id":
  //         const selectedSightseeing = sightseeingData.data?.data?.find(
  //           (s) => s.id == value
  //         );
  //         if (selectedSightseeing) {
  //           data.sightseeing_info[index].rate_adult = Number(
  //             selectedSightseeing.rate_adult
  //           );
  //           data.sightseeing_info[index].rate_child = Number(
  //             selectedSightseeing.rate_child
  //           );
  //           data.sightseeing_info[index].sharing_transfer_adult = Number(
  //             selectedSightseeing.sharing_transfer_adult
  //           );
  //           data.sightseeing_info[index].sharing_transfer_child = Number(
  //             selectedSightseeing.sharing_transfer_child
  //           );
  //           data.sightseeing_info[index].sightseeing_id = value;
  //           data.sightseeing_info[index].terms_and_conditions =
  //             JSON.stringify(selectedSightseeing?.terms_and_conditions) || null;
  //         }
  //         break;
  //       default:
  //         data.sightseeing_info[index][name] = value;
  //     }
  //   } else if (infoType === "ticket_info") {
  //     if (name === "id") {
  //       data.ticket_info[index] = {
  //         ...data.ticket_info[index],
  //         id: value,
  //         name: tickets.data?.data?.find((t) => t.id == value)?.name || "",
  //         category: [],
  //         start_time: "",
  //         adult_price: 0,
  //         child_price: 0,
  //         adults: 0,
  //         children: 0,
  //         ,
  //       };
  //     } else if (name === "category") {
  //       data.ticket_info[index] = {
  //         ...data.ticket_info[index],
  //         category: value,
  //         start_time: "",
  //         adult_price: 0,
  //         child_price: 0,
  //         ,
  //       };
  //     } else if (name === "start_time") {
  //       const selectedTicket = tickets.data?.data?.find(
  //         (t) => t.id == data.ticket_info[index].id
  //       );
  //       const rates = extractRates(value);
  //       const selectedTime = selectedTicket?.time_slots?.find(
  //         (slot) =>
  //           slot.slot == value ||
  //           (!slot.slot &&
  //             Number(slot.adult_price) === rates.adultRate &&
  //             Number(slot.child_price) === rates.childRate)
  //       );
  //       data.ticket_info[index] = {
  //         ...data.ticket_info[index],
  //         start_time: value,
  //         adult_price: Number(selectedTime.adult_price),
  //         child_price: Number(selectedTime.child_price),
  //         terms_and_conditions:
  //           JSON.stringify(selectedTicket?.terms_and_conditions) || null,
  //         ,
  //       };
  //     } else {
  //       data.ticket_info[index][name] = value; // Transfer option adjustment—implement more logic if needed (see add code)
  //     }
  //   }
  //   data[infoType][index][name] = value;
  //   setFormData(data);
  // }; // Calculation logic, matches Add/Calculator style

  // const handleCalculate = () => {
  //   if (!formData.customer_name) {
  //     setErr("Customer name field is required!");
  //     setSuccess(false);
  //     setPopUp(true);
  //     return;
  //   }
  //   if (!formData.phone_no) {
  //     setErr("Phone Number field is required!");
  //     setSuccess(false);
  //     setPopUp(true);
  //     return;
  //   }
  //   if (!formData.travel_date_from || !formData.travel_date_to) {
  //     setErr("Travelling dates are required!");
  //     setSuccess(false);
  //     setPopUp(true);
  //     return;
  //   }
  //   if (formData.no_adults < 1) {
  //     setErr("At least 1 adult is required!");
  //     setSuccess(false);
  //     setPopUp(true);
  //     return;
  //   }

  //   let transportAdults = 0,
  //     transportChildren = 0,
  //     sightseeingAdults = 0,
  //     sightseeingChildren = 0,
  //     ticketAdults = 0,
  //     ticketChildren = 0;

  //   formData.transport_info.forEach((transport) => {
  //     // Include transport cost directly since you have option_index selected
  //     transportAdults += Number(transport.transport_cost) || 0;
  //   });

  //   formData.sightseeing_info.forEach((sight) => {
  //     sightseeingAdults +=
  //       (Number(sight.rate_adult) || 0) * (sight.adults || 0);
  //     sightseeingChildren +=
  //       (Number(sight.rate_child) || 0) * (sight.children || 0);
  //     // Add sharing transfer cost if applicable, assuming it should be added once per person
  //     sightseeingAdults +=
  //       (Number(sight.sharing_transfer_adult) || 0) * (sight.adults || 0);
  //     sightseeingChildren +=
  //       (Number(sight.sharing_transfer_child) || 0) * (sight.children || 0);
  //   });

  //   formData.ticket_info.forEach((ticket) => {
  //     ticketAdults +=
  //       (Number(ticket.adult_price) || 0) * (Number(ticket.adults) || 0);
  //     ticketChildren +=
  //       (Number(ticket.child_price) || 0) * (Number(ticket.children) || 0);
  //   });
  //   const adultsTotal = transportAdults + sightseeingAdults + ticketAdults;
  //   const childrenTotal =
  //     transportChildren + sightseeingChildren + ticketChildren;

  //   const total = adultsTotal + childrenTotal;

  //   // Calculate tax
  //   let taxAmount = 0;
  //   formData.taxes.forEach((tax) => {
  //     taxAmount += total * (tax.tax_value / 100);
  //   });

  //   const finalAmount = total + taxAmount;

  //   const perAdult =
  //     formData.no_adults > 0 ? Math.round(adultsTotal / formData.no_adults) : 0;
  //   const perChild =
  //     formData.no_children > 0
  //       ? Math.round(childrenTotal / formData.no_children)
  //       : 0;

  //   setCalc({
  //     adultsTotal,
  //     childrenTotal,
  //     total,
  //     taxAmount,
  //     finalAmount,
  //     perAdult,
  //     perChild,
  //   });

  //   setToSubmit(true);
  // };

  // const handleShowTerms = (itemTerms) => {
  //   setTermsModalData(JSON.parse(itemTerms));
  //   setTermsModalOpen(true);
  // };

  // const handleCloseTerms = () => {
  //   setTermsModalOpen(false);
  //   setTermsModalData(null);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!(Number(calc.finalAmount) >= 1)) {
  //     setErr("Please make an appropriate package");
  //     setSuccess(false);
  //     setPopUp(true);
  //     return;
  //   }
  //   const data = { ...formData };
  //   data.ticket_info = data.ticket_info.map((tck) =>
  //     tck.category.length === 0 ? { ...tck, category: "" } : tck
  //   );
  //   data.final_payment = Number(calc.finalAmount);
  //   data.total_per_adult = Number(calc.perAdult);
  //   data.total_per_child = Number(calc.perChild);
  //   await subFormData.sendData(data);
  // }; // Success/Error UX

  // useEffect(() => {
  //   if (!subFormData.loading && subFormData.response) {
  //     setSuccess(subFormData.response?.success);
  //     if (subFormData.response?.success) {
  //       setToSubmit(false);
  //       setErr(subFormData.response?.message);
  //     } else {
  //       setErr(subFormData.response?.error);
  //     }
  //     setPopUp(true);
  //   }
  // }, [subFormData.loading, subFormData.response, defaultForm]);

  // if (bookingData.loading)
  //   return (
  //     <p>
  //       <Loader />
  //     </p>
  //   );
  // if (!bookingRecord)
  //   return <p className="title text-center">No records found for the agent!</p>;
  // if (bookingRecord.customer_status !== "pending")
  //   return <p className="title text-center">This customer can't be updated!</p>;
  const { bookingId } = useParams();
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
  const transportData = useApiData(
    `${base_url}/api/transportations`,
    authToken
  );
  const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
  const tickets = useApiData(`${base_url}/api/tickets`, authToken);
  const taxesData = useApiData(`${base_url}/api/taxes`, authToken);

  // Booking Data
  const bookingData = useApiData(
    `${base_url}/api/showbooking/${authUser.id}`,
    authToken
  );
  const bookingRecord = bookingData.data?.data?.find(
    (booking) => booking.booking?.id == bookingId
  )?.booking;
  console.log(bookingRecord);
  const subFormData = useSendData(
    `${base_url}/api/editbooking/${bookingRecord?.id}`,
    authToken
  );
  // Default form
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

  // Prefill Data
  useEffect(() => {
    if (bookingRecord) {
      setFormData({
        user_id: authUser.id,
        customer_name: bookingRecord.customer_name || "",
        phone_no: bookingRecord.phone_no || "",
        travel_date_from: bookingRecord.travel_date_from?.split("T")[0] || "",
        travel_date_to: bookingRecord.travel_date_to?.split("T")[0] || "",
        no_adults: bookingRecord.no_adults || 0,
        no_children: bookingRecord.no_children || 0,
        ticket_info: JSON.parse(bookingRecord.ticket_info || "[]") || [],
        transport_info: JSON.parse(bookingRecord.transport_info || "[]") || [],
        sightseeing_info:
          JSON.parse(bookingRecord.sightseeing_info || "[]") || [],
        remarks: bookingRecord.remarks || "",
        taxes: JSON.parse(bookingRecord.taxes || "[]") || [],
        customer_status: bookingRecord.customer_status || "pending",
        payment_status: bookingRecord.payment_status || "unpaid",
        final_payment: bookingRecord.final_payment || "",
        total_per_adult: bookingRecord.total_per_adult || "",
        total_per_child: bookingRecord.total_per_child || "",
      });

      // Check if arrays are empty to toggle prompts
      const tInfo = JSON.parse(bookingRecord.transport_info || "[]");
      const sInfo = JSON.parse(bookingRecord.sightseeing_info || "[]");
      const tkInfo = JSON.parse(bookingRecord.ticket_info || "[]");

      setShowTransportPrompt(!tInfo || tInfo.length === 0);
      setShowSightseeingPrompt(!sInfo || sInfo.length === 0);
      setShowTicketPrompt(!tkInfo || tkInfo.length === 0);
    }
  }, [bookingData?.loading, bookingRecord, authUser.id]);

  // Load Taxes if not present
  useEffect(() => {
    if (taxesData.data?.data && formData.taxes.length === 0) {
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

  // --- UPDATED: Add Info Logic (Matches Calculator.jsx) ---
  const handleAddInfo = (type) => {
    setToSubmit(false);

    // Get current counts from state for defaults
    const defaultAdults = Number(formData.no_adults) || 0;
    const defaultChildren = Number(formData.no_children) || 0;
    const totalPax = defaultAdults + defaultChildren;

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
              no_of_people: totalPax,
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
              adults: defaultAdults,
              children: defaultChildren,
              date: "",
              rate_adult: 0,
              rate_child: 0,
            },
          ],
        }));
        break;

      case "ticket":
        setShowTicketPrompt(false);
        setFormData((prev) => ({
          ...prev,
          ticket_info: [
            ...prev.ticket_info,
            {
              id: "",
              name: "",
              start_time: "",
              adults: defaultAdults,
              children: defaultChildren,
              date: "",
              adult_price: 0,
              child_price: 0,
            },
          ],
        }));
        break;

      default:
        console.warn(`Unhandled type: ${type}`);
    }
  };

  // --- Delete Info ---
  const handleDeleteInfo = (key, index) => {
    setToSubmit(false);
    const data = { ...formData };
    data[key].splice(index, 1);
    setFormData(data);

    if (key === "transport_info" && data[key].length === 0)
      setShowTransportPrompt(true);
    if (key === "sightseeing_info" && data[key].length === 0)
      setShowSightseeingPrompt(true);
    if (key === "ticket_info" && data[key].length === 0)
      setShowTicketPrompt(true);
  };

  // --- Handle Flat Fields ---
  const handleDataChange = ({ currentTarget }) => {
    setToSubmit(false);
    const { name, value } = currentTarget;
    let filteredValue = value;

    if (
      (name === "no_adults" ||
        name === "no_children" ||
        name === "no_of_people") &&
      value < 0
    ) {
      return;
    }

    if (name === "travel_date_from") {
      formData.travel_date_to = "";
    }

    if (name === "phone_no") {
      filteredValue = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
  };

  // --- Handle Nested Fields ---
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
          data.transport_info[index][name] = value;
      }
    } else if (infoType === "sightseeing_info") {
      switch (name) {
        case "destination_id":
          data.sightseeing_info[index].sightseeing_id = "";
          data.sightseeing_info[index].rate_adult = 0;
          data.sightseeing_info[index].rate_child = 0;
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
            data.sightseeing_info[index].sightseeing_id = value;
            data.sightseeing_info[index].terms_and_conditions =
              JSON.stringify(selectedSightseeing?.terms_and_conditions) || null;
          }
          break;
        default:
          data.sightseeing_info[index][name] = value;
      }
    } else if (infoType === "ticket_info") {
      if (name === "id") {
        const selectedTicket = tickets.data?.data?.find((t) => t.id == value);
        const isStartTimeExist = selectedTicket.time_slots.find(
          ({ start_time }) => start_time
        );
        data.ticket_info[index] = {
          ...data.ticket_info[index],
          id: value,
          name: selectedTicket?.name || "",
          has_time_slots: selectedTicket?.has_time_slots || 0,
          start_time: "",
          adult_price: !isStartTimeExist
            ? selectedTicket.time_slots[0].adult_price
            : 0,
          child_price: !isStartTimeExist
            ? selectedTicket.time_slots[0].child_price
            : 0,
          adults: data.ticket_info[index].adults || 0,
          children: data.ticket_info[index].children || 0,
        };
      } else if (name === "start_time") {
        const selectedTicket = tickets.data?.data?.find(
          (t) => t.id == data.ticket_info[index].id
        );
        const selectedTime = selectedTicket?.time_slots?.find(
          (slot) => slot.start_time == value
        );

        data.ticket_info[index] = {
          ...data.ticket_info[index],
          start_time: value,
          adult_price: Number(selectedTime?.adult_price || 0),
          child_price: Number(selectedTime?.child_price || 0),
          terms_and_conditions:
            JSON.stringify(selectedTicket?.terms_and_conditions) || null,
        };
      } else {
        data.ticket_info[index][name] = value;
      }
    } else {
      data[infoType][index][name] = value;
    }

    setFormData(data);
  };

  // --- Calculate Logic ---
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
      transportAdults += Number(transport.transport_cost) || 0;
    });

    formData.sightseeing_info.forEach((sight) => {
      sightseeingAdults +=
        (Number(sight.rate_adult) || 0) * (sight.adults || 0);
      sightseeingChildren +=
        (Number(sight.rate_child) || 0) * (sight.children || 0);
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

    let taxAmount = 0;
    formData.taxes.forEach((tax) => {
      taxAmount += total * (tax.tax_value / 100);
    });

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

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(Number(calc.finalAmount) >= 1)) {
      setErr("Please make an appropriate package");
      setSuccess(false);
      setPopUp(true);
      return;
    }

    const data = { ...formData };

    data.final_payment = Number(calc.finalAmount);
    data.total_per_adult = Number(calc.perAdult);
    data.total_per_child = Number(calc.perChild);

    await subFormData.sendData(data);
  };

  // Terms Handling
  const handleShowTerms = (itemTerms) => {
    let data = itemTerms;
    if (typeof itemTerms === "string") {
      try {
        data = JSON.parse(itemTerms);
      } catch (e) {
        data = {};
      }
    }
    setTermsModalData(data);
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
      } else {
        setErr(subFormData.response?.error);
      }
      setPopUp(true);
    }
  }, [subFormData.loading, subFormData.response]);

  if (bookingData.loading)
    return (
      <p>
        <Loader />
      </p>
    );
  if (!bookingRecord)
    return <p className="title text-center">No records found for the agent!</p>;
  if (bookingRecord.customer_status !== "pending")
    return <p className="title text-center">This customer can't be updated!</p>;

  return (
    <>
      <Alert open={popUp} handleClose={() => setPopUp(false)} success={success}>
        <p>{err}</p>
      </Alert>

      <div className="title">Update your package</div>
      <section className="page-section">
        <div>
          {/* 1. Basic Info Section */}
          <BasicInfo
            formData={formData}
            handleDataChange={handleDataChange}
            today={today}
          />

          {/* 2. Transport Section */}
          <TransportInfo
            formData={formData}
            showPrompt={showTransportPrompt}
            handleAdd={handleAddInfo}
            handleDelete={handleDeleteInfo}
            handleChange={handleNestedDataChange}
            handleShowTerms={handleShowTerms}
            destinationsData={destinationsData}
            transportData={transportData}
            countriesData={countriesData}
            adults={formData.no_adults}
            childs={formData.no_children}
          />

          {/* 3. Sightseeing Section */}
          <SightseeingInfo
            formData={formData}
            showPrompt={showSightseeingPrompt}
            handleAdd={handleAddInfo}
            handleDelete={handleDeleteInfo}
            handleChange={handleNestedDataChange}
            handleShowTerms={handleShowTerms}
            destinationsData={destinationsData}
            sightseeingData={sightseeingData}
            countriesData={countriesData}
            adults={formData.no_adults}
            childs={formData.no_children}
          />

          {/* 4. Ticket Section */}
          <TicketInfo
            formData={formData}
            showPrompt={showTicketPrompt}
            setShowPrompt={setShowTicketPrompt}
            handleAdd={handleAddInfo}
            handleDelete={handleDeleteInfo}
            handleChange={handleNestedDataChange}
            handleShowTerms={handleShowTerms}
            tickets={tickets}
            adults={formData.no_adults}
            childs={formData.no_children}
          />

          {/* Terms Modal (Global) */}
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

          {/* 5. Pricing Section (Only shows when calculated) */}
          {toSubmit && <PricingSummary calc={calc} />}

          {/* Action Buttons */}
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
                Update Package
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
export default EditCalculator;
