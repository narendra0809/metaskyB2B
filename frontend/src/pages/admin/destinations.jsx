import { useState } from "react";
import Modal from "../../components/Modal";
import useApiData from "../../hooks/useApiData";
import useSendData from "../../hooks/useSendData";
import "./common.css";
import { useAuth } from "../../context/AuthContext";
import Confirm from "../../components/Confirm";
import Loader from "../../Loader";
import "../../Loader.css";
import DestinationModal from "../../components/admin/DestinationModal";

const Destinations = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken: token } = useAuth();

  // Fetch destination and country data
  const countriesData = useApiData(`${base_url}/api/countries`, token);
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token);

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

  // form data
  const addForm = useSendData(
    `${base_url}/api/setdestination`, // URL to send data to
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
      city_id: "",
      state_id: "",
      country_id: "229",
      status: "",
    },
    editFormData: {
      id: null,
      city_id: "",
      state_id: "",
      country_id: "",
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
    destinationsData.data?.destinations?.filter((item) => {
      const cityName =
        countriesData.data?.cities
          .find((city) => city.id === item.city_id)
          ?.name?.toLowerCase() || "";

      const searchTerm = searchValue.toLowerCase();

      // Check if the search term matches any of the country, state, or city names
      return cityName.includes(searchTerm);
    }) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null);
    setModals((prev) => ({ ...prev, [modalType]: isOpen }));
    if (modalType === "addModalOpen" && isOpen) {
      setFormData((prev) => ({
        ...prev,
        addFormData: {
          city_id: "",
          state_id: "",
          country_id: "229",
          status: "",
        },
      }));
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
        await fetch(`${base_url}/api/deletedestination/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        destinationsData.refetch();
      })();
    } else {
      setRecordToDelete(null);
    }
    setIsConfirm(false);
  };

  // submit form
  const submitFormData = async (formType) => {
    const dataToSend = { ...formData[formType] };

    if (!dataToSend.country_id) {
      dataToSend.country_id = "229";
    }

    switch (formType) {
      case "addFormData":
        await addForm.sendData(dataToSend);

        setFormData((item) => ({
          ...item,
          [formType]: {
            ...(formType === "editFormData" && { id: null }),
            city_id: "",
            state_id: "",
            country_id: "",
            status: "",
          },
        }));
        break;
      case "editFormData":
        setEditLoading(true);
        const res = await fetch(
          `${base_url}/api/editdestination/${formData.editFormData.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData["editFormData"]),
          }
        );

        const result = await res.json();
        setEditRes(result);
        setEditLoading(false);
        break;
    }
    setModals({ [formType]: false });
    destinationsData.refetch();
  };

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <DestinationModal
          open={modals.addModalOpen}
          handleClose={() => toggleModal("addModalOpen", false)}
          title="Add Destination"
          data={formData.addFormData}
          onDataChange={(newData) => {
            console.log(newData);
            setFormData((prev) => ({ ...prev, addFormData: newData }));
          }}
          onSubmit={() => submitFormData("addFormData")}
          loading={addForm.loading}
          response={addForm.response}
          countries={countriesData.data?.countries || []}
          states={countriesData.data?.states || []}
          cities={countriesData.data?.cities || []}
        />
        {/* Edit Modal */}
        <DestinationModal
          open={modals.editModalOpen}
          handleClose={() => toggleModal("editModalOpen", false)}
          title="Edit Destination"
          data={formData.editFormData}
          onDataChange={(newData) =>
            setFormData((prev) => ({ ...prev, editFormData: newData }))
          }
          onSubmit={() => submitFormData("editFormData")}
          loading={editLoading}
          response={editRes}
          countries={countriesData.data?.countries || []}
          states={countriesData.data?.states || []}
          cities={countriesData.data?.cities || []}
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

        <div className="display-header">
          <h2 className="display-title">Destinations</h2>
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
            Add Destination
          </button>
        </div>
        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th style={{ width: "1%" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {countriesData.loading || destinationsData.loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    const curCity = countriesData.data?.cities.find(
                      (city) => city.id === item.city_id
                    );
                    return (
                      <tr key={item.id}>
                        {/* Find the city name */}
                        <td>{curCity?.name || "N/A"}</td>

                        {/* Find the state name */}
                        <td>
                          {countriesData.data?.states.find(
                            (state) => state.id === item.state_id
                          )?.name || "N/A"}
                        </td>

                        {/* Find the country name */}
                        <td>
                          {countriesData.data?.countries.find(
                            (country) => country.id === item.country_id
                          )?.name || "N/A"}
                        </td>

                        {/* Status */}
                        <td
                          className={`text-center ${
                            item.status ? "text-success" : "text-danger"
                          }`}
                        >
                          {item.status ? "Active" : "Inactive"}
                        </td>

                        {/* Actions */}
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
                                handleDeleteClick(item.id, curCity.name);
                              }}
                            >
                              <i className="fa-solid fa-trash-can text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
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

export default Destinations;
