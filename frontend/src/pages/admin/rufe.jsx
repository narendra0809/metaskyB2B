import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import useSendData from "../../hooks/useSendData";
import "./common.css";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";

const Ticket = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();
  const token = authToken;

  // Fetch tickets data
  const mainData = useApiData(`${base_url}/api/tickets`, token);

  // Hard-coded categories and transfer options since we only have /api/tickets API
  const categories = [
    { id: 1, name: "Prime" },
    { id: 2, name: "Non prime" },
  ];

  const transferOptions = [
    { id: 1, name: "private transfer" },
    { id: 2, name: "sharing transfer" },
    { id: 3, name: "without transfer" },
  ];

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // form data states
  const addForm = useSendData(
    `${base_url}/api/tickets`, // Using the only available API endpoint
    token // Auth token
  );

  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [timeSlotTemp, setTimeSlotTemp] = useState({
    slot: "",
    adult_price: "",
    child_price: "",
  });
  const [transferOptionTemp, setTransferOptionTemp] = useState({
    option: "",
    adult_price: "",
    child_price: "",
  });

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  });

  // Form data for add/edit
  const [formData, setFormData] = useState({
    addFormData: {
      name: "",
      transfer_options: [],
      time_slots: [],
      category: "",
      status: "Active",
    },
    editFormData: {
      id: null,
      name: "",
      transfer_options: [],
      time_slots: [],
      category: "",
      status: "Active",
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

  // Filter tickets based on search value
  const filteredData =
    mainData.data?.data?.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );
  // Add state for available time slots:
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    // Special handling for category selection
    if (name === "category") {
      // Update available time slots based on category
      if (value === "Prime") {
        const primeSlots = [
          "3:30 PM - 4:00 PM",
          "4:00 PM - 4:30 PM",
          "4:30 PM - 5:00 PM",
          "5:00 PM - 5:30 PM",
          "5:30 PM - 6:00 PM",
          "6:00 PM - 6:30 PM",
          "6:30 PM - 7:00 PM",
        ];
        setAvailableTimeSlots(primeSlots);
      } else if (value === "Non prime") {
        const nonPrimeSlots = [
          "7:30 AM - 8:00 AM",
          "8:00 AM - 8:30 AM",
          "8:30 AM - 9:00 AM",
          // Add more non-prime slots
          "11:00 AM - 11:30 AM",
        ];
        setAvailableTimeSlots(nonPrimeSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    }

    switch (name) {
      case "adult_price":
      case "child_price":
        filteredValue = value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        break;
      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [name]: filteredValue,
      },
    }));
  };

  // Handle time slot functions
  const handleTimeSlot = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (name === "adult_price" || name === "child_price") {
      filteredValue = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    }

    setTimeSlotTemp((item) => ({ ...item, [name]: filteredValue }));
  };

  const addTimeSlot = (formType) => {
    if (
      timeSlotTemp.slot === "" ||
      timeSlotTemp.adult_price === "" ||
      timeSlotTemp.child_price === ""
    ) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        time_slots: [...(prev[formType]["time_slots"] || []), timeSlotTemp],
      },
    }));
    setTimeSlotTemp({ slot: "", adult_price: "", child_price: "" });
  };

  const removeTimeSlot = (formType, slot) => {
    const updatedTimeSlots = formData[formType].time_slots.filter(
      (timeSlot) => timeSlot.slot !== slot
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        time_slots: updatedTimeSlots,
      },
    }));
  };

  // Handle transfer option functions
  const handleTransferOption = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;

    if (name === "adult_price" || name === "child_price") {
      filteredValue = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    }

    setTransferOptionTemp((item) => ({ ...item, [name]: filteredValue }));
  };

  const addTransferOption = (formType) => {
    if (
      transferOptionTemp.option === "" ||
      transferOptionTemp.adult_price === "" ||
      transferOptionTemp.child_price === ""
    ) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        transfer_options: [
          ...(prev[formType]["transfer_options"] || []),
          transferOptionTemp,
        ],
      },
    }));
    setTransferOptionTemp({ option: "", adult_price: "", child_price: "" });
  };

  const removeTransferOption = (formType, option) => {
    const updatedTransferOptions = formData[formType].transfer_options.filter(
      (transferOption) => transferOption.option !== option
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        transfer_options: updatedTransferOptions,
      },
    }));
  };

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null);
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));

    // Add default time slots and transfer options from dummy data when opening add modal
    if (modalType === "addModalOpen" && isOpen) {
      setFormData((prev) => ({
        ...prev,
        addFormData: {
          name: "",
          transfer_options: [],
          time_slots: [],
          category: "",
          status: "Active",
        },
      }));
    }
  };

  // submit form
  const submitFormData = async (formType) => {
    switch (formType) {
      case "addFormData":
        await addForm.sendData(formData["addFormData"]);

        setFormData((item) => ({
          ...item,
          [formType]: {
            name: "",
            transfer_options: [],
            time_slots: [],
            category: "",
            status: "Active",
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);
        try {
          const res = await fetch(
            `${base_url}/api/tickets/${formData.editFormData.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...formData["editFormData"],
                _method: "PUT",
              }),
            }
          );

          if (!res.ok) {
            throw new Error("Network response was not ok");
          }

          const result = await res.json();
          setEditRes(result);

          if (result.success) {
            toggleModal("editModalOpen", false);
            mainData.refetch();
            setFormData((prev) => ({
              ...prev,
              editFormData: {
                id: null,
                name: "",
                transfer_options: [],
                time_slots: [],
                category: "",
                status: "Active",
              },
            }));
          }
        } catch (error) {
          console.error("Update error:", error);
          setEditRes({
            success: false,
            errors:
              "Failed to update ticket. Please check your connection and try again.",
          });
        } finally {
          setEditLoading(false);
        }
        break;
    }

    setTimeSlotTemp({ slot: "", adult_price: "", child_price: "" });
    setTransferOptionTemp({ option: "", adult_price: "", child_price: "" });

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
        const res = await fetch(
          `${base_url}/api/tickets/${id}`, // Modified to use available endpoint
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
          title="Add Ticket"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Ticket Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Ticket name..."
                  name="name"
                  value={formData.addFormData.name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="transfer_option" className="form-label">
                  Transfer Option
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <select
                      className="form-control"
                      name="option"
                      value={transferOptionTemp.option}
                      onChange={handleTransferOption}
                    >
                      <option value="">-- select --</option>
                      {transferOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate"
                      name="adult_price"
                      value={transferOptionTemp.adult_price}
                      onChange={handleTransferOption}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate"
                      name="child_price"
                      value={transferOptionTemp.child_price}
                      onChange={handleTransferOption}
                    />
                  </div>
                </div>
                <div>
                  {formData.addFormData.transfer_options?.map((item, index) => (
                    <div className="row m-0 mt-2" key={index}>
                      <div className="col-4">{item.option}</div>
                      <div className="col-3">Adult: ${item.adult_price}</div>
                      <div className="col-3">Child: ${item.child_price}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeTransferOption("addFormData", item.option);
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
                    addTransferOption("addFormData");
                  }}
                >
                  Add Transfer Option
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  className="form-control"
                  id="category"
                  name="category"
                  value={formData.addFormData.category}
                  onChange={handleFormDataChange("addFormData")}
                >
                  <option value="">-- select --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="time_slot" className="form-label">
                  Time Slot
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <select
                      className="form-control"
                      name="slot"
                      value={timeSlotTemp.slot}
                      onChange={handleTimeSlot}
                    >
                      <option value="">-- select time --</option>
                      {availableTimeSlots.map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>

                    {/* <input
                      type="text"
                      className="form-control"
                      placeholder="Time"
                      name="slot"
                      value={timeSlotTemp.slot}
                      onChange={handleTimeSlot}
                    /> */}
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate"
                      name="adult_price"
                      value={timeSlotTemp.adult_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate"
                      name="child_price"
                      value={timeSlotTemp.child_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                </div>
                <div>
                  {formData.addFormData.time_slots?.map((item, index) => (
                    <div className="row m-0 mt-2" key={index}>
                      <div className="col-4">{item.slot}</div>
                      <div className="col-3">Adult: ${item.adult_price}</div>
                      <div className="col-3">Child: ${item.child_price}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeTimeSlot("addFormData", item.slot);
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
                    addTimeSlot("addFormData");
                  }}
                >
                  Add Time Slot
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  className="form-control"
                  id="status"
                  name="status"
                  value={formData.addFormData.status}
                  onChange={handleFormDataChange("addFormData")}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
          title="Edit Ticket"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Ticket Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Ticket name..."
                  name="name"
                  value={formData.editFormData.name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="transfer_option" className="form-label">
                  Transfer Option
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <select
                      className="form-control"
                      name="option"
                      value={transferOptionTemp.option}
                      onChange={handleTransferOption}
                    >
                      <option value="">-- select --</option>
                      {transferOptions.map((option) => (
                        <option key={option.id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate"
                      name="adult_price"
                      value={transferOptionTemp.adult_price}
                      onChange={handleTransferOption}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate"
                      name="child_price"
                      value={transferOptionTemp.child_price}
                      onChange={handleTransferOption}
                    />
                  </div>
                </div>
                <div>
                  {formData.editFormData.transfer_options?.map(
                    (item, index) => (
                      <div className="row m-0 mt-2" key={index}>
                        <div className="col-4">{item.option}</div>
                        <div className="col-3">Adult: ${item.adult_price}</div>
                        <div className="col-3">Child: ${item.child_price}</div>
                        <div className="col-2">
                          <button
                            className="btn flex-shrink-0"
                            onClick={() => {
                              removeTransferOption("editFormData", item.option);
                            }}
                          >
                            <i className="fa-solid fa-trash-can text-danger"></i>
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => {
                    addTransferOption("editFormData");
                  }}
                >
                  Add Transfer Option
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="time_slot" className="form-label">
                  Time Slot
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Time slot..."
                      name="slot"
                      value={timeSlotTemp.slot}
                      onChange={handleTimeSlot}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate..."
                      name="adult_price"
                      value={timeSlotTemp.adult_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate..."
                      name="child_price"
                      value={timeSlotTemp.child_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                </div>
                <div>
                  {formData.editFormData.time_slots?.map((item, index) => (
                    <div className="row m-0 mt-2" key={index}>
                      <div className="col-4">{item.slot}</div>
                      <div className="col-3">Adult: ${item.adult_price}</div>
                      <div className="col-3">Child: ${item.child_price}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeTimeSlot("editFormData", item.slot);
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
                    addTimeSlot("editFormData");
                  }}
                >
                  Add Time Slot
                </button>
              </div>

              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  className="form-control"
                  id="category"
                  name="category"
                  value={formData.editFormData.category}
                  onChange={handleFormDataChange("editFormData")}
                >
                  <option value="">-- select --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  className="form-control"
                  id="status"
                  name="status"
                  value={formData.editFormData.status}
                  onChange={handleFormDataChange("editFormData")}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
          <h2 className="display-title">Tickets</h2>
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
            Add Ticket
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Transfer Options</th>
                  <th>Time Slots</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mainData.loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        {item.transfer_options?.map((transferOption, index) => (
                          <div key={index}>
                            {transferOption.option} (Adult: $
                            {transferOption.adult_price}, Child: $
                            {transferOption.child_price})
                          </div>
                        ))}
                      </td>
                      <td>
                        {item.time_slots?.map((timeSlot, index) => (
                          <div key={index}>
                            {timeSlot.slot} (Adult: ${timeSlot.adult_price},
                            Child: ${timeSlot.child_price})
                          </div>
                        ))}
                      </td>
                      <td>{item.category}</td>
                      <td>
                        <span
                          className={`text-center ${
                            item.status === "Active"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {item.status}
                        </span>
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

export default Ticket;
