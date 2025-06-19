import { useState } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import "../../Loader.css";
import Loader from "../../Loader";

import useSendData from "../../hooks/useSendData";
import { useAuth } from "../../context/AuthContext";

const Banking = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();

  const token = authToken;

  // Fetch destination and country data
  const mainData = useApiData(
    `${base_url}/api/bankdetail/${authUser.id}`,
    token
  );

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // Form Data State
  const addForm = useSendData(
    `${base_url}/api/bankdetail`, // URL to send data to
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
  const [formData, setFormData] = useState({
    addFormData: {
      user_id: authUser.id,
      account_details: "",
      upi_id: "",
      bank_name: "",
      account_holder_name: "",
      ifsc_code: "",
      account_type: "",
      branch: "",
      status: "",
    },
    editFormData: {
      id: null,
      user_id: "",
      account_details: "",
      upi_id: "",
      bank_name: "",
      account_holder_name: "",
      ifsc_code: "",
      account_type: "",
      branch: "",
      status: "",
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
    mainData.data?.data?.filter(
      (item) =>
        item.account_holder_name
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        item.bank_name?.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value, type } = e.target;
    let filteredValue = value;

    switch (name) {
      case "account_details":
        filteredValue = value.replace(/[^0-9]/g, "");
        break;

      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => {
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: type === "file" ? e.target.files[0] : filteredValue,
        },
      };
    });
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
          addFormData: {
            user_id: authUser.id,
            account_details: "",
            upi_id: "",
            bank_name: "",
            account_holder_name: "",
            ifsc_code: "",
            account_type: "",
            branch: "",
            status: "",
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);

        const res = await fetch(
          `${base_url}/api/updatebankdetail/${formData.editFormData.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData.editFormData),
          }
        );

        const result = await res.json();

        setEditRes(result);
        setEditLoading(false);
        break;
    }

    mainData.refetch();
  };

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <Modal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Details"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Bank */}
              <div className="mb-3">
                <label htmlFor="account_details" className="form-label">
                  Account Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account_details"
                  placeholder="Account Number..."
                  name="account_details"
                  value={formData.addFormData.account_details}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="upi_id" className="form-label">
                  UPI ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="upi_id"
                  placeholder="UPI ID..."
                  name="upi_id"
                  value={formData.addFormData.upi_id}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="bank_name" className="form-label">
                  Bank Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="bank_name"
                  placeholder="Bank Name..."
                  name="bank_name"
                  value={formData.addFormData.bank_name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="account_holder_name" className="form-label">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account_holder_name"
                  placeholder="Bank Name..."
                  name="account_holder_name"
                  value={formData.addFormData.account_holder_name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ifsc_code" className="form-label">
                  IFSC Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ifsc_code"
                  placeholder="Bank Name..."
                  name="ifsc_code"
                  value={formData.addFormData.ifsc_code}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="account_type" className="form-label">
                  Account Type
                </label>
                <select
                  className="form-control"
                  name="account_type"
                  value={formData.addFormData.account_type}
                  onChange={handleFormDataChange("addFormData")}
                >
                  <option value="">-- select user --</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="branch" className="form-label">
                  Branch
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="branch"
                  placeholder="Bank Name..."
                  name="branch"
                  value={formData.addFormData.branch}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  className="form-control"
                  name="status"
                  id="status"
                  value={formData.addFormData.status}
                  onChange={handleFormDataChange("addFormData")}
                >
                  <option value="">-- select user --</option>
                  <option value="online">Active</option>
                  <option value="offline">Inactive</option>
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
          title="Edit Details"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Edit Form Bank */}
              <div className="mb-3">
                <label htmlFor="account_details" className="form-label">
                  Account Number
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account_details"
                  placeholder="Account Number..."
                  name="account_details"
                  value={formData.editFormData.account_details}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="upi_id" className="form-label">
                  UPI ID
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="upi_id"
                  placeholder="UPI ID..."
                  name="upi_id"
                  value={formData.editFormData.upi_id}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="bank_name" className="form-label">
                  Bank Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="bank_name"
                  placeholder="Bank Name..."
                  name="bank_name"
                  value={formData.editFormData.bank_name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="account_holder_name" className="form-label">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="account_holder_name"
                  placeholder="Bank Name..."
                  name="account_holder_name"
                  value={formData.editFormData.account_holder_name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="ifsc_code" className="form-label">
                  IFSC Code
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="ifsc_code"
                  placeholder="Bank Name..."
                  name="ifsc_code"
                  value={formData.editFormData.ifsc_code}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="account_type" className="form-label">
                  Account Type
                </label>
                <select
                  className="form-control"
                  name="account_type"
                  value={formData.editFormData.account_type}
                  onChange={handleFormDataChange("editFormData")}
                >
                  <option value="">-- select user --</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="branch" className="form-label">
                  Branch
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="branch"
                  placeholder="Bank Name..."
                  name="branch"
                  value={formData.editFormData.branch}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  className="form-control"
                  name="status"
                  id="status"
                  value={formData.editFormData.status}
                  onChange={handleFormDataChange("editFormData")}
                >
                  <option value="">-- select user --</option>
                  <option value="online">Active</option>
                  <option value="offline">Inactive</option>
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

        <div className="display-header">
          <h2 className="display-title">Bank Details</h2>
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
            Add Details
          </button>
        </div>
        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Holder's Name</th>
                  <th>Account Number</th>
                  <th>Account Type</th>
                  <th>Bank Name</th>
                  <th>UPI ID</th>
                  <th>Status</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mainData.loading ? (
                  <tr>
                    <td colSpan="100" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {/* Find the account_holder_name */}
                      <td>{item.account_holder_name}</td>

                      {/* Find the account_details */}
                      <td>{item.account_details}</td>

                      {/* Find the account_type */}
                      <td>{item.account_type}</td>

                      {/* Find the bank_name */}
                      <td>{item.bank_name}</td>

                      {/* Find the upi_id */}
                      <td>{item.upi_id}</td>

                      {/* Status */}
                      <td
                        className={`text-center ${
                          item.status === "online"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {item.status === "online" ? "Active" : "Inactive"}
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
                            onClick={async () => {
                              const res = await fetch(
                                `${base_url}/api/deletebankdetail/${item.id}`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              mainData.refetch();
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
                    <td colSpan="100" className="text-center">
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

export default Banking;
