import { useState } from 'react'
import Modal from '../../components/modal'
import useApiData from '../../hooks/useApiData'
import useSendData from '../../hooks/useSendData'
import './common.css'
import { useAuth } from '../../context/authContext'
import Confirm from '../../components/confirm'
import Loader from '../../Loader'
import '../../Loader.css'

const Destinations = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authToken: token } = useAuth()

  // Fetch destination and country data
  const countriesData = useApiData(`${base_url}/api/countries`, token)
  const destinationsData = useApiData(`${base_url}/api/getdestinations`, token)

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [currPageNo, setCurrPageNo] = useState(0)

  // form data
  const addForm = useSendData(
    `${base_url}/api/setdestination`, // URL to send data to
    token // Auth token
  )
  const [editRes, setEditRes] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  })

  // Form data for add/edit
  const [formData, setFormData] = useState({
    addFormData: {
      city_id: '',
      state_id: '',
      country_id: '',
      status: '',
    },
    editFormData: {
      id: null,
      city_id: '',
      state_id: '',
      country_id: '',
      status: '',
    },
  })

  // Handle search input change
  const handleSearch = (e) => {
    setSearchValue(e.target.value)
    setCurrPageNo(0)
  }

  // Handle page change
  const handlePageChange = (increment) => {
    const newPageNo = currPageNo + increment
    if (
      newPageNo >= 0 &&
      newPageNo < Math.ceil(filteredData.length / perPage)
    ) {
      setCurrPageNo(newPageNo)
    }
  }

  // Filter destinations based on search value
  const filteredData =
    destinationsData.data?.destinations?.filter((item) => {
      const cityName =
        countriesData.data?.cities
          .find((city) => city.id === item.city_id)
          ?.name?.toLowerCase() || ''

      const searchTerm = searchValue.toLowerCase()

      // Check if the search term matches any of the country, state, or city names
      return cityName.includes(searchTerm)
    }) || []

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  )

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      switch (name) {
        case 'country_id':
          prev[formType] = { ...prev[formType], state_id: '', city_id: '' }
          break
        case 'state_id':
          prev[formType] = { ...prev[formType], city_id: '' }
          break
      }

      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: value,
        },
      }
    })
  }

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null)
    setModals((prev) => ({ ...prev, [modalType]: isOpen }))
  }

  // Confirmation
  const [isConfirm, setIsConfirm] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState(null)

  const handleDeleteClick = (id, name) => {
    setRecordToDelete((prev) => ({ id, name }))
    setIsConfirm(true)
  }

  const handleConfirm = (confirm, id = null) => {
    if (confirm) {
      ;(async () => {
        await fetch(`${base_url}/api/deletedestination/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        destinationsData.refetch()
      })()
    } else {
      setRecordToDelete(null)
    }
    setIsConfirm(false)
  }

  // submit form
  const submitFormData = async (formType) => {
    switch (formType) {
      case 'addFormData':
        await addForm.sendData(formData['addFormData'])

        setFormData((item) => ({
          ...item,
          [formType]: {
            ...(formType === 'editFormData' && { id: null }),
            city_id: '',
            state_id: '',
            country_id: '',
            status: '',
          },
        }))
        break
      case 'editFormData':
        setEditLoading(true)
        const res = await fetch(
          `${base_url}/api/editdestination/${formData.editFormData.id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData['editFormData']),
          }
        )

        const result = await res.json()
        setEditRes(result)
        setEditLoading(false)
        break
    }

    destinationsData.refetch()
  }

  return (
    <>
      <section className="display-section" >
        {/* Add Modal */}
        <Modal
          open={modals.addModalOpen }

          handleClose={() => toggleModal('addModalOpen', false)}
          title="Add Destination"

        >
          {/* Modal content */}
          <div className="container p-3 ">
            {/* Country */}
            <div className="mb-3">
              <label htmlFor="country_id" className="form-label">
                Country
              </label>
              <select
                className="form-control"
                name="country_id"
                value={formData.addFormData.country_id}
                onChange={handleFormDataChange('addFormData')}
              >
                <option value="">-- select country --</option>
                {countriesData.data?.countries.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {/* state */}
            <div className="mb-3">
              <label htmlFor="state_id" className="form-label">
                State
              </label>
              <select
                className="form-control"
                name="state_id"
                value={formData.addFormData.state_id}
                onChange={handleFormDataChange('addFormData')}
              >
                <option value="">-- select state --</option>
                {countriesData.data?.states
                  .filter(
                    (item) => item.country_id === formData.addFormData.country_id
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* City */}
            <div className="mb-3">
              <label htmlFor="city_id" className="form-label">
                City
              </label>
              <select
                className="form-control"
                name="city_id"
                id="city_id"
                value={formData.addFormData.city_id}
                onChange={handleFormDataChange('addFormData')}
              >
                <option value="">-- select city --</option>
                {countriesData.data?.cities
                  .filter(
                    (item) => item.state_id === formData.addFormData.state_id
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* Status */}
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                className="form-control"
                name="status"
                id="status"
                value={formData.addFormData.status}
                onChange={handleFormDataChange('addFormData')}
              >
                <option value="">-- select country --</option>
                <option value={0}>Offline</option>
                <option value={1}>Online</option>
              </select>
            </div>
            {addForm.response &&
              (addForm.response?.success ? (
                <div className="alert alert-success m-0">
                  {addForm.response?.message}
                </div>
              ) : (
                <div className="alert alert-danger m-0">
                  {typeof addForm.response.errors === 'object'
                    ? Object.values(addForm.response.errors)[0]
                    : addForm.response.errors}
                </div>
              ))}
            {/* Other select fields (state, city, status) */}
          </div>
          <div className="container p-3">
            <button
              className="btn btn-primary"
              onClick={() => submitFormData('addFormData')}
            >
              {addForm.loading ? 'Processing' : 'Add'}
            </button>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal('editModalOpen', false)}
          title="Edit Destination"
        >
          {/* Modal content */}
          <div className="container p-3">
            {/* Country */}
            <div className="mb-3">
              <label htmlFor="country_id" className="form-label">
                Country
              </label>
              <select
                className="form-control"
                name="country_id"
                value={formData.editFormData.country_id}
                onChange={handleFormDataChange('editFormData')}
              >
                <option value="">-- select country --</option>
                {countriesData.data?.countries.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            {/* state */}
            <div className="mb-3">
              <label htmlFor="state_id" className="form-label">
                State
              </label>
              <select
                className="form-control"
                name="state_id"
                value={formData.editFormData.state_id}
                onChange={handleFormDataChange('editFormData')}
              >
                <option value="">-- select state --</option>
                {countriesData.data?.states
                  .filter(
                    (item) =>
                      item.country_id === formData.editFormData.country_id
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* City */}
            <div className="mb-3">
              <label htmlFor="city_id" className="form-label">
                City
              </label>
              <select
                className="form-control"
                name="city_id"
                id="city_id"
                value={formData.editFormData.city_id}
                onChange={handleFormDataChange('editFormData')}
              >
                <option value="">-- select city --</option>
                {countriesData.data?.cities
                  .filter(
                    (item) => item.state_id === formData.editFormData.state_id
                  )
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            {/* Status */}
            <div className="mb-3">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                className="form-control"
                name="status"
                id="status"
                value={formData.editFormData.status ? '1' : '0'}
                onChange={handleFormDataChange('editFormData')}
              >
                <option value="">-- select country --</option>
                <option value={0}>Offline</option>
                <option value={1}>Online</option>
              </select>
            </div>
            {/* Other select fields (state, city, status) */}
            {editRes &&
              (editRes?.success ? (
                <div className="alert alert-success m-0">
                  {editRes?.message}
                </div>
              ) : (
                <div className="alert alert-danger m-0">
                  {typeof editRes.error === 'object'
                    ? Object.values(editRes.error)[0]
                    : editRes.error}
                </div>
              ))}
          </div>
          <div className="container p-3">
            <button
              className="btn btn-warning"
              onClick={() => submitFormData('editFormData')}
            >
              {editLoading ? 'Processing' : 'Update'}
            </button>
          </div>
        </Modal>

        {/* Confirm */}
        <Confirm
          open={isConfirm}
          handleConfirm={() => {
            handleConfirm(true, recordToDelete?.id)
          }}
          handleClose={() => {
            handleConfirm(false)
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
            onClick={() => toggleModal('addModalOpen', true)}
          >
            Add Destination
          </button>
        </div>
        <div style={{ display: 'grid' }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>City</th>
                  <th>State</th>
                  <th>Country</th>
                  <th>Status</th>
                  <th style={{ width: '1%' }}>Action</th>
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
                    )
                    return (
                      <tr key={item.id}>
                        {/* Find the city name */}
                        <td>{curCity?.name || 'N/A'}</td>

                        {/* Find the state name */}
                        <td>
                          {countriesData.data?.states.find(
                            (state) => state.id === item.state_id
                          )?.name || 'N/A'}
                        </td>

                        {/* Find the country name */}
                        <td>
                          {countriesData.data?.countries.find(
                            (country) => country.id === item.country_id
                          )?.name || 'N/A'}
                        </td>

                        {/* Status */}
                        <td
                          className={`text-center ${
                            item.status ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {item.status ? 'Active' : 'Inactive'}
                        </td>

                        {/* Actions */}
                        <td style={{ width: '1%' }}>
                          <div className="d-flex">
                            <button
                              className="btn flex-shrink-0"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  editFormData: { ...item, id: item.id },
                                }))
                                toggleModal('editModalOpen', true)
                              }}
                            >
                              <i className="fa-solid fa-pencil text-warning"></i>
                            </button>
                            <button
                              className="btn flex-shrink-0"
                              onClick={() => {
                                handleDeleteClick(item.id, curCity.name)
                              }}
                            >
                              <i className="fa-solid fa-trash-can text-danger"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
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
                  className={`page-link ${currPageNo <= 0 && 'disabled'}`}
                  onClick={() => handlePageChange(-1)}
                >
                  Prev
                </button>
              </li>
              <li className="page-item">
                <button
                  className={`page-link ${
                    currPageNo + 1 >=
                      Math.ceil(filteredData.length / perPage) && 'disabled'
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
  )
}

export default Destinations
