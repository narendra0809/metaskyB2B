import { useEffect, useState, useMemo } from 'react';
import useApiData from '../hooks/useApiData';
import { useAuth } from '../context/authContext';
import useSendData from '../hooks/useSendData';
import Alert from '../components/alert';

const Calculator = () => {
  const base_url = process.env.REACT_APP_API_URL;
  const { authUser , authToken } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  // Fetch Data
  const countriesData = useApiData(`${base_url}/api/countries`, authToken);
  const destinationsData = useApiData(
    `${base_url}/api/getdestinations`,
    authToken
  );
  const hotelsData = useApiData(`${base_url}/api/hotels`, authToken);
  const transportData = useApiData(`${base_url}/api/transportations`, authToken);
  const sightseeingData = useApiData(`${base_url}/api/sightseeings`, authToken);
  const taxesData = useApiData(`${base_url}/api/taxes`, authToken);
  const subFormData = useSendData(`${base_url}/api/addbooking`, authToken);

  // Memoize the default form object
  const defaultForm = useMemo(() => ({
    user_id: authUser.id,
    customer_name: '',
    phone_no: '',
    travel_date_from: '',
    travel_date_to: '',
    no_adults: 0,
    no_children: 0,
    hotel_info: [
      {
        destination_id: '',
        hotel_id: '',
        room_type: '',
        rooms: 0,
        ex_adults: 0,
        ex_children: 0,
        check_in: '',
        check_out: '',
        room_type_cost: 0,
        ex_adult_cost: 0,
        ex_children_cost: 0,
        meals: [],
      },
    ],
    transport_info: [
      {
        destination_id: '',
        transport_id: '',
        v_type: '',
        date: '',
        transport_cost: 0,
      },
    ],
    sightseeing_info: [
      {
        destination_id: '',
        sightseeing_id: '',
        adults: 0,
        children: 0,
        date: '',
        adult_cost: 0,
        children_cost: 0,
      },
    ],
    remarks: '',
    taxes: [],
    customer_status: 'pending',
    payment_status: 'unpaid',
    final_payment: '',
    total_per_adult: '',
    total_per_child: '',
  }), [authUser.id]); // Memoize based on authUser .id

  const [formData, setFormData] = useState({ ...defaultForm });

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
      if (taxes) {
        taxes.forEach((tax) => {
          setFormData((prev) => ({
            ...prev,
            taxes: [
              ...prev.taxes,
              { tax_name: tax.name, tax_value: tax.percentage },
            ],
          }));
        });
      }
    }
  }, [taxesData.loading, taxesData.data?.data]);

  // Add Info functions
  const handleAddInfo = (type) => {
    setToSubmit(false);
    switch (type) {
      case 'hotel':
        setFormData((prev) => ({
          ...prev,
          hotel_info: [
            ...prev.hotel_info,
            {
              destination_id: '',
              hotel_id: '',
              room_type: '',
              rooms: 0,
              ex_adults: 0,
              ex_children: 0,
              check_in: '',
              check_out: '',
              room_type_cost: 0,
              ex_adult_cost: 0,
              ex_children_cost: 0,
            },
          ],
        }));
        break;
      case 'transport':
        setFormData((prev) => ({
          ...prev,
          transport_info: [
            ...prev.transport_info,
            {
              destination_id: '',
              transport_id: '',
              no_of_people: 0,
              date: '',
              transport_cost: 0,
            },
          ],
        }));
        break;
      case 'sightseeing':
        setFormData((prev) => ({
          ...prev,
          sightseeing_info: [
            ...prev.sightseeing_info,
            {
              destination_id: '',
              sightseeing_id: '',
              adults: 0,
              children: 0,
              date: '',
              adult_cost: 0,
              children_cost: 0,
            },
          ],
        }));
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
  };

  // Handle Data Change
  const handleDataChange = ({ currentTarget }) => {
    setToSubmit(false);
    const { name, value } = currentTarget;
    let filteredValue = value;

    if (name === 'travel_date_from') {
      formData.travel_date_to = '';
    }

    switch (name) {
      case 'phone_no':
        filteredValue = value.replace(/[^0-9]/g, '');
        break;
      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
  };

  // Handle Nested Data Change
  const handleNestedDataChange = ({ currentTarget }, infoType, index) => {
    setToSubmit(false);
    const { name, value } = currentTarget;
    const data = { ...formData };

    if (infoType === 'hotel_info') {
      switch (name) {
        case 'check_in':
          data.hotel_info[index].check_out = '';
          break;
        case 'destination_id':
          data.hotel_info[index].hotel_id = '';
          data.hotel_info[index].ex_adult_cost = '';
          data.hotel_info[index].ex_children_cost = '';
          data.hotel_info[index].room_type = '';
          data.hotel_info[index].room_type_cost = '';
          break;
        case 'hotel_id':
          data.hotel_info[index].ex_adult_cost = '';
          data.hotel_info[index].ex_children_cost = '';
          data.hotel_info[index].room_type = '';
          data.hotel_info[index].room_type_cost = '';
          data.hotel_info[index].meals = [];

          // Select Hotel
          const s_hotel = hotelsData.data?.data?.find(
            (hotel) => hotel.id === value
          );
          if (s_hotel) {
            // Assign rate
            data.hotel_info[index].ex_adult_cost = s_hotel.ex_adult_rate;
            data.hotel_info[index].ex_children_cost = s_hotel.ex_child_rate;

            // Assign Meals
            s_hotel.meals?.forEach((meal) => {
              data.hotel_info[index].meals = [
                ...data.hotel_info[index].meals,
                {
                  name: meal.name,
                  isChecked: false,
                  rate: meal.rate,
                },
              ];
            });
          }
          break;
        case 'room_type':
          // Select Hotel
          const selectedHotel = hotelsData.data?.data?.find(
            (hotel) => hotel.id === data.hotel_info[index].hotel_id
          );
          if (selectedHotel) {
            // Select Room Type
            const selectedRoomType = selectedHotel.room_types.find(
              (room_type) => room_type.type === value
            );
            // Assign rate
            data.hotel_info[index].room_type_cost = selectedRoomType?.rate;
          }
          break;
        default:
          console.warn(`Unhandled case in hotel_info: ${name}`);
          break;
      }
    } else if (infoType === 'transport_info') {
      switch (name) {
        case 'destination_id':
          data.transport_info[index].transport_id = '';
          data.transport_info[index].v_type = '';
          data.transport_info[index].transport_cost = '';
          break;
        case 'transport_id':
          data.transport_info[index].v_type = '';
          data.transport_info[index].transport_cost = '';
          break;
        case 'v_type':
          // Select Transport
          const selectedTransport = transportData.data?.data?.find(
            (transport) =>
              transport.id === data.transport_info[index].transport_id
          );
          if (selectedTransport) {
            // Select Transport Type
            const selectedType = selectedTransport.options.find(
              (v_type) => v_type.type === value
            );
            // Assign rate
            data.transport_info[index].transport_cost = selectedType?.rate;
          }
          break;
        default:
          console.warn(`Unhandled case in transport_info: ${name}`);
          break;
      }
    } else if (infoType === 'sightseeing_info') {
      switch (name) {
        case 'destination_id':
          data.sightseeing_info[index].sightseeing_id = '';
          data.sightseeing_info[index].adult_cost = 0;
          data.sightseeing_info[index].children_cost = 0;
          break;
        case 'sightseeing_id':
          // Select Sightseeing
          const selectedSightseeing = sightseeingData.data?.data?.find(
            (sightseeing) => sightseeing.id === value
          );

          data.sightseeing_info[index].adult_cost =
            selectedSightseeing?.rate_adult;
          data.sightseeing_info[index].children_cost =
            selectedSightseeing?.rate_child;

          break;
        default:
          console.warn(`Unhandled case in sightseeing_info: ${name}`);
          break;
      }
    }

    data[infoType][index][name] = value;
    setFormData(data);
  };

  // Handle Meals
  const handleMealsChange = ({ currentTarget }, index) => {
    setToSubmit(false);
    const { name } = currentTarget;
    const data = { ...formData };

    const foundMeal = data.hotel_info[index].meals.find(
      (item) => item.name === name
    );

    foundMeal.isChecked = !foundMeal.isChecked; // Toggle the isChecked value

    setFormData(data);
  };

  // Handle Cost Calculation
  const handleCalculate = () => {
    if (!formData.customer_name) {
      setErr('Customer name field is required!');
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (!formData.phone_no) {
      setErr('Phone Number field is required!');
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (!formData.travel_date_from || !formData.travel_date_to) {
      setErr('Travelling dates are required!');
      setSuccess(false);
      setPopUp(true);
      return;
    }
    if (formData.no_adults < 1) {
      setErr('At least 1 adult is required!');
      setSuccess(false);
      setPopUp(true);
      return;
    }

    let total = 0,
      adultsTotal = 0,
      childrenTotal = 0,
      perAdult = 0,
      perChild = 0,
      taxAmount = 0,
      finalAmount = 0;

    let hotelInfoAdults = 0,
      transportInfoAdults = 0,
      sightseeingInfoAdults = 0;
    let hotelInfoChildren = 0,
      transportInfoChildren = 0,
      sightseeingInfoChildren = 0;

    formData.hotel_info.forEach((hotel) => {
      const checkInOutDays = getDaysBetweenDates(
        hotel.check_in,
        hotel.check_out
      );
      let mealsCost = 0;
      let adultAmountRoom = 0,
        adultAmountFood = 0;
      let childrenAmountRoom = 0,
        childrenAmountFood = 0;

      // Cost for Adult's room
      adultAmountRoom +=
        Number(hotel.rooms) *
          Number(hotel.room_type_cost || 0) *
          checkInOutDays +
        checkInOutDays * Number(hotel.ex_adult_cost) * Number(hotel.ex_adults);

      // Children rooms cost
      childrenAmountRoom +=
        checkInOutDays *
        Number(hotel.ex_children_cost) *
        Number(hotel.ex_children);

      // Per hotel meals cost
      hotel.meals
        .filter((meal) => meal.isChecked)
        .forEach((meal) => {
          mealsCost += Number(meal.rate);
        });

      // Adult Meals cost
      adultAmountFood +=
        mealsCost *
        (Number(formData.no_adults) + Number(hotel.ex_adults)) *
        checkInOutDays;

      // Children Meals cost
      childrenAmountFood +=
        mealsCost *
        (Number(formData.no_children) + Number(hotel.ex_children)) *
        checkInOutDays;

      // Total Adult Hotel Cost
      hotelInfoAdults += adultAmountRoom + adultAmountFood;
      hotelInfoChildren += childrenAmountRoom + childrenAmountFood;
    });

    formData.transport_info.forEach((transport) => {
      transportInfoAdults += Number(transport.transport_cost);
    });

    formData.sightseeing_info.forEach((sight) => {
      const adultCost = sight.adult_cost;
      const childrenCost = sight.children_cost;

      sightseeingInfoAdults += adultCost * sight.adults;
      sightseeingInfoChildren += childrenCost * sight.children;
    });

    // Totalling
    // adults
    adultsTotal = hotelInfoAdults + transportInfoAdults + sightseeingInfoAdults;
    // Per adult
    perAdult =
      Math.round(
        (hotelInfoAdults + transportInfoAdults + sightseeingInfoAdults) /
          Number(formData.no_adults)
      ) || 0;

    // Children
    childrenTotal =
      hotelInfoChildren + transportInfoChildren + sightseeingInfoChildren;
    // Per child
    if (formData.no_children <= 0) {
      perChild = 0;
    } else {
      perChild =
        Math.round(
          (hotelInfoChildren +
            transportInfoChildren +
            sightseeingInfoChildren) /
            Number(formData.no_children)
        ) || 0;
    }
    // Total
    total =
      hotelInfoAdults +
        transportInfoAdults +
        sightseeingInfoAdults +
        hotelInfoChildren +
        transportInfoChildren +
        sightseeingInfoChildren || 0;

    // Taxes
    formData.taxes.forEach((tax) => {
      taxAmount += total * (tax.tax_value / 100);
    });

    finalAmount = total + taxAmount;

    // Update State
    setCalc((prev) => ({
      ...prev,
      adultsTotal: adultsTotal,
      perAdult: perAdult,
      childrenTotal: childrenTotal,
      perChild: perChild,
      total: total,
      taxAmount: taxAmount,
      finalAmount: finalAmount,
    }));

    // Set for Submission
    setToSubmit(true);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!(Number(calc.finalAmount) >= 1)) {
      setErr('Please make an appropriate package');
      setSuccess(false);
      setPopUp(true);
      return;
    }

    const data = { ...formData };
    data.final_payment = Number(calc.finalAmount);
    data.total_per_adult = Number(calc.perAdult);
    data.total_per_child = Number(calc.perChild);

    subFormData.sendData(data);
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

  // Function -> Number of days
  function getDaysBetweenDates(date1, date2) {
    const startDate = new Date(date1);
    const endDate = new Date(date2);
    const differenceInMillis = endDate - startDate;

    return differenceInMillis / (1000 * 60 * 60 * 24) || 0; // Convert milliseconds to days
  }

  return (
    <>
      <Alert
        open={popUp}
        handleClose={() => {
          setPopUp(false);
        }}
        success={success}
      >
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
                    className="form-control mt-1"
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
                  <select
                    id="no_adults"
                    className="form-control mt-1"
                    name="no_adults"
                    value={formData.no_adults}
                    onChange={handleDataChange}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                    <option value={8}>8</option>
                    <option value={9}>9</option>
                    <option value={10}>10</option>
                    <option value={11}>11</option>
                    <option value={12}>12</option>
                    <option value={13}>13</option>
                    <option value={14}>14</option>
                    <option value={15}>15</option>
                  </select>
                </div>
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="no_children" className="fw-bold">
                    Children
                  </label>
                  <select
                    id="no_children"
                    className="form-control mt-1"
                    name="no_children"
                    value={formData.no_children}
                    onChange={handleDataChange}
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={7}>7</option>
                    <option value={8}>8</option>
                    <option value={9}>9</option>
                    <option value={10}>10</option>
                    <option value={11}>11</option>
                    <option value={12}>12</option>
                    <option value={13}>13</option>
                    <option value={14}>14</option>
                    <option value={15}>15</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Hotel info</span>
              </div>
              {formData.hotel_info.map((item, index) => (
                <div className="mb-3" key={index}>
                  <div className="d-flex align-items-center justify-content-between column-gap-3">
                    <h5 className="fs-6 fw-bold">Hotel {index + 1}</h5>
                    {index > 0 && (
                      <button
                        className="btn btn-danger rounded-circle"
                        onClick={() => {
                          handleDeleteInfo('hotel_info', index);
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="destination_id" className="fw-bold">
                        City
                      </label>
                      <select
                        id="destination_id"
                        className="form-control mt-1"
                        name="destination_id"
                        value={item.destination_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from ||
                          !formData.travel_date_to ||
                          formData.no_adults < 1
                        }
                      >
                        <option value="">-- select --</option>
                        {!destinationsData.loading &&
                          destinationsData.data?.destinations?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {countriesData.data?.cities.find(
                                (city) => city.id === item.city_id
                              )?.name || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="hotel_id" className="fw-bold">
                        Hotel
                      </label>
                      <select
                        id="hotel_id"
                        className="form-control mt-1"
                        name="hotel_id"
                        value={item.hotel_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={!item.destination_id}
                      >
                        <option value="">-- select --</option>
                        {hotelsData.data?.data
                          ?.filter(
                            (hotel) =>
                              hotel.destination_id === item.destination_id
                          )
                          .map((hotel) => (
                            <option key={hotel.id} value={hotel.id}>
                              {hotel.name || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="room_type" className="fw-bold">
                        Category
                      </label>
                      <select
                        id="room_type"
                        className="form-control mt-1"
                        name="room_type"
                        value={item.room_type}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={!item.hotel_id}
                      >
                        <option value="">-- select --</option>
                        {hotelsData.data?.data
                          ?.find((hotel) => hotel.id === item.hotel_id)
                          ?.room_types.map((room_type, i) => (
                            <option key={i} value={room_type.type}>
                              {room_type.type || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="rooms" className="fw-bold">
                        Rooms
                      </label>
                      <select
                        id="rooms"
                        className="form-control mt-1"
                        name="rooms"
                        value={item.rooms}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={!item.room_type}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="ex_adults" className="fw-bold">
                        Ex Adults
                      </label>
                      <select
                        id="ex_adults"
                        className="form-control mt-1"
                        name="ex_adults"
                        value={item.ex_adults}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="ex_children" className="fw-bold">
                        Ex Children
                      </label>
                      <select
                        id="ex_children"
                        className="form-control mt-1"
                        name="ex_children"
                        value={item.ex_children}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="check_in" className="fw-bold">
                        Check-In
                      </label>
                      <input
                        type="date"
                        id="check_in"
                        className="form-control mt-1"
                        name="check_in"
                        min={formData.travel_date_from}
                        max={formData.travel_date_to}
                        value={item.check_in}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from || !formData.travel_date_to
                        }
                      />
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="check_out" className="fw-bold">
                        Check-Out
                      </label>
                      <input
                        type="date"
                        id="check_out"
                        className="form-control mt-1"
                        name="check_out"
                        min={
                          formData.hotel_info[index].check_in ||
                          formData.travel_date_to
                        }
                        max={formData.travel_date_to}
                        value={item.check_out}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'hotel_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from || !formData.travel_date_to
                        }
                      />
                    </div>

                    {item.hotel_id && (
                      <div className="col mb-3 mb-md-4">
                        <label className="fw-bold">Meals</label>
                        <div className="d-flex row-gap-1 column-gap-4 flex-wrap mt-1">
                          {item.meals?.map((meal) => (
                            <div className="form-check" key={meal.name}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`checkbox-${index}-${meal.name}`}
                                name={meal.name}
                                onChange={(e) => {
                                  handleMealsChange(e, index);
                                }}
                                checked={meal.isChecked}
                              />
                              <label
                                className="form-check-label user-select-none"
                                htmlFor={`checkbox-${index}-${meal.name}`}
                              >
                                <span className="text-capitalize">
                                  {meal.name}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <button
                className="btn btn-info"
                onClick={() => {
                  handleAddInfo('hotel');
                }}
              >
                Add Hotel
              </button>
            </div>

            {/* Transport Info */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Transport info</span>
              </div>
              {formData.transport_info.map((item, index) => (
                <div className="mb-3" key={index}>
                  <div className="d-flex align-items-center justify-content-between column-gap-3">
                    <h5 className="fs-6 fw-bold">Transport {index + 1}</h5>
                    {index > 0 && (
                      <button
                        className="btn btn-danger rounded-circle"
                        onClick={() => {
                          handleDeleteInfo('transport_info', index);
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="destination_id" className="fw-bold">
                        City
                      </label>
                      <select
                        id="destination_id"
                        className="form-control mt-1"
                        name="destination_id"
                        value={item.destination_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'transport_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from ||
                          !formData.travel_date_to ||
                          formData.no_adults < 1
                        }
                      >
                        <option value="">-- select --</option>
                        {!destinationsData.loading &&
                          destinationsData.data?.destinations?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {countriesData.data?.cities.find(
                                (city) => city.id === item.city_id
                              )?.name || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="transport_id" className="fw-bold">
                        Transport
                      </label>
                      <select
                        id="transport_id"
                        className="form-control mt-1"
                        name="transport_id"
                        value={item.transport_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'transport_info', index);
                        }}
                        disabled={!item.destination_id}
                      >
                        <option value="">-- select --</option>
                        {transportData.data?.data
                          ?.filter(
                            (transport) =>
                              transport.destination_id === item.destination_id
                          )
                          .map((transport) => (
                            <option key={transport.id} value={transport.id}>
                              {transport.transport || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="v_type" className="fw-bold">
                        No. Of People
                      </label>
                      <select
                        id="v_type"
                        className="form-control mt-1"
                        name="v_type"
                        value={item.v_type}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'transport_info', index);
                        }}
                        disabled={!item.transport_id}
                      >
                        <option value="">0</option>
                        {transportData.data?.data
                          ?.find(
                            (transport) => transport.id === item.transport_id
                          )
                          ?.options.map((option, i) => (
                            <option key={i} value={option.type}>
                              {option.type || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

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
                        onChange={(e) => {
                          handleNestedDataChange(e, 'transport_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from || !formData.travel_date_to
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-info"
                onClick={() => {
                  handleAddInfo('transport');
                }}
              >
                Add Transport
              </button>
            </div>

            {/* Sightseeing Info */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="title-line">
                <span>Sightseeing info</span>
              </div>

              {formData.sightseeing_info.map((item, index) => (
                <div className="mb-3" key={index}>
                  <div className="d-flex align-items-center justify-content-between column-gap-3">
                    <h5 className="fs-6 fw-bold">Sightseeing {index + 1}</h5>
                    {index > 0 && (
                      <button
                        className="btn btn-danger rounded-circle"
                        onClick={() => {
                          handleDeleteInfo('sightseeing_info', index);
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    )}
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="destination_id" className="fw-bold">
                        City
                      </label>
                      <select
                        id="destination_id"
                        className="form-control mt-1"
                        name="destination_id"
                        value={item.destination_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'sightseeing_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from ||
                          !formData.travel_date_to ||
                          formData.no_adults < 1
                        }
                      >
                        <option value="">-- select --</option>
                        {!destinationsData.loading &&
                          destinationsData.data?.destinations?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {countriesData.data?.cities.find(
                                (city) => city.id === item.city_id
                              )?.name || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="sightseeing_id" className="fw-bold">
                        Sightseeing
                      </label>
                      <select
                        id="sightseeing_id"
                        className="form-control mt-1"
                        name="sightseeing_id"
                        value={item.sightseeing_id}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'sightseeing_info', index);
                        }}
                        disabled={!item.destination_id}
                      >
                        <option value="">-- select --</option>
                        {sightseeingData.data?.data
                          ?.filter(
                            (sightseeing) =>
                              sightseeing.destination_id === item.destination_id
                          )
                          .map((sightseeing) => (
                            <option key={sightseeing.id} value={sightseeing.id}>
                              {sightseeing.description || 'N/A'}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="adults" className="fw-bold">
                        No Of Adult
                      </label>
                      <select
                        id="adults"
                        className="form-control mt-1"
                        name="adults"
                        value={item.adults}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'sightseeing_info', index);
                        }}
                        disabled={!item.sightseeing_id}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </select>
                    </div>

                    <div className="col mb-3 mb-md-4">
                      <label htmlFor="children" className="fw-bold">
                        No Of Children
                      </label>
                      <select
                        id="children"
                        className="form-control mt-1"
                        name="children"
                        value={item.children}
                        onChange={(e) => {
                          handleNestedDataChange(e, 'sightseeing_info', index);
                        }}
                        disabled={!item.destination_id}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </select>
                    </div>

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
                        onChange={(e) => {
                          handleNestedDataChange(e, 'sightseeing_info', index);
                        }}
                        disabled={
                          !formData.travel_date_from || !formData.travel_date_to
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="btn btn-info"
                onClick={() => {
                  handleAddInfo('sightseeing');
                }}
              >
                Add Sightseeing
              </button>
            </div>

            {/* Remarks */}
            <div className="px-2 py-2 px-md-4 mb-4">
              <div className="row row-cols-1">
                <div className="col mb-3 mb-md-4">
                  <label htmlFor="remarks" className="fw-bold">
                    Remarks
                  </label>
                  <textarea
                    className="form-control"
                    style={{ resize: 'vertical' }}
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleDataChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {toSubmit && (
              <>
                {/* Pricing */}
                <div className="px-2 py-2 px-md-4 mb-4">
                  <div className="title-line">
                    <span>Pricing</span>
                  </div>

                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                    <div className="col mb-3 mb-md-4">Adult's Total:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.adultsTotal}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                    <div className="col mb-3 mb-md-4">Children's Total:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.childrenTotal}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                    <div className="col mb-3 mb-md-4">Per Adult:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.perAdult}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
                    <div className="col mb-3 mb-md-4">Per Children:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.perChild}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                    <div className="col mb-3 mb-md-4">Total:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.total}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                    <div className="col mb-3 mb-md-4">Taxed Amount:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.taxAmount}/-</span>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
                    <div className="col mb-3 mb-md-4">Final Payment:-</div>
                    <div className="col mb-3 mb-md-4">
                      <span>{calc.finalAmount}/-</span>
                    </div>
                  </div>
                </div>
              </>
            )}

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

