import { useState } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import useSendData from "../../hooks/useSendData";
import "./common.css";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";

const Hotels = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();
  const token = authToken;

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/hotels`, token);

  const countriesData = useApiData(`${base_url}/api/countries`, token);
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token);
  console.log(destinationsData);
  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // form data states
  const addForm = useSendData(
    `${base_url}/api/hotel`, // URL to send data to
    token // Auth token
  );

  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  });

  // Form data for add/edit
  const [roomTypesTemp, setRoomTypesTemp] = useState({ type: "", rate: "" });
  const [mealsTemp, setMealsTemp] = useState({ name: "", rate: "" });
  const [formData, setFormData] = useState({
    addFormData: {
      name: "",
      hotel_type: "",
      address: "",
      contact_no: "",
      ex_adult_rate: "",
      ex_child_rate: "",
      destination_id: "",
      email: "",
      room_types: [],
      meals: [],
    },
    editFormData: {
      id: null,
      name: "",
      hotel_type: "",
      address: "",
      contact_no: "",
      ex_adult_rate: "",
      ex_child_rate: "",
      destination_id: "",
      email: "",
      room_types: [],
      meals: [],
    },
  });

  // Handle search input change
  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setCurrPageNo(0);
  };

  // Handle page change
  const handlePageChange = (increment) => {
    const newPageNo = currPageNo + increment;
    if (
      newPageNo >= 0 &&
      newPageNo < Math.ceil(filteredData.length / perPage)
    ) {
      setCurrPageNo(newPageNo);
    }
  };

  // Filter destinations based on search value
  const filteredData =
    mainData.data?.data?.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    switch (name) {
      case "contact_no":
        filteredValue = value.replace(/[^0-9]/g, "");
        break;

      case "ex_child_rate":
      case "ex_adult_rate":
        filteredValue = value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        break;

      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => {
      switch (name) {
        case "country_id":
          prev[formType] = { ...prev[formType], state_id: "", city_id: "" };
          break;
        case "state_id":
          prev[formType] = { ...prev[formType], city_id: "" };
          break;
      }

      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: filteredValue,
        },
      };
    });
  };

  /* Room Types */
  const handleRoomTypes = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    switch (name) {
      case "rate":
        filteredValue = value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        break;

      default:
        filteredValue = value;
        break;
    }

    setRoomTypesTemp((item) => ({ ...item, [name]: filteredValue }));
  };
  const addRoomTypes = (formType) => {
    if (roomTypesTemp.type === "" || roomTypesTemp.rate === "") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        room_types: [...prev[formType]["room_types"], roomTypesTemp],
      },
    }));

    setRoomTypesTemp({ type: "", rate: "" });
  };
  const removeRoom = (formType, type) => {
    const updatedRooms = formData[formType].room_types.filter(
      (roomType) => roomType.type !== type
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        room_types: updatedRooms,
      },
    }));
  };

  /* Meals Types */
  const addMeals = (formType) => {
    if (mealsTemp.name === "" || mealsTemp.rate === "") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        meals: [...prev[formType]["meals"], mealsTemp],
      },
    }));
    setMealsTemp({ name: "", rate: "" });
  };
  const handleMeals = (e) => {
    const { name, value } = e.target;

    setMealsTemp((item) => ({ ...item, [name]: value }));
  };
  const removeMeal = (formType, name) => {
    // Filter out the meal with the specified name
    const updatedMeals = formData[formType].meals.filter(
      (meal) => meal.name !== name
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        meals: updatedMeals, // Update the meals list
      },
    }));
  };

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null);
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));
  };

  // submit form
  const submitFormData = async (formType) => {
    switch (formType) {
      case "addFormData":
        await addForm.sendData(formData["addFormData"]);

        setFormData((item) => ({
          ...item,
          [formType]: {
            ...(formType === "editFormData" && { id: null }),
            name: "",
            hotel_type: "",
            address: "",
            contact_no: "",
            ex_adult_rate: "",
            ex_child_rate: "",
            destination_id: "",
            email: "",
            room_types: [],
            meals: [],
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);
        const res = await fetch(
          `${base_url}/api/updatehotel/${formData.editFormData.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData["editFormData"]),
          }
        );

        const result = await res.json();
        setEditRes(result);
        setEditLoading(false);
        break;
    }

    setRoomTypesTemp({ type: "", rate: "" });
    setMealsTemp({ name: "", rate: "" });

    mainData.refetch();
  };

  // Confirmation
  const [isConfirm, setIsConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const handleDeleteClick = (id, name) => {
    setRecordToDelete((prev) => ({ id, name }));
    setIsConfirm(true);
  };

  const handleConfirm = (confirm, id = null) => {
    if (confirm) {
      (async () => {
        const res = await fetch(`${base_url}/api/deletehotel/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        mainData.refetch();
      })();
    } else {
      setRecordToDelete(null);
    }
    setIsConfirm(false);
  };

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <Modal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Hotel"
        >
          {/* Modal content */}
          <div className="container p-3">
            {/* Country */}
            <div className="container border-bottom border-light-subtle">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Hotel Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Hotel name..."
                  name="name"
                  value={formData.addFormData.name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="hotel_type" className="form-label">
                  Hotel Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="hotel_type"
                  placeholder="Hotel Type..."
                  name="hotel_type"
                  value={formData.addFormData.hotel_type}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  placeholder="Hotel Address..."
                  name="address"
                  value={formData.addFormData.address}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_no" className="form-label">
                  Contact Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact_no"
                  placeholder="Contact Number..."
                  name="contact_no"
                  maxLength={10}
                  value={formData.addFormData.contact_no}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  placeholder="Email..."
                  name="email"
                  value={formData.addFormData.email}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="ex_adult_rate" className="form-label">
                  Ex Adult Rates
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ex_adult_rate"
                  placeholder="Ex Adult Rate..."
                  name="ex_adult_rate"
                  value={formData.addFormData.ex_adult_rate}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="ex_child_rate" className="form-label">
                  Ex Child Rates
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ex_child_rate"
                  placeholder="Ex Child Rate..."
                  name="ex_child_rate"
                  value={formData.addFormData.ex_child_rate}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="destination_id" className="form-label">
                  Destination
                </label>
                <select
                  className="form-control"
                  name="destination_id"
                  id="destination_id"
                  value={formData.addFormData.destination_id}
                  onChange={handleFormDataChange("addFormData")}
                >
                  <option value="">-- select --</option>
                  {destinationsData.data?.destinations?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {countriesData.data?.cities.find(
                        (city) => city.id === item.city_id
                      )?.name || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Room Type
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="type"
                      value={roomTypesTemp.type}
                      onChange={handleRoomTypes}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={roomTypesTemp.rate}
                      onChange={handleRoomTypes}
                    />
                  </div>
                </div>
                <div>
                  {formData.addFormData.room_types.map((item) => (
                    <div className="row m-0 mt-2" key={item.type}>
                      <div className="col-5">{item.type}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeRoom("addFormData", item.type);
                          }}
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    addRoomTypes("addFormData");
                  }}
                >
                  Add Room
                </button>
              </div>
              {/* Meals Types */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Meals
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="name"
                      value={mealsTemp.name}
                      onChange={handleMeals}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={mealsTemp.rate}
                      onChange={handleMeals}
                    />
                  </div>
                </div>
                <div>
                  {formData.addFormData.meals.map((item) => (
                    <div className="row m-0 mt-2" key={item.name}>
                      <div className="col-5">{item.name}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeMeal("addFormData", item.name);
                          }}
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    addMeals("addFormData");
                  }}
                >
                  Add Meal
                </button>
              </div>
              {addForm.response &&
                (addForm.response?.success ? (
                  <div className="alert alert-success">
                    {addForm.response?.message}
                  </div>
                ) : (
                  <div className="alert alert-danger">
                    {typeof addForm.response.errors === "object"
                      ? Object.values(addForm.response.errors)[0]
                      : addForm.response.errors}
                  </div>
                ))}
            </div>
            <div className="container p-3">
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => submitFormData("addFormData")}
              >
                {addForm.loading ? "Processing..." : "Add"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Destination"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Hotel */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Hotel Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Hotel name..."
                  name="name"
                  value={formData.editFormData.name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="hotel_type" className="form-label">
                  Hotel Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="hotel_type"
                  placeholder="Hotel Type..."
                  name="hotel_type"
                  value={formData.editFormData.hotel_type}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  placeholder="Hotel Address..."
                  name="address"
                  value={formData.editFormData.address}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="contact_no" className="form-label">
                  Contact Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="contact_no"
                  placeholder="Contact Number..."
                  name="contact_no"
                  maxLength={10}
                  value={formData.editFormData.contact_no}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  placeholder="Email..."
                  name="email"
                  value={formData.editFormData.email}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="ex_adult_rate" className="form-label">
                  Ex Adult Rates
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ex_adult_rate"
                  placeholder="Ex Adult Rate..."
                  name="ex_adult_rate"
                  value={formData.editFormData.ex_adult_rate}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="ex_child_rate" className="form-label">
                  Ex Child Rates
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ex_child_rate"
                  placeholder="Ex Child Rate..."
                  name="ex_child_rate"
                  value={formData.editFormData.ex_child_rate}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="destination_id" className="form-label">
                  Destination
                </label>
                <select
                  className="form-control"
                  name="destination_id"
                  id="destination_id"
                  value={formData.editFormData.destination_id}
                  onChange={handleFormDataChange("editFormData")}
                >
                  <option value="">-- select --</option>
                  {destinationsData.data?.destinations?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {countriesData.data?.cities.find(
                        (city) => city.id === item.city_id
                      )?.name || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Room Type
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="type"
                      value={roomTypesTemp.type}
                      onChange={handleRoomTypes}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={roomTypesTemp.rate}
                      onChange={handleRoomTypes}
                    />
                  </div>
                </div>
                <div>
                  {formData.editFormData.room_types.map((item) => (
                    <div className="row m-0 mt-2" key={item.type}>
                      <div className="col-5">{item.type}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeRoom("editFormData", item.type);
                          }}
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    addRoomTypes("editFormData");
                  }}
                >
                  Add Room
                </button>
              </div>
              {/* Meals Types */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Meals
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="name"
                      value={mealsTemp.name}
                      onChange={handleMeals}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={mealsTemp.rate}
                      onChange={handleMeals}
                    />
                  </div>
                </div>
                <div>
                  {formData.editFormData.meals.map((item) => (
                    <div className="row m-0 mt-2" key={item.name}>
                      <div className="col-5">{item.name}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeMeal("editFormData", item.name);
                          }}
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    addMeals("editFormData");
                  }}
                >
                  Add Meal
                </button>
              </div>
              {editRes &&
                (editRes?.success ? (
                  <div className="alert alert-success">{editRes?.message}</div>
                ) : (
                  <div className="alert alert-danger">
                    {typeof editRes.errors === "object"
                      ? Object.values(editRes.errors)[0]
                      : editRes.errors}
                  </div>
                ))}
            </div>
            <div className="container p-3">
              <button
                className="btn btn-warning"
                type="submit"
                onClick={() => submitFormData("editFormData")}
              >
                {editLoading ? "Processing..." : "Update"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Confirm */}
        <Confirm
          open={isConfirm}
          handleConfirm={() => {
            handleConfirm(true, recordToDelete?.id);
          }}
          handleClose={() => {
            handleConfirm(false);
          }}
        >
          Are you sure you want to delete {recordToDelete?.name}?
        </Confirm>

        <div className="display-header">
          <h2 className="display-title">Hotels</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />
          <button
            className="btn btn-sm btn-primary"
            onClick={() => toggleModal("addModalOpen", true)}
          >
            Add Hotel
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Hotel Name</th>
                  <th>Hotel Type</th>
                  <th>Address</th>
                  <th>Destination</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {countriesData.loading ||
                destinationsData.loading ||
                mainData.loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {/* Find the name */}
                      <td>{item.name}</td>

                      {/* Find the hotel_type */}
                      <td>{item.hotel_type}</td>

                      {/* Find the address */}
                      <td>{item.address}</td>

                      {/* Destination */}
                      <td>
                        {countriesData.data?.cities.find(
                          (city) =>
                            city.id ===
                            destinationsData.data?.destinations?.find(
                              (des) => des.id === item.destination_id
                            ).city_id
                        )?.name || "N/A"}
                      </td>

                      <td style={{ width: "1%" }}>
                        <div className="d-flex">
                          <button
                            className="btn flex-shrink-0"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                editFormData: { ...item, id: item.id },
                              }));

                              toggleModal("editModalOpen", true);
                            }}
                          >
                            <i className="fa-solid fa-pencil text-warning"></i>
                          </button>
                          <button
                            className="btn flex-shrink-0"
                            onClick={() => {
                              handleDeleteClick(item.id, item.name);
                            }}
                          >
                            <i className="fa-solid fa-trash-can text-danger"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No record found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="display-footer">
            <small>Total records: {filteredData.length}</small>
            <ul className="pagination mt-4">
              <li className="page-item">
                <button
                  className={`page-link ${currPageNo <= 0 && "disabled"}`}
                  onClick={() => handlePageChange(-1)}
                >
                  Prev
                </button>
              </li>
              <li className="page-item">
                <button
                  className={`page-link ${
                    currPageNo + 1 >=
                      Math.ceil(filteredData.length / perPage) && "disabled"
                  }`}
                  onClick={() => handlePageChange(1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hotels;
