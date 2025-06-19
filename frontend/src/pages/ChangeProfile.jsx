import { useEffect, useState } from "react";
import useSendData from "../hooks/useSendData";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

const ChangeProfile = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, setAuthUser, authToken } = useAuth();

  /* -- State -- */
  const [msg, setMsg] = useState(null);
  const [succ, setSucc] = useState(false);
  const [popUp, setPopUp] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    company_name: "",
    phoneno: "",
    address: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base_url}/api/showuser/${authUser.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": true,
          },
        });

        const resData = await res.json();

        if (resData) {
          setFormData({
            username: resData.username,
            email: resData.email,
            company_name: resData.company_name,
            phoneno: resData.phoneno,
            address: resData.address,
          });
        }
      } catch (error) {
        setMsg(error.Alert);
        setSucc(false);
        setPopUp(true);
      }
    })();
  }, [authToken, authUser.id, base_url]);

  /* -- Form -- */
  const { loading, response, sendData } = useSendData(
    `${base_url}/api/updateuser/${authUser.id}`,
    authToken
  );

  /* -- Handle Change -- */
  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;
    let filteredValue = value;

    switch (name) {
      case "phoneno":
        filteredValue = value.replace(/[^0-9]/g, "");
        break;

      default:
        filteredValue = value;
        break;
    }

    setFormData((item) => ({
      ...item,
      [name]: filteredValue,
    }));
  };

  /* -- Handle Submit -- */
  const submitForm = (e) => {
    e.preventDefault();
    sendData(formData);
  };

  useEffect(() => {
    if (!loading && response) {
      setPopUp(true);
      setSucc(response?.success);
      if (response?.success) {
        setAuthUser((prev) => ({ ...prev, username: formData.username }));
        setMsg(response.message);
      } else {
        setMsg(
          typeof response.error === "object"
            ? Object.values(response.error)[0]
            : response.error
        );
      }
    }
  }, [loading, response, formData.username, setAuthUser]);

  return (
    <>
      <Alert
        open={popUp}
        handleClose={() => {
          setPopUp(false);
        }}
        success={succ}
      >
        <p>{msg}</p>
      </Alert>
      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Change Profile</h1>
        </div>

        <div className="px-2 py-2 px-md-4 mt-4">
          <form onSubmit={submitForm}>
            <div className="row">
              <div className="col-12 col-lg-8">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="username" className="fw-bold mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className="form-control"
                      placeholder="Your Username..."
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="fw-bold mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      id="email"
                      className="form-control"
                      placeholder="Your Email..."
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  {authUser.role === "agent" && (
                    <div className="col-12 col-md-6">
                      <label htmlFor="company_name" className="fw-bold mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        className="form-control"
                        placeholder="Your Company's Name..."
                        name="company_name"
                        required
                        value={formData.company_name}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                  <div
                    className={`col-12 ${
                      authUser.role === "agent" ? "col-md-6" : ""
                    }`}
                  >
                    <label htmlFor="phone_number" className="fw-bold mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phone_number"
                      className="form-control"
                      placeholder="Your Phone Number..."
                      name="phoneno"
                      maxLength={10}
                      required
                      value={formData.phoneno}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="address" className="fw-bold mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="form-control"
                      placeholder="Your Address..."
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-success">
                {loading ? "Processing" : "Update"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ChangeProfile;
