import { useEffect, useState } from 'react'
import useSendData from '../hooks/useSendData'

import Alert from '../components/alert'
import { useAuth } from '../context/authContext'

const ChangePassword = () => {
  const base_url = process.env.REACT_APP_API_URL
  const { authToken: token } = useAuth()

  /* -- States -- */
  const [msg, setMsg] = useState(null)
  const [succ, setSucc] = useState(false)
  const [popUp, setPopUp] = useState(false)
  
  // Add states for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  /* -- form -- */
  const defaultForm = {
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  }
  const [data, setData] = useState({ ...defaultForm })

  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget

    setData((item) => ({
      ...item,
      [name]: value,
    }))
  }

  const { sendData, response, loading } = useSendData(
    `${base_url}/api/changePassword`,
    token
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      data.current_password === '' ||
      data.new_password === '' ||
      data.new_password_confirmation === ''
    ) {
      setSucc(false)
      setMsg('All fields are required')
      setPopUp(true)
      return
    }

    if (
      data.current_password < 8 ||
      data.new_password < 8 ||
      data.new_password_confirmation < 8
    ) {
      
      setSucc(false)
      setMsg('All password Fields needs to be atleast 8 characters')
      setPopUp(true)
      return
    }

    if (data.new_password !== data.new_password_confirmation) {
      setSucc(false)
      setMsg("Confirmation password doesn't match")
      setPopUp(true)
      return
    }

    sendData(data)
  }
  useEffect(() => {
    if (!loading && response) {
      setSucc(response?.success)
      if (response?.success) {
        setMsg(response.message)
        setData({ ...defaultForm })
      } else {
        setMsg(
          typeof response.error === 'object'
            ? Object.values(response.error.new_password)[0]
            : response.error
        )
      }
      setPopUp(true)
    }
  }, [loading])

  // SVG eye icons as components
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  )

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  )

  return (
    <>
      <Alert
        open={popUp}
        handleClose={() => {
          setPopUp(false)
        }}
        success={succ}
      >
        <p>{msg}</p>
      </Alert>
      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Change Password</h1>
        </div>

        <div className="px-2 py-2 px-md-4 mt-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="current_password" className="fw-bold mb-1">
                Current Password
              </label>
              <div className="input-group">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="current_password"
                  className="form-control"
                  placeholder="Your Old Password..." 
                  name="current_password"
                  value={data.current_password}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="input-group-text" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ 
                    backgroundColor: "#000A2F", 
                    borderColor: "#15A2B0",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  {showCurrentPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="new_password" className="fw-bold mb-1">
                New Password
              </label>
              <div className="input-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="new_password"
                  className="form-control"
                  placeholder="Your New Password..."
                  name="new_password"
                  value={data.new_password}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="input-group-text" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ 
                    backgroundColor: "#000A2F", 
                    borderColor: "#15A2B0",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  {showNewPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <label
                htmlFor="new_password_confirmation"
                className="fw-bold mb-1"
              >
                Confirm Password
              </label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="new_password_confirmation"
                  className="form-control"
                  placeholder="Confirm Password..."
                  name="new_password_confirmation"
                  value={data.new_password_confirmation}
                  onChange={handleChange}
                  required
                />
                <span 
                  className="input-group-text" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ 
                    backgroundColor: "#000A2F", 
                    borderColor: "#15A2B0",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-success" type="submit">
                {loading ? 'Changing...' : 'Change'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  )
}

export default ChangePassword