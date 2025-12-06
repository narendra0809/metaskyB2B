import { useState } from "react";
import SightseeingModal from "../../components/admin/SightseeingModal";
import Confirm from "../../components/Confirm";
import ImportModal from "../../components/shared/ImportModal";
import TermsConditionsModal from "../../components/TermsConditions";
import { useAuth } from "../../context/AuthContext";
import useApiData from "../../hooks/useApiData";
import useSendFile from "../../hooks/useSendFile";
import Loader from "../../Loader";
import "../../Loader.css";
import excelFormat from "../../public/data/sightseeings.xlsx";
import "./common.css";

const base_url = import.meta.env.VITE_API_URL;
const Sightseeing = () => {
  const { authToken: token } = useAuth();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const mainData = useApiData(`${base_url}/api/sightseeings`, token);
  const countriesData = useApiData(`${base_url}/api/countries`, token);
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token);
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);
  const [openTermsConditions, setOpenTermsConditions] = useState(false);
  const addForm = useSendFile(`${base_url}/api/sightseeing`, token);
  const [editRes, setEditRes] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  });
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
      item.company_name.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

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

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <SightseeingModal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Sharing Transport"
          data={formData.addFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, addFormData: newData }))
          }
          onSubmit={() => submitFormData("addFormData")}
          loading={addForm.loading}
          response={addForm.response}
          destinations={destinationsData.data?.destinations || []}
          cities={countriesData.data?.cities || []}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
        {/* Edit Modal */}
        <SightseeingModal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Sightseeing"
          data={formData.editFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, editFormData: newData }))
          }
          onSubmit={() => submitFormData("editFormData")}
          loading={editLoading}
          response={editRes}
          destinations={destinationsData.data?.destinations || []}
          cities={countriesData.data?.cities || []}
          onTermsClick={() => setOpenTermsConditions(true)}
        />
        {/* Import Modal */}
        <ImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          apiEndpoint={`${base_url}/api/sightseeing/import`}
          token={token}
          onSuccess={() => mainData.refetch()}
        />

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
          <h2 className="display-title">Sharing Transport</h2>
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
            Add Sharing Transport
          </button>
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Adult Rate</th>
                  <th>Child Rate</th>
                  {/* <th>Sharing Transfers</th> */}
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
                      {/* Name */}
                      <td>{item.company_name}</td>

                      {/* Address */}
                      <td>{item.address}</td>

                      {/* Adult Rate */}
                      <td>{item.rate_adult || "N/A"}</td>

                      {/* Child Rate */}
                      <td>{item.rate_child || "N/A"}</td>
                      {/* <td>
                        {item.sharing_transfer_adult}(adult) &{" "}
                        {item.sharing_transfer_child}(child)
                      </td> */}

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
