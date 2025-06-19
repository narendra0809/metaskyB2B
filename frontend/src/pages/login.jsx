import { useState } from "react";
import "./login.css";
import { useAuth } from "../context/AuthContext";
import metalLogo from "../public/images/metalogo.webp";
import { Link } from "react-router-dom";

const Login = () => {
  const base_url = import.meta.env.VITE_API_URL;

  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
    // role: '',
  });

  const handleChange = ({ currentTarget }) => {
    const { name, value } = currentTarget;

    setData((item) => ({
      ...item,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (data.email === "" || data.password === "") {
        throw new Error("Please fill all the fields");
      }

      if (data.password.length < 8) {
        throw new Error("Password length must be greater than 8 characters");
      }

      // Send POST request to the API using fetch
      const response = await fetch(`${base_url}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();

      // Check if the login was successful (status code 200-299)
      if (!resData.success) {
        if (typeof resData.message == "object") {
          throw new Error(Object.values(resData.message)[0]);
        } else {
          throw new Error(resData.message);
        }
      }

      const { access_token, user } = resData;
      const token = access_token.split("|")[1].trim();

      login(user, token);
    } catch (err) {
      // Handle errors (e.g., invalid credentials)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login" style={{ background: "#02001e" }}>
      <section className="h-100 login-form ele">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-xl-10 pb-5">
              <div className="card rounded-3 text-white">
                <div className="row g-0">
                  <div className="col-lg-6">
                    <div className="card-body p-md-5 mx-md-4">
                      <div className="mt-5">
                        <h4 className="">Sign In</h4>
                        <p className="p-data">to access your account</p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3 mt-3">
                          <input
                            type="text"
                            className="form-control"
                            id="email"
                            placeholder="Enter Email"
                            name="email"
                            required
                            value={data.username}
                            onChange={handleChange}
                          />
                          <label htmlFor="email">Email</label>
                        </div>

                        <div className="form-floating mb-3 mt-3">
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter Password"
                            name="password"
                            required
                            value={data.password}
                            onChange={handleChange}
                          />
                          <label htmlFor="password">Password</label>
                        </div>

                        {/* Admin Role */}
                        {/* <div className="form-floating mb-3 mt-3">
                          <select
                            className="form-select"
                            id="role"
                            name="role"
                            required
                            value={data.role}
                            onChange={handleChange}
                          >
                            <option value="">-- select --</option>
                            <option value="Admin">Admin</option>
                            <option value="Agent">Agent</option>
                            <option value="Staff">Staff</option>
                          </select>
                          <label htmlFor="role" className="form-label">
                            User Type:
                          </label>
                        </div> */}

                        <button
                          className="btn btn-main w-100 mb-3"
                          type="submit"
                        >
                          {loading ? "Processing..." : "Log in"}
                        </button>

                        <div className="d-flex align-items-center justify-content-center pb-4">
                          <p className="mb-0 me-2">Don't have an account?</p>
                          <Link to="/register">Register</Link>
                        </div>
                      </form>

                      {error && (
                        <div className="alert alert-danger">{error}</div>
                      )}
                    </div>
                  </div>
                  {/* login-custom-col */}
                  <div className="col-lg-6 d-flex align-items-center border-start border-light-subtle">
                    <div className="text-center text-muted px-3 py-4 p-md-5 mx-md-4">
                      <img
                        src={metalLogo}
                        className="mb-4 w-100"
                        style={{ maxWidth: "200px" }}
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
  );
};

export default Login;
