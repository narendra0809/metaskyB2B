import { useState, useRef } from 'react'
import Modal from '../../components/modal'
import useApiData from '../../hooks/useApiData'
import './common.css'
import useSendFile from '../../hooks/useSendFile'
import Loader from '../../Loader'
import '../../Loader.css'
import { useAuth } from '../../context/authContext'

const Agents = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authToken: token } = useAuth()

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/agent`, token)

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [currPageNo, setCurrPageNo] = useState(0)

  // Form Data State
  const addForm = useSendFile(
    `${base_url}/api/register`, // URL to send data to
    token // Auth token
  )

  const [editRes, setEditRes] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  const inputLogo = useRef()
  const inputDocs = useRef()

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  })

  // Form data for add/edit
  const [formData, setFormData] = useState({
    addFormData: {
      username: '',
      company_name: '',
      phoneno: '',
      address: '',
      company_documents: null,
      company_logo: null,
      reffered_by: '',
      role: 'agent',
      email: '',
      password: '',
      password_confirmation: '',
    },
    editFormData: {
      id: null,
      username: '',
      company_name: '',
      phoneno: '',
      address: '',
      company_documents: null,
      company_logo: null,
      reffered_by: '',
      email: '',
      password: '',
      password_confirmation: '',
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
    mainData.data?.filter((item) =>
      item.username?.toLowerCase().includes(searchValue.toLowerCase())
    ) || []

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  )

  // Handle form data changes
  const handleFormDataChange = (formType) => (e) => {
    const { name, value, type } = e.target
    let filteredValue = value

    switch (name) {
      case 'phoneno':
        filteredValue = value.replace(/[^0-9]/g, '')
        break

      default:
        filteredValue = value
        break
    }

    setFormData((prev) => {
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          [name]: type === 'file' ? e.target.files[0] : filteredValue,
        },
      }
    })
  }

  // Handle modal open/close
  const toggleModal = (modalType, isOpen) => {
    setEditRes(null)
    setModals((prev) => ({ ...prev, [modalType]: isOpen }))
  }

  // submit form
  const submitFormData = async (formType) => {
    const submitData = new FormData()

    if (formType === 'editFormData') {
      delete formData[formType].company_documents
      delete formData[formType].company_logo
    }

    Object.entries(formData[formType]).forEach(([key, value]) => {
      submitData.append(key, value)
    })

    switch (formType) {
      case 'addFormData':
        await addForm.sendData(submitData)

        setFormData((item) => ({
          ...item,
          addFormData: {
            username: '',
            company_name: '',
            phoneno: '',
            address: '',
            company_documents: null,
            company_logo: null,
            reffered_by: '',
            role: 'agent',
            email: '',
            password: '',
            password_confirmation: '',
          },
        }))
        if (inputLogo.current) {
          inputLogo.current.value = ''
        }
        if (inputDocs.current) {
          inputDocs.current.value = ''
        }
        break
      case 'editFormData':
        setEditLoading(true)

        const res = await fetch(
          `${base_url}/api/updateuser/${formData.editFormData.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: submitData,
          }
        )

        const result = await res.json()

        setEditRes(result)
        setEditLoading(false)
        break
    }

    mainData.refetch()
  }

  return (
    <>
      <section className="display-section">
        {/* Add Modal */}
        <Modal
          open={modals.addModalOpen}
          handleClose={() => toggleModal('addModalOpen', false)}
          title="Add Agent"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Add Form Agent */}
              <div className="row g-3">
                {/* Username */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter Username"
                      name="username"
                      value={formData.addFormData.username}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="username">Username</label>
                  </div>
                </div>
                {/* Email */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      placeholder="Enter Email"
                      name="email"
                      value={formData.addFormData.email}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* compoany name */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="company_name"
                      placeholder="Enter Company Name"
                      name="company_name"
                      value={formData.addFormData.company_name}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="company_name">Company Name</label>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="phoneno"
                      placeholder="Enter Phone"
                      name="phoneno"
                      maxLength="10"
                      value={formData.addFormData.phoneno}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="phoneno">Phone Number</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* Address */}
                <div className="col-sm-12">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      placeholder="Enter Address"
                      name="address"
                      value={formData.addFormData.address}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="address">Address</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* Reffered By */}
                <div className="col-sm-12">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="reffered_by"
                      placeholder="Enter Reffered By"
                      name="reffered_by"
                      value={formData.addFormData.reffered_by}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="reffered_by">Reffered By</label>
                  </div>
                </div>
              </div>
              <div className="row">
                {/* Company Documnets */}
                <div className="col-sm-12">
                  <div className="mb-2 mt-2">
                    <label
                      htmlFor="company_documents"
                      className="text-muted mb-2"
                    >
                      Company Documnets
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="company_documents"
                      placeholder="Enter Company Documnets"
                      name="company_documents"
                      ref={inputDocs}
                      onChange={handleFormDataChange('addFormData')}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                {/* Company Logo */}
                <div className="col-sm-12">
                  <div className="mb-2 mt-2">
                    <label htmlFor="company_logo" className="text-muted mb-2">
                      Company Logo
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="company_logo"
                      placeholder="Enter Company Logo"
                      name="company_logo"
                      ref={inputLogo}
                      onChange={handleFormDataChange('addFormData')}
                    />
                  </div>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-sm-6">
                  {/* Password */}
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter Password"
                      name="password"
                      value={formData.addFormData.password}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                </div>
                <div className="col-sm-6">
                  {/* Confirm Password */}
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="password"
                      className="form-control"
                      id="password_confirmation"
                      placeholder="Confirm Password"
                      name="password_confirmation"
                      value={formData.addFormData.password_confirmation}
                      onChange={handleFormDataChange('addFormData')}
                    />
                    <label htmlFor="password_confirmation">
                      Confirm Password
                    </label>
                  </div>
                </div>
              </div>
              {addForm.response &&
                (addForm.response?.success ? (
                  <div className="alert alert-success">
                    {addForm.response?.message}
                  </div>
                ) : (
                  <div className="alert alert-danger">
                    {typeof addForm.response.errors === 'object'
                      ? Object.values(addForm.response.errors)[0]
                      : addForm.response.errors}
                  </div>
                ))}
            </div>
            <div className="container p-3">
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => submitFormData('addFormData')}
              >
                {addForm.loading ? 'Processing...' : 'Add'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal('editModalOpen', false)}
          title="Edit Agent"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Edit Form Agent */}
              <div className="row g-3">
                {/* Username */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter Username"
                      name="username"
                      value={formData.editFormData.username}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="username">Username</label>
                  </div>
                </div>
                {/* Email */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="email"
                      placeholder="Enter Email"
                      name="email"
                      value={formData.editFormData.email}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* compoany name */}
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="company_name"
                      placeholder="Enter Company Name"
                      name="company_name"
                      value={formData.editFormData.company_name}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="company_name">Company Name</label>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="phoneno"
                      placeholder="Enter Phone"
                      name="phoneno"
                      maxLength="10"
                      value={formData.editFormData.phoneno}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="phoneno">Phone Number</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* Address */}
                <div className="col-sm-12">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      placeholder="Enter Address"
                      name="address"
                      value={formData.editFormData.address}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="address">Address</label>
                  </div>
                </div>
              </div>
              <div className="row g-3">
                {/* Reffered By */}
                <div className="col-sm-12">
                  <div className="form-floating mb-2 mt-2">
                    <input
                      type="text"
                      className="form-control"
                      id="reffered_by"
                      placeholder="Enter Reffered By"
                      name="reffered_by"
                      autoComplete="off"
                      value={formData.editFormData?.reffered_by}
                      onChange={handleFormDataChange('editFormData')}
                    />
                    <label htmlFor="reffered_by">Reffered By</label>
                  </div>
                </div>
              </div>

              {editRes &&
                (editRes?.success ? (
                  <div className="alert alert-success">{editRes?.message}</div>
                ) : (
                  <div className="alert alert-danger">
                    {typeof editRes.errors === 'object'
                      ? Object.values(editRes.errors)[0]
                      : editRes.errors}
                  </div>
                ))}
            </div>
            <div className="container p-3">
              <button
                className="btn btn-warning"
                type="submit"
                onClick={() => submitFormData('editFormData')}
              >
                {editLoading ? 'Processing...' : 'Update'}
              </button>
            </div>
          </div>
        </Modal>

        <div className="display-header">
          <h2 className="display-title">Agents</h2>
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
            Add Agent
          </button>
        </div>
        <div style={{ display: 'grid' }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Company Name</th>
                  <th style={{ width: '1%' }}>Approved</th>
                  <th style={{ width: '1%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mainData.loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <Loader/>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {/* Find the username */}
                      <td>{item.username}</td>

                      {/* Find the email */}
                      <td>{item.email}</td>

                      {/* Find the company name */}
                      <td>{item.company_name}</td>

                      <td className="text-center">
                        {/* Approve */}
                        <button
                          className="btn p-0 fs-4"
                          onClick={async () => {
                            const res = await fetch(
                              `${base_url}/api/approval/${item.id}`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                  is_approved: item.is_approved ? 0 : 1,
                                }),
                              }
                            )

                            mainData.refetch()
                          }}
                        >
                          {item.is_approved ? (
                            <i className="fa-solid fa-circle-check text-success"></i>
                          ) : (
                            <i className="fa-solid fa-circle-xmark text-danger"></i>
                          )}
                        </button>
                      </td>

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
                            onClick={async () => {
                              const res = await fetch(
                                `${base_url}/api/admindelete/${item.id}`,
                                {
                                  method: 'DELETE',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )

                              mainData.refetch()
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

export default Agents
