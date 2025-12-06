import { useState, useRef } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import useSendFile from "../../hooks/useSendFile";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";
import excelFormat from "../../public/data/transportations.xlsx";
import TermsConditionsModal from "../../components/TermsConditions";
import PrivateTransportModal from "../../components/admin/PrivateTransport";
import ImportModal from "../../components/shared/ImportModal";

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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [openTermsConditions, setOpenTermsConditions] = useState(false);

  // Confirmation
  const [isConfirm, setIsConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

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
  const [options, setOptions] = useState({
    from: "",
    to: "",
    rate: "",
    transfer_type: "one_way",
  });
  const [formData, setFormData] = useState({
    addFormData: {
      destination_id: "",
      company_name: "",
      company_document: null,
      address: "",
      transport: "",
      vehicle_type: "",
      options: [],
      terms_and_conditions: null,
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
      item.company_name
        .toLowerCase()
        .includes(searchValue.toLowerCase())
    ).reverse() || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

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
          submitData.append(
            `options[${index}][transfer_type]`,
            option.transfer_type
          );
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
        if (key === "terms_and_conditions") {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
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
        <PrivateTransportModal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Private Transportation"
          data={formData.addFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, addFormData: newData }))
          }
          onSubmit={() => submitFormData("addFormData")}
          loading={addForm.loading}
          errors={formErrors.addFormErrors}
          destinations={destinationsData.data?.destinations || []}
          cities={countriesData.data?.cities || []}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
        <PrivateTransportModal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Private Transportation"
          data={formData.editFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, editFormData: newData }))
          }
          onSubmit={() => submitFormData("editFormData")}
          loading={editLoading}
          errors={formErrors.editFormErrors}
          destinations={destinationsData.data?.destinations || []}
          cities={countriesData.data?.cities || []}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
        <ImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          apiEndpoint={`${base_url}/api/transport/import`}
          token={token}
          onSuccess={() => mainData.refetch()}
        />

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
            onClose={() => setOpenTermsConditions(false)}
            open={openTermsConditions}
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
          <h2 className="display-title">Private Transportations</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />

          <a
            download={"transportations.xlsx"}
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
            Add Private Transportation
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Transporter Name</th>
                  <th>Transport</th>
                  <th>Vehicle Capacity</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Rate</th>
                  <th>Transfer Type</th>
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

                    return item.options?.map((opt, index) => (
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
                        <td>{opt.transfer_type}</td>
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
