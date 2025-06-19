import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './register.css'

const Register = () => {
  const base_url = process.env.REACT_APP_API_URL

  const [data, setData] = useState({
    username: '',
    company_name: '',
    phoneno: '',
    address: '',
    company_documents: null,
    company_logo: null,
    reffered_by: '',
    role: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const inputLogo = useRef()
  const inputDocs = useRef()

  const handleChange = ({ currentTarget }) => {
    const { name, value, type } = currentTarget

    setData((item) => ({
      ...item,
      [name]: type === 'file' ? currentTarget.files[0] : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (data.role === 'staff') {
      data.company_documents = null
      data.company_logo = null
      data.company_name = ''
    }

    try {
      setLoading(true)
      if (data.role === 'agent') {
        if (data.company_name === '') {
          throw new Error('Company Name is required')
        } else if (data.company_documents === null) {
          throw new Error('Company Documents field is required')
        } else if (data.company_logo === null) {
          throw new Error('Company Logo field is required')
        }
      }
      const formData = new FormData()

      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Send POST request to the API using fetch
      const response = await fetch(`${base_url}/api/register`, {
        method: 'POST',
        body: formData,
      })

      const resData = await response.json()

      // Check if the login was successful (status code 200-299)
      if (!resData.success) {
        throw new Error(Object.values(resData.errors)[0])
      }

      setData({
        username: '',
        company_name: '',
        phoneno: '',
        address: '',
        company_documents: null,
        company_logo: null,
        reffered_by: '',
        role: '',
        email: '',
        password: '',
        password_confirmation: '',
      })
      if (inputLogo.current) {
        inputLogo.current.value = ''
      }
      if (inputDocs.current) {
        inputDocs.current.value = ''
      }

      setError(null)
      setSuccess(resData.message)
    } catch (err) {
      // Handle error

      setSuccess('')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <section className="h-100 login-form">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-xl-10 pb-5">
              <div className="card rounded-3 text-black">
                <div className="row g-0">
                  <div className="col-lg-8">
                    <div className="card-body p-md-5 mx-md-4">
                      <div className="mt-5">
                        <h4 className="head">Register</h4>
                        <p
                          className=" register-data"
                          
                        >
                          to create your account
                        </p>
                      </div>

                      <form className="myForm" onSubmit={handleSubmit}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2" style={{background:'#02001e'}}>
                              <input
                                type="text"
                                className="form-control"
                                id="username"
                                placeholder="Enter Username"
                                name="username"
                                value={data.username}
                                onChange={handleChange}
                              />
                              <label htmlFor="username">Username</label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                id="email"
                                placeholder="Enter Email"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                              />
                              <label htmlFor="email">Email</label>
                            </div>
                          </div>
                        </div>
                        <div className="row g-3">
                          {/* compoany name */}
                          {data.role === 'agent' && (
                            <div className="col-md-6">
                              <div className="form-floating mb-2 mt-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="company_name"
                                  placeholder="Enter Company Name"
                                  name="company_name"
                                  value={data.company_name}
                                  onChange={handleChange}
                                />
                                <label htmlFor="company_name">
                                  Company Name
                                </label>
                              </div>
                            </div>
                          )}
                          <div
                            className={`col-md-${
                              data.role === 'agent' ? '6' : 12
                            }`}
                          >
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                id="phoneno"
                                placeholder="Enter Phone"
                                name="phoneno"
                                maxLength="10"
                                value={data.phoneno}
                                onChange={handleChange}
                              />
                              <label htmlFor="phoneno">Phone Number</label>
                            </div>
                          </div>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-12">
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                id="address"
                                placeholder="Enter Address"
                                name="address"
                                value={data.address}
                                onChange={handleChange}
                              />
                              <label htmlFor="address">Address</label>
                            </div>
                          </div>
                        </div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                id="reffered_by"
                                placeholder="Enter Reffered By"
                                name="reffered_by"
                                value={data.reffered_by}
                                onChange={handleChange}
                              />
                              <label htmlFor="reffered_by">Reffered By</label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2">
                              <select
                                className="form-select"
                                id="role"
                                name="role"
                                value={data.role}
                                onChange={handleChange}
                              >
                                <option value="" class="select">-- select --</option>
                                <option value="agent" class="select">Agent</option>
                                <option value="staff" class="select">Staff</option>
                              </select>
                              <label htmlFor="role" className="form-label">
                                User Type:
                              </label>
                            </div>
                          </div>
                        </div>
                        {/* company docs */}
                        {data.role === 'agent' && (
                          <>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="mb-2 mt-2">
                                  <label
                                    htmlFor="company_documents"
                                    className="register-data"
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
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="mb-2 mt-2">
                                  <label
                                    htmlFor="company_logo"
                                    className="register-data"
                                  >
                                    Company Logo
                                  </label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    id="company_logo"
                                    placeholder="Enter Company Logo"
                                    name="company_logo"
                                    ref={inputLogo}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="password"
                                className="form-control"
                                id="password"
                                placeholder="Enter Password"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                              />
                              <label htmlFor="password">Password</label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-floating mb-2 mt-2">
                              <input
                                type="password"
                                className="form-control"
                                id="password_confirmation"
                                placeholder="Confirm Password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={handleChange}
                              />
                              <label htmlFor="password_confirmation">
                                Confirm Password
                              </label>
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn btn-main w-100 mb-2 mt-2 py-3"
                          type="submit"
                        >
                          {loading ? 'Processing...' : 'Register'}
                        </button>

                        <div className="d-flex align-items-center justify-content-center pb-4">
                          <p className="mb-0 me-2">Already have an account?</p>
                          <Link to="/login">Login</Link>
                        </div>
                      </form>
                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                      {success && (
                        <div className="alert alert-success">{success}</div>
                      )}
                    </div>
                  </div>
                  {/* login-custom-col */}
                  <div className="col-lg-4 d-flex align-items-center border-start border-light-subtle">
                    <div className="text-center text-muted px-3 py-4 p-md-5 mx-md-4">
                      <img
                        src="/images/metalogo.webp"
                        className="mb-4 w-100"
                        style={{ maxWidth: '200px' }}
                        alt="logo"
                      />
                      <h4 className="mb-2 h5">System Features</h4>
                      <p className="small mb-0">
                        CRM system for query management proposal itinerary,
                        client, marketing and much more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Register
