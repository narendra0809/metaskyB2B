import { useState, useRef } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import useSendFile from "../../hooks/useSendFile";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";
import excelFormat from "../../public/data/sightseeings.xlsx";
import TermsConditionsModal from "../../components/TermsConditions";

const Sightseeing = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken: token } = useAuth();

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/sightseeings`, token);

  const countriesData = useApiData(`${base_url}/api/countries`, token);
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token);

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);
  const [openTermsConditions, setOpenTermsConditions] = useState(false);
  // Form Data state
  const addForm = useSendFile(
    `${base_url}/api/sightseeing`, // URL to send data to
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
      destination_id: "",
      company_name: "",
      address: "",
      description: "",
      rate_adult: "",
      rate_child: "",
      terms_and_conditions: null,
    },
    editFormData: {
      id: null,
      destination_id: "",
      company_name: "",
      address: "",
      description: "",
      rate_adult: "",
      rate_child: "",
      terms_and_conditions: null,
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
    let filteredValue = value;

    switch (name) {
      case "rate_adult":
      case "rate_child":
        filteredValue = value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "AED1");
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
          [name]: filteredValue,
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
    const submitData = new FormData();

    Object.entries(formData[formType]).forEach(([key, value]) => {
      if (value !== null) {
        if (key === "terms_and_conditions") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      }
    });

    switch (formType) {
      case "addFormData":
        await addForm.sendData(submitData);

        // setFormData((item) => ({
        //   ...item,
        //   [formType]: {
        //     ...(formType === "editFormData" && { id: null }),
        //     destination_id: "",
        //     company_name: "",
        //     address: "",
        //     description: "",
        //     rate_adult: "",
        //     rate_child: "",
        //   },
        // }));
        break;
      case "editFormData":
        setEditLoading(true);
        const res = await fetch(
          `${base_url}/api/updatesightseeing/${formData.editFormData.id}`,
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
        const res = await fetch(`${base_url}/api/deletesightseeing/${id}`, {
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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
    setImportError(null);
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setImportError("Please select an Excel file to import");
      return;
    }

    setImportLoading(true);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await fetch(`${base_url}/api/sightseeing/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setImportError(data.message || "Import failed");
      } else {
        // Optionally refresh data here
        mainData.refetch();
        setImportModalOpen(false);
        setImportFile(null);
      }
    } catch (error) {
      setImportError("Import failed: " + error.message);
    }

    setImportLoading(false);
  };

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <Modal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Sightseeing"
        >
          {/* Modal content */}
          <div className="container p-3 style={{backgroundColor:#000d3d}}">
            {/* Country */}
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Sightseeing */}
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Sightseeing Authority
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Sightseeing Authority..."
                  name="company_name"
                  value={formData.addFormData.company_name}
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
                  placeholder="Sightseeing Address..."
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
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  placeholder="Description..."
                  name="description"
                  value={formData.addFormData.description}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label d-block">Sharing Transfer</label>
                <div className="row g-2">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate"
                      name="sharing_transfer_adult"
                      value={formData.addFormData.sharing_transfer_adult || ""}
                      onChange={handleFormDataChange("addFormData")}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate"
                      name="sharing_transfer_child"
                      value={formData.addFormData.sharing_transfer_child || ""}
                      onChange={handleFormDataChange("addFormData")}
                    />
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="rate_adult" className="form-label">
                  Rate Adult
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rate_adult"
                  placeholder="Rate Adult..."
                  name="rate_adult"
                  value={formData.addFormData.rate_adult}
                  onChange={handleFormDataChange("addFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="rate_child" className="form-label">
                  Rate Child
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rate_child"
                  placeholder="Rate Child..."
                  name="rate_child"
                  value={formData.addFormData.rate_child}
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
            <div className="container p-3 d-flex justify-content-between">
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => submitFormData("addFormData")}
              >
                {addForm.loading ? "Processing..." : "Add"}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setOpenTermsConditions(true)}
              >
                {formData.addFormData.terms_and_conditions
                  ? "Edit terms & conditions"
                  : "Add terms & conditions"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Sightseeing"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Sightseeing */}
              <div className="mb-3">
                <label htmlFor="company_name" className="form-label">
                  Sightseeing Authority
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="company_name"
                  placeholder="Sightseeing Authority..."
                  name="company_name"
                  value={formData.editFormData.company_name}
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
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="description"
                  placeholder="Description..."
                  name="description"
                  value={formData.editFormData.description}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label className="form-label d-block">Sharing Transfer</label>
                <div className="row g-2">
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate"
                      name="sharing_transfer_adult"
                      value={formData.editFormData.sharing_transfer_adult || ""}
                      onChange={handleFormDataChange("editFormData")}
                    />
                  </div>
                  <div className="col">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate"
                      name="sharing_transfer_child"
                      value={formData.editFormData.sharing_transfer_child || ""}
                      onChange={handleFormDataChange("editFormData")}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="rate_adult" className="form-label">
                  Rate Adult
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rate_adult"
                  placeholder="Rate Adult..."
                  name="rate_adult"
                  value={formData.editFormData.rate_adult}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="rate_child" className="form-label">
                  Rate Child
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="rate_child"
                  placeholder="Rate Child..."
                  name="rate_child"
                  value={formData.editFormData.rate_child}
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
            <div className="container p-3 d-flex justify-content-between">
              <button
                className="btn btn-warning"
                type="submit"
                onClick={() => submitFormData("editFormData")}
              >
                {editLoading ? "Processing..." : "Update"}
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => setOpenTermsConditions(true)}
              >
                {formData.editFormData.terms_and_conditions
                  ? "Edit terms & conditions"
                  : "Add terms & conditions"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Import Modal */}
        <Modal
          open={importModalOpen}
          handleClose={() => {
            setImportModalOpen(false);
            setImportFile(null);
            setImportError(null);
          }}
          title="Import Excel File"
        >
          <div className="mb-3">
            <input
              type="file"
              accept=".xls,.xlsx"
              className="form-control"
              onChange={handleFileChange}
            />
          </div>
          {importError && <div className="text-danger mb-2">{importError}</div>}
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setImportModalOpen(false);
                setImportFile(null);
                setImportError(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImportSubmit}
              disabled={importLoading}
            >
              {importLoading ? "Importing..." : "Import"}
            </button>
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

        {openTermsConditions && (
          <TermsConditionsModal
            open={openTermsConditions}
            onClose={() => setOpenTermsConditions(false)}
            initialData={
              formData.addFormData.terms_and_conditions ||
              formData.editFormData.terms_and_conditions
            }
            onSubmit={(form) => {
              setFormData({
                addFormData: {
                  ...formData.addFormData,
                  terms_and_conditions: form,
                },
                editFormData: {
                  ...formData.editFormData,
                  terms_and_conditions: form,
                },
              });
            }}
          />
        )}

        <div className="display-header">
          <h2 className="display-title">Sightseeings</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />

          <a
            download={"sightseeings.xlsx"}
            href={excelFormat}
            className="btn btn-sm btn-primary"
          >
            Download Format
          </a>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setImportModalOpen(true)}
          >
            Import Excel
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => toggleModal("addModalOpen", true)}
          >
            Add Sightseeing
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Sightseeing Authority</th>
                  <th>Address</th>
                  <th>Adult Rate</th>
                  <th>Child Rate</th>
                  <th>Sharing Transfers</th>
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
                      {/* Sightseeing Authority */}
                      <td>{item.company_name}</td>

                      {/* Address */}
                      <td>{item.address}</td>

                      {/* Adult Rate */}
                      <td>{item.rate_adult || "N/A"}</td>

                      {/* Child Rate */}
                      <td>{item.rate_child || "N/A"}</td>
                      <td>
                        {item.sharing_transfer_adult}(adult) &{" "}
                        {item.sharing_transfer_child}(child)
                      </td>

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
                              handleDeleteClick(item.id, item.company_name);
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

export default Sightseeing;
