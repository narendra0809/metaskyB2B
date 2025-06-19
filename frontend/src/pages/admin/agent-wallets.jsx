import { useState } from 'react'
import Modal from '../../components/modal'
import useApiData from '../../hooks/useApiData'
import { useAuth } from '../../context/authContext'
import './common.css'

const AgentWallets = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authToken } = useAuth()

  const token = authToken

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/showbalance`, token)

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [currPageNo, setCurrPageNo] = useState(0)

  // Form Data State
  const [editRes, setEditRes] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  // Modal state
  const [modals, setModals] = useState({
    addModalOpen: false,
    editModalOpen: false,
  })

  const defForm = {
    amount: '',
    action: 'add',
    screenshot: null,
    details: '',
  }
  // Form data for add/edit
  const [formData, setFormData] = useState({
    editFormData: {
      id: null,
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
    mainData.data?.wallets?.filter((item) =>
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
      case 'amount':
        filteredValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
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
          [name]: type == 'file' ? e.target.files[0] : filteredValue,
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
    switch (formType) {
      case 'editFormData':
        setEditLoading(true)

        const submitEditData = new FormData()

        submitEditData.append('amount', formData.editFormData.amount)
        submitEditData.append('action', formData.editFormData.action)
        submitEditData.append('screenshot', formData.editFormData.screenshot)
        submitEditData.append('details', formData.editFormData.details)

        const res = await fetch(
          `${base_url}/api/wallet/update/${formData.editFormData.id}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: submitEditData,
          }
        )

        const result = await res.json()

        setEditRes(result)
        if (result?.success) {
          setFormData((prev) => ({
            ...prev,
            editFormData: {
              ...prev.editFormData,
              ...defForm,
            },
          }))
        }

        setEditLoading(false)

        break
    }

    mainData.refetch()
  }

  return (
    <>
      <section className="display-section">
        {/* Edit Modal */}
        <Modal
          open={modals.editModalOpen}
          handleClose={() => toggleModal('editModalOpen', false)}
          title="Edit Wallets"
        >
          {/* Modal content */}
          <div className="container p-3">
            <div className="container border-bottom border-light-subtle">
              {/* Edit Form Bank */}
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Agent Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Bank Name..."
                  name="username"
                  value={formData.editFormData.username}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label htmlFor="action" className="form-label">
                  Action
                </label>
                <select
                  className="form-control"
                  name="action"
                  id="action"
                  value={formData.editFormData.action}
                  onChange={handleFormDataChange('editFormData')}
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="amount" className="form-label">
                  Amount
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="amount"
                  placeholder="Amount..."
                  name="amount"
                  value={formData.editFormData.amount}
                  onChange={handleFormDataChange('editFormData')}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="screenshot" className="form-label">
                  Screenshot
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="screenshot"
                  placeholder="Screenshot..."
                  name="screenshot"
                  onChange={handleFormDataChange('editFormData')}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Details
                </label>
                <textarea
                  className="form-control"
                  name="details"
                  id="details"
                  placeholder="Details..."
                  value={formData.editFormData.details}
                  onChange={handleFormDataChange('editFormData')}
                ></textarea>
              </div>
              {editRes && (
                <div
                  className={`alert ${
                    editRes?.success ? 'alert-success' : 'alert-danger'
                  }`}
                >
                  {editRes?.message}
                </div>
              )}
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
          <h2 className="display-title">Agent Wallets</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />
        </div>
        <div style={{ display: 'grid' }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Agent Name</th>
                  <th style={{ width: '30%' }}>Balance</th>
                  <th style={{ width: '1%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mainData.loading ? (
                  <tr>
                    <td colSpan="100" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {/* username */}
                      <td>{item.username}</td>

                      {/* balance */}
                      <td style={{ width: '30%' }}>₹ {item.balance} /-</td>

                      <td style={{ width: '1%' }}>
                        <div className="d-flex">
                          <button
                            className="btn flex-shrink-0"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                editFormData: {
                                  ...defForm,
                                  username: item.username,
                                  id: item.user_id,
                                },
                              }))

                              toggleModal('editModalOpen', true)
                            }}
                          >
                            <i className="fa-solid fa-pencil text-warning"></i>
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

export default AgentWallets
