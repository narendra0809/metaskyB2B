import { useState } from "react";
import TicketModal from "../../components/admin/TicketModal";
import Confirm from "../../components/Confirm";
import Modal from "../../components/Modal";
import TermsConditionsModal from "../../components/TermsConditions";
import { useAuth } from "../../context/AuthContext";
import { convertTo12HoursFormate } from "../../functions/utils";
import useApiData from "../../hooks/useApiData";
import useSendData from "../../hooks/useSendData";
import Loader from "../../Loader";
import "../../Loader.css";
import excelFormat from "../../public/data/tickets.xlsx";
import "./common.css";

const base_url = import.meta.env.VITE_API_URL;

const Tickets = () => {
  const { authToken } = useAuth();
  const token = authToken;
  const mainData = useApiData(`${base_url}/api/tickets`, token);
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);
  const addForm = useSendData(`${base_url}/api/tickets`, token);
  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState(null);
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
  const [isConfirm, setIsConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [openTermsConditions, setOpenTermsConditions] = useState(false);

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setCurrPageNo(0);
  };

  const handlePageChange = (increment) => {
    const newPageNo = currPageNo + increment;
    if (
      newPageNo >= 0 &&
      newPageNo < Math.ceil(filteredData.length / perPage)
    ) {
      setCurrPageNo(newPageNo);
    }
  };

  const filteredData =
    mainData.data?.data?.filter((item) =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

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
        toggleModal("addModalOpen", false);
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
    mainData.refetch();
  };

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
        <TicketModal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Ticket"
          data={formData.addFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({
              ...prev,
              addFormData: newData,
            }))
          }
          onSubmit={() => submitFormData("addFormData")}
          loading={addForm.loading}
          response={addForm.response}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
        {/* Edit Modal */}
        <TicketModal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Ticket"
          data={formData.editFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({
              ...prev,
              editFormData: newData,
            }))
          }
          onSubmit={() => submitFormData("editFormData")}
          loading={editLoading}
          response={editRes}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
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
                  <th>Start Time</th>
                  <th>Rates</th>
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
                            {timeSlot.start_time &&
                              convertTo12HoursFormate(timeSlot.start_time)}
                          </div>
                        ))}
                      </td>
                      <td>
                        {item.time_slots?.map((timeSlot, index) => (
                          <div key={index}>
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
