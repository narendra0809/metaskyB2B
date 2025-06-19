import { useState } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import useSendData from "../../hooks/useSendData";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";

const Taxes = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken: token } = useAuth();

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/taxes`, token);

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // Form Data State
  const addForm = useSendData(
    `${base_url}/api/tax`, // URL to send data to
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
      name: "",
      percentage: "",
    },
    editFormData: {
      id: null,
      name: "",
      percentage: "",
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
    const { name, value, type } = e.target;
    let filteredValue = value;

    if (name == "percentage") {
      filteredValue = value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    }

    setFormData((prev) => {
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: type == "file" ? e.target.files[0] : filteredValue,
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
            name: "",
            percentage: "",
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);

        const res = await fetch(
          `${base_url}/api/updatetaxes/${formData.editFormData.id}`,
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
        const res = await fetch(`${base_url}/api/deletetaxes/${id}`, {
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
          title="Add Tax"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Tax */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Tax Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Tax Name..."
                  name="name"
                  value={formData.addFormData.name}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="percentage" className="form-label">
                  Tax Percentage
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="percentage"
                  placeholder="Tax Percentage..."
                  name="percentage"
                  value={formData.addFormData.percentage}
                  onChange={handleFormDataChange("addFormData")}
                />
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
          title="Edit Taxes"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Tax */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Tax Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  placeholder="Tax Name..."
                  name="name"
                  value={formData.editFormData.name}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="percentage" className="form-label">
                  Tax Percentage
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="percentage"
                  placeholder="Tax Percentage..."
                  name="percentage"
                  value={formData.editFormData.percentage}
                  onChange={handleFormDataChange("editFormData")}
                />
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
          <h2 className="display-title">Taxes</h2>
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
            Add Taxes
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Tax Name</th>
                  <th>Percentage</th>
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
                      {/* Find the tax name */}
                      <td>{item.name}</td>

                      {/* Find the tax percentage */}
                      <td>{item.percentage}</td>

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

export default Taxes;
