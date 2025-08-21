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
  const addForm = useSendFile(`${base_url}/api/transportation`, token);

  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  });

  // Form error state
  const [formErrors, setFormErrors] = useState({
    addFormErrors: {},
    editFormErrors: {},
  });

  // Form data for add/edit
  const inputDocs = useRef();
  const [options, setOptions] = useState({ from: "", to: "", rate: "" });
  const [formData, setFormData] = useState({
    addFormData: {
      destination_id: "",
      company_name: "",
      company_document: null,
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
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        [name]: type === "file" ? e.target.files[0] : value,
      },
    }));

    // Clear error for the changing field
    setFormErrors((prev) => ({
      ...prev,
      [formType.replace("Data", "Errors")]: {
        ...prev[formType.replace("Data", "Errors")],
        [name]: undefined,
      },
    }));
  };

  /* Options */
  const addOptions = (formType) => {
    if (!options.from || !options.to || !options.rate) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        options: [...prev[formType]["options"], options],
      },
    }));
    setOptions({ from: "", to: "", rate: "" });
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
  const removeOptions = (formType, from, to) => {
    const updatedOptions = formData[formType].options.filter(
      (option) => option.from !== from || option.to !== to
    );
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        options: updatedOptions,
      },
    }));
  };

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null);
    setFormErrors((prev) => ({
      ...prev,
      addFormErrors: {},
      editFormErrors: {},
    }));
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));
    if (!isOpen) {
      if (modalType === "addModalOpen") {
        setFormData((prev) => ({
          ...prev,
          addFormData: {
            destination_id: "",
            company_name: "",
            company_document: null,
            address: "",
            transport: "",
            vehicle_type: "",
            options: [],
          },
        }));
        setOptions({ from: "", to: "", rate: "" });
        if (inputDocs.current) inputDocs.current.value = "";
      }
      if (modalType === "editModalOpen") {
        setFormData((prev) => ({
          ...prev,
          editFormData: {
            id: null,
            destination_id: "",
            company_name: "",
            company_document: null,
            address: "",
            transport: "",
            vehicle_type: "",
            options: [],
          },
        }));
        setOptions({ from: "", to: "", rate: "" });
      }
    }
  };

  async function urlToFile(url, filename, mimeType) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  }

  // submit form
  const submitFormData = async (formType) => {
    const submitData = new FormData();
    Object.entries(formData[formType]).forEach(async ([key, value]) => {
      if (key === "options") {
        value.forEach((option, index) => {
          submitData.append(`options[${index}][from]`, option.from);
          submitData.append(`options[${index}][to]`, option.to);
          submitData.append(`options[${index}][rate]`, option.rate);
        });
      } else if (key === "company_document") {
        if (typeof value === "string") {
          const filename = value.split("/").pop();
          const mimeType = "";
          const fileObject = await urlToFile(value, filename, mimeType);
          submitData.append(key, fileObject);
        } else if (value) {
          submitData.append(key, value);
        }
      } else {
        submitData.append(key, value);
      }
    });

    let response;
    switch (formType) {
      case "addFormData":
        response = await addForm.sendData(submitData);
        if (response?.success) {
          setFormErrors((prev) => ({ ...prev, addFormErrors: {} }));
          setModals((prev) => ({ ...prev, addModalOpen: false }));
          mainData.refetch();
        } else if (response?.errors) {
          setFormErrors((prev) => ({
            ...prev,
            addFormErrors: response.errors,
          }));
        }
        break;
      case "editFormData":
        setEditLoading(true);
        const res = await fetch(
          `${base_url}/api/updatetransportation/${formData.editFormData.id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: submitData,
          }
        );

        const result = await res.json();
        setEditRes(result);
        setEditLoading(false);

        if (result?.success) {
          setFormErrors((prev) => ({ ...prev, editFormErrors: {} }));
          setModals((prev) => ({ ...prev, editModalOpen: false }));
          mainData.refetch();
        } else if (result?.errors) {
          setFormErrors((prev) => ({ ...prev, editFormErrors: result.errors }));
        }
        break;
    }
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
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Transporter Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Transporter Name..."
                  name="company_name"
                  value={formData.addFormData.company_name}
                  onChange={handleFormDataChange("addFormData")}
                />
                {formErrors.addFormErrors.company_name && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.company_name[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="company_document" className="form-label">
                  Vehicle Documents
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="company_document"
                  name="company_document"
                  ref={inputDocs}
                  onChange={handleFormDataChange("addFormData")}
                />
                {formErrors.addFormErrors.company_document && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.company_document[0]}
                  </div>
                )}
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
                {formErrors.addFormErrors.address && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.address[0]}
                  </div>
                )}
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
                {formErrors.addFormErrors.destination_id && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.destination_id[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="transport" className="form-label">
                  Vehicle Name
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
                {formErrors.addFormErrors.transport && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.transport[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="vehicle_type" className="form-label">
                  Vehicle Capacity
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vehicle_type"
                  placeholder="Vehicle Capacity..."
                  name="vehicle_type"
                  value={formData.addFormData.vehicle_type}
                  onChange={handleFormDataChange("addFormData")}
                />
                {formErrors.addFormErrors.vehicle_type && (
                  <div className="text-danger">
                    {formErrors.addFormErrors.vehicle_type[0]}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Options
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="From ..."
                      name="from"
                      value={options.from}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="To ..."
                      name="to"
                      value={options.to}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate ..."
                      name="rate"
                      value={options.rate}
                      onChange={handleOptions}
                    />
                  </div>
                  {formErrors.addFormErrors.options && (
                    <div className="text-danger mt-1">
                      {formErrors.addFormErrors.options[0]}
                    </div>
                  )}
                </div>
                <div>
                  {formData.addFormData.options.map((item) => (
                    <div
                      className="d-flex align-items-center gap-2 mt-2"
                      key={`${item.from} ${item.to} ${item.rate}`}
                    >
                      <div className="flex-grow-1">{item.from}</div>
                      <div className="flex-grow-1">{item.to}</div>
                      <div className="flex-grow-1">{item.rate}</div>
                      <div>
                        <button
                          className="btn p-1"
                          onClick={() =>
                            removeOptions("addFormData", item.from, item.to)
                          }
                          type="button"
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-success mt-3"
                  onClick={() => addOptions("addFormData")}
                  type="button"
                >
                  Add Option
                </button>
              </div>
            </div>

            <div className="container p-3">
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => submitFormData("addFormData")}
                disabled={addForm.loading}
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
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Transporter Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Transporter Name..."
                  name="company_name"
                  value={formData.editFormData.company_name}
                  onChange={handleFormDataChange("editFormData")}
                />
                {formErrors.editFormErrors.company_name && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.company_name[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="company_document" className="form-label">
                  Vehicle Documents
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="company_document"
                  name="company_document"
                  onChange={handleFormDataChange("editFormData")}
                />
                {formErrors.editFormErrors.company_document && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.company_document[0]}
                  </div>
                )}
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
                {formErrors.editFormErrors.address && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.address[0]}
                  </div>
                )}
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
                {formErrors.editFormErrors.destination_id && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.destination_id[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="transport" className="form-label">
                  Vehicle Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="transport"
                  placeholder="Vehicle Name..."
                  name="transport"
                  value={formData.editFormData.transport}
                  onChange={handleFormDataChange("editFormData")}
                />
                {formErrors.editFormErrors.transport && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.transport[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="vehicle_type" className="form-label">
                  Vehicle Capacity
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="vehicle_type"
                  placeholder="Vehicle Capacity..."
                  name="vehicle_type"
                  value={formData.editFormData.vehicle_type}
                  onChange={handleFormDataChange("editFormData")}
                />
                {formErrors.editFormErrors.vehicle_type && (
                  <div className="text-danger">
                    {formErrors.editFormErrors.vehicle_type[0]}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="mb-3">
                <label htmlFor="room_type" className="form-label">
                  Options
                </label>
                <div className="row g-2">
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="From ..."
                      name="from"
                      value={options.from}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="To ..."
                      name="to"
                      value={options.to}
                      onChange={handleOptions}
                    />
                  </div>
                  <div className="col-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rate ..."
                      name="rate"
                      value={options.rate}
                      onChange={handleOptions}
                    />
                  </div>
                </div>
                {formErrors.editFormErrors.options && (
                  <div className="text-danger mt-1">
                    {formErrors.editFormErrors.options[0]}
                  </div>
                )}
                <div>
                  {formData.editFormData.options.map((item) => (
                    <div
                      className="d-flex align-items-center gap-2 mt-2"
                      key={`${item.from} ${item.to} ${item.rate}`}
                    >
                      <div className="flex-grow-1">{item.from}</div>
                      <div className="flex-grow-1">{item.to}</div>
                      <div className="flex-grow-1">{item.rate}</div>
                      <div>
                        <button
                          className="btn p-1"
                          onClick={() =>
                            removeOptions("editFormData", item.from, item.to)
                          }
                          type="button"
                        >
                          <i className="fa-solid fa-trash-can text-danger"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-success mt-3"
                  onClick={() => addOptions("editFormData")} // Use "addFormData" or "editFormData" accordingly
                  type="button"
                >
                  Add Option
                </button>
              </div>
            </div>

            <div className="container p-3">
              <button
                className="btn btn-warning"
                type="submit"
                onClick={() => submitFormData("editFormData")}
                disabled={editLoading}
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
                  <th>Transporter Name</th>
                  <th>Transport</th>
                  <th>Vehicle Type</th>
                  {/* Removed Address and Destination */}
                  <th>From</th>
                  <th>To</th>
                  <th>Rate</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {countriesData.loading ||
                destinationsData.loading ||
                mainData.loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    // For cases where options array is empty, show a blank row with placeholders
                    if (!item.options || item.options.length === 0) {
                      return (
                        <tr key={item.id}>
                          <td>{item.company_name}</td>
                          <td>{item.transport}</td>
                          <td>{item.vehicle_type}</td>
                          <td colSpan="3" className="text-center text-muted">
                            No options available
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
                      );
                    }
                    // If multiple options, create multiple rows per option, showing company info only on first row
                    return item.options.map((opt, index) => (
                      <tr key={`${item.id}-${index}`}>
                        {index === 0 && (
                          <>
                            <td rowSpan={item.options.length}>
                              {item.company_name}
                            </td>
                            <td rowSpan={item.options.length}>
                              {item.transport}
                            </td>
                            <td rowSpan={item.options.length}>
                              {item.vehicle_type}
                            </td>
                          </>
                        )}
                        <td>{opt.from}</td>
                        <td>{opt.to}</td>
                        <td>{opt.rate}</td>
                        {index === 0 && (
                          <td
                            rowSpan={item.options.length}
                            style={{ width: "1%" }}
                          >
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
                        )}
                      </tr>
                    ));
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
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
