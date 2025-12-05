import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import useSendData from "../../hooks/useSendData";
import "./common.css";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";
import excelFormat from "../../public/data/tickets.xlsx";
import TermsConditionsModal from "../../components/TermsConditions";

const Tickets = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();
  const token = authToken;

  const mainData = useApiData(`${base_url}/api/tickets`, token);
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  const addForm = useSendData(`${base_url}/api/tickets`, token);

  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [timeSlotTemp, setTimeSlotTemp] = useState({
    start_time: "",
    adult_price: "",
    child_price: "",
  });

  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  });

  const [formData, setFormData] = useState({
    addFormData: {
      name: "",
      time_slots: [],
      has_time_slots: false,
      status: "Active",
      terms_and_conditions: null,
    },
    editFormData: {
      id: null,
      name: "",
      time_slots: [],
      category: [],
      has_time_slots: false,
      status: "Active",
      terms_and_conditions: null,
    },
  });

  const [openTermsConditions, setOpenTermsConditions] = useState(false);

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

  const handleFormDataChange = (formType) => (e) => {
    const { name, value, type, checked } = e.target;
    let filteredValue = value;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: checked,
          time_slots: checked ? prev[formType].time_slots : [],
        },
      }));
      return;
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
    if (timeSlotTemp.adult_price === "" || timeSlotTemp.child_price === "") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        time_slots: [...(prev[formType]["time_slots"] || []), timeSlotTemp],
      },
    }));
    setTimeSlotTemp({
      start_time: "",

      adult_price: "",
      child_price: "",
    });
  };

  const removeTimeSlot = (formType, slotObj) => {
    const updatedTimeSlots = formData[formType].time_slots.filter(
      (timeSlot) =>
        !(
          timeSlot.start_time === slotObj.start_time &&
          timeSlot.adult_price === slotObj.adult_price &&
          timeSlot.child_price === slotObj.child_price
        )
    );

    setFormData((prev) => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        time_slots: updatedTimeSlots,
      },
    }));
  };

  const toggleModal = (modalType, isOpen) => {
    setEditRes(null);
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));

    if (modalType === "addModalOpen" && isOpen) {
      setFormData((prev) => ({
        ...prev,
        addFormData: {
          name: "",
          time_slots: [],
          has_time_slots: false,
          status: "Active",
          terms_and_conditions: null,
        },
      }));
      setTimeSlotTemp({
        start_time: "",

        adult_price: "",
        child_price: "",
      });
    }
  };

  const submitFormData = async (formType) => {
    formData.addFormData.terms_and_conditions = JSON.stringify(
      formData.addFormData.terms_and_conditions
    );
    formData.editFormData.terms_and_conditions = JSON.stringify(
      formData.editFormData.terms_and_conditions
    );

    switch (formType) {
      case "addFormData":
        await addForm.sendData(formData.addFormData);

        setFormData((item) => ({
          ...item,
          addFormData: {
            name: "",
            time_slots: [],
            has_time_slots: false,
            status: "Active",
            terms_and_conditions: null,
          },
        }));
        break;

      case "editFormData":
        setEditLoading(true);
        try {
          const dataToSend = {
            ...formData.editFormData,
            _method: "POST",
          };

          console.log("Sending update data:", dataToSend);

          const res = await fetch(
            `${base_url}/api/tickets/${formData.editFormData.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(dataToSend),
            }
          );

          console.log("Raw response status:", res.status);

          if (!res.ok) {
            throw new Error(`Server responded with status: ${res.status}`);
          }

          const result = await res.json();
          console.log("Parsed response:", result);
          setEditRes(result);

          if (result.success) {
            toggleModal("editModalOpen", false);
            mainData.refetch();
            setFormData((prev) => ({
              ...prev,
              editFormData: {
                id: null,
                name: "",
                time_slots: [],
                has_time_slots: false,
                status: "Active",
                terms_and_conditions: null,
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

    setTimeSlotTemp({
      start_time: "",

      adult_price: "",
      child_price: "",
    });

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
      const res = await fetch(`${base_url}/api/ticket/import`, {
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

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="has_time_slots_add"
                  name="has_time_slots"
                  checked={formData.addFormData.has_time_slots}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      addFormData: {
                        ...prev.addFormData,
                        has_time_slots: e.target.checked,
                        // optional: if turning off, also clear time_slots
                        time_slots: e.target.checked
                          ? prev.addFormData.time_slots
                          : [],
                      },
                    }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="has_time_slots_add"
                >
                  Enable time slots
                </label>
              </div>

              <div className="mb-3">
                <label htmlFor="time_slot" className="form-label">
                  {formData.addFormData.has_time_slots ? "Time Slot" : "Rates"}
                </label>

                <div className="row g-2">
                  {formData.addFormData.has_time_slots && (
                    <>
                      <div className="col-3">
                        <input
                          type="time"
                          className="form-control"
                          placeholder="Start Time"
                          name="start_time"
                          value={timeSlotTemp.start_time || ""}
                          onChange={handleTimeSlot}
                        />
                      </div>
                    </>
                  )}

                  <div
                    className={
                      formData.addFormData.has_time_slots ? "col-3" : "col-6"
                    }
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate(AED)"
                      name="adult_price"
                      value={timeSlotTemp.adult_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                  <div
                    className={
                      formData.addFormData.has_time_slots ? "col-3" : "col-6"
                    }
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate(AED)"
                      name="child_price"
                      value={timeSlotTemp.child_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                </div>

                <div>
                  {formData.addFormData.time_slots?.map((item, index) => (
                    <div className="row m-0 mt-2" key={index}>
                      {formData.addFormData.has_time_slots && (
                        <div className="col-4">{item.start_time}</div>
                      )}
                      <div className="col-3">Adult: AED {item.adult_price}</div>
                      <div className="col-3">Child: AED {item.child_price}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            // if you now identify by start+end, adjust removeTimeSlot accordingly
                            removeTimeSlot("addFormData", item);
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
                  {formData.addFormData.has_time_slots
                    ? "Add Time Slot"
                    : "Add Rate"}
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
                  <div>
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
                  value={formData.editFormData.name || ""}
                  onChange={handleFormDataChange("editFormData")}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="has_time_slots_edit"
                  name="has_time_slots"
                  checked={formData.editFormData.has_time_slots}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      editFormData: {
                        ...prev.editFormData,
                        has_time_slots: e.target.checked,
                        time_slots: e.target.checked
                          ? prev.editFormData.time_slots
                          : [],
                      },
                    }))
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="has_time_slots_edit"
                >
                  Enable time slots
                </label>
              </div>
              <div className="mb-3">
                <label htmlFor="time_slot" className="form-label">
                  {formData.editFormData.has_time_slots ? "Time Slot" : "Rates"}
                </label>

                <div className="row g-2">
                  {formData.editFormData.has_time_slots && (
                    <>
                      <div className="col-3">
                        <input
                          type="time"
                          className="form-control"
                          placeholder="Start Time"
                          name="start_time"
                          value={timeSlotTemp.start_time || ""}
                          onChange={handleTimeSlot}
                        />
                      </div>
                    </>
                  )}

                  <div
                    className={
                      formData.editFormData.has_time_slots ? "col-3" : "col-6"
                    }
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Adult Rate(AED)"
                      name="adult_price"
                      value={timeSlotTemp.adult_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                  <div
                    className={
                      formData.editFormData.has_time_slots ? "col-3" : "col-6"
                    }
                  >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Child Rate(AED)"
                      name="child_price"
                      value={timeSlotTemp.child_price}
                      onChange={handleTimeSlot}
                    />
                  </div>
                </div>

                <div>
                  {formData.editFormData.time_slots?.map((item, index) => (
                    <div className="row m-0 mt-2" key={index}>
                      {item.start_time && (
                        <div className="col-4">{item.start_time}</div>
                      )}
                      <div className="col-3">Adult: AED {item.adult_price}</div>
                      <div className="col-3">Child: AED {item.child_price}</div>
                      <div className="col-2">
                        <button
                          className="btn flex-shrink-0"
                          onClick={() => {
                            removeTimeSlot("editFormData", item);
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
                  {formData.editFormData.has_time_slots
                    ? "Add Time Slot"
                    : "Add Rate"}
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
                  value={formData.editFormData.status || "Active"}
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
                  <div>
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
            initialData={
              formData.addFormData.terms_and_conditions ||
              formData.editFormData.terms_and_conditions
            }
          />
        )}

        <div className="display-header">
          <h2 className="display-title">Tickets</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />
          <a
            download={"tickets.xlsx"}
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
            Add Ticket
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Price</th>
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
                        {item.time_slots?.map((timeSlot, index) => (
                          <div key={index}>
                            {/* {timeSlot.start_time && `${timeSlot.start_time}`}{" "} */}
                            (Adult: AED {timeSlot.adult_price}, Child: AED{" "}
                            {timeSlot.child_price})
                          </div>
                        ))}
                      </td>
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

export default Tickets;
