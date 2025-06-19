import { useState, useRef } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import useSendFile from "../../hooks/useSendFile";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";

const Transportation = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken: token } = useAuth();

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/transportations`, token);

  const countriesData = useApiData(`${base_url}/api/countries`, token);
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token);

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // Form Data State
  const addForm = useSendFile(
    `${base_url}/api/transportation`, // URL to send data to
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
  const inputDocs = useRef();
  const [options, setOptions] = useState({ type: "", rate: "" });
  const [formData, setFormData] = useState({
    addFormData: {
      destination_id: "",
      company_name: "",
      company_document: null,
      email: "",
      contact_no: "",
      address: "",
      transport: "",
      vehicle_type: "",
      options: [],
    },
    editFormData: {
      id: null,
      destination_id: "",
      company_name: "",
      company_document: null,
      email: "",
      contact_no: "",
      address: "",
      transport: "",
      vehicle_type: "",
      options: [],
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
      item.company_name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: type == "file" ? e.target.files[0] : value,
        },
      };
    });
  };

  /* Options */
  const addOptions = (formType) => {
    if (!options.type || !options.rate) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        options: [...prev[formType]["options"], options],
      },
    }));
    setOptions({ type: "", rate: "" });
  };
  const handleOptions = (e) => {
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

    setOptions((item) => ({
      ...item,
      [name]: filteredValue,
    }));
  };
  const removeOptions = (formType, type) => {
    // Filter out the options with the specified type
    const updatedOptions = formData[formType].options.filter(
      (option) => option.type !== type
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        options: updatedOptions, // Update the options list
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
    const submitData = new FormData();

    Object.entries(formData[formType]).forEach(([key, value]) => {
      if (key === "options") {
        // If the key is 'options', iterate through each option and append it separately
        value.forEach((option, index) => {
          submitData.append(`options[${index}][type]`, option.type);
          submitData.append(`options[${index}][rate]`, option.rate);
        });
      } else {
        submitData.append(key, value);
      }
    });

    switch (formType) {
      case "addFormData":
        await addForm.sendData(submitData);

        setFormData((item) => ({
          ...item,
          [formType]: {
            ...(formType === "editFormData" && { id: null }),
            destination_id: "",
            company_name: "",
            company_document: null,
            email: "",
            contact_no: "",
            address: "",
            transport: "",
            vehicle_type: "",
            options: [],
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);
        const res = await fetch(
          `${base_url}/api/updatetransportation/${formData.editFormData.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: submitData,
          }
        );

        const result = await res.json();

        setEditRes(result);
        setEditLoading(false);
        break;
    }

    setOptions({ type: "", rate: "" });

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
        const res = await fetch(`${base_url}/api/deletetransportation/${id}`, {
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
          title="Add Transportation"
        >
          {/* Modal content */}
          <div className="container p-3">
            {/* Country */}
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Transportation */}
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Company Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Company name..."
                  name="company_name"
                  value={formData.addFormData.company_name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="company_document" className="form-label">
                  Company Documents
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="company_document"
                  placeholder="Company Documents..."
                  name="company_document"
                  ref={inputDocs}
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
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  placeholder="Transport Address..."
                  name="address"
                  value={formData.addFormData.address}
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
                <label htmlFor="transport" className="form-label">
                  Transport
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="transport"
                  placeholder="Transport..."
                  name="transport"
                  value={formData.addFormData.transport}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="vehicle_type" className="form-label">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vehicle_type"
                  placeholder="Transport..."
                  name="vehicle_type"
                  value={formData.addFormData.vehicle_type}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              {/* Options */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Options
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="type"
                      value={options.type}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={options.rate}
                      onChange={handleOptions}
                    />
                  </div>
                </div>
                <div>
                  {formData.addFormData.options.map((item) => (
                    <div
                      className="row m-0 mt-2"
                      key={`${item.type} ${item.rate}`}
                    >
                      <div className="col-5">{item.type}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeOptions("addFormData", item.type);
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
                    addOptions("addFormData");
                  }}
                >
                  Add Option
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
          title="Edit Transportation"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Edit Form Transportation */}
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Company Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Company name..."
                  name="company_name"
                  value={formData.editFormData.company_name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="hotel_type" className="form-label">
                  Company Documents
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="company_document"
                  placeholder="Company Documents..."
                  name="company_document"
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
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  placeholder="Transport Address..."
                  name="address"
                  value={formData.editFormData.address}
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
                <label htmlFor="transport" className="form-label">
                  Transport
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="transport"
                  placeholder="Transport..."
                  name="transport"
                  value={formData.editFormData.transport}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="vehicle_type" className="form-label">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vehicle_type"
                  placeholder="Transport..."
                  name="vehicle_type"
                  value={formData.editFormData.vehicle_type}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              {/* Options */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Options
                </label>
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type..."
                      name="type"
                      value={options.type}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate..."
                      name="rate"
                      value={options.rate}
                      onChange={handleOptions}
                    />
                  </div>
                </div>
                <div>
                  {formData.editFormData.options.map((item) => (
                    <div
                      className="row m-0 mt-2"
                      key={`${item.type} ${item.rate}`}
                    >
                      <div className="col-5">{item.type}</div>
                      <div className="col-5">{item.rate}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeOptions("editFormData", item.type);
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
                    addOptions("editFormData");
                  }}
                >
                  Add Option
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
          <h2 className="display-title">Transportations</h2>
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
            Add Transportation
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Company Name</th>
                  <th>Transport</th>
                  <th>Vehicle Type</th>
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
                      {/* Find the company_name */}
                      <td>{item.company_name}</td>

                      {/* Find the transport */}
                      <td>{item.transport}</td>

                      {/* Find the vehicle_type */}
                      <td>{item.vehicle_type}</td>

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
                              handleDeleteClick(item.id, item.transport);
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

export default Transportation;
