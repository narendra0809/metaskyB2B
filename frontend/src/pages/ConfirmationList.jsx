import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loader from "../Loader";
import "../Loader.css";

/* -- components -- */
import useApiData from "../hooks/useApiData";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

const ConfirmationList = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const agentRole = "agent";
  const adminRole = "admin";

  /* -- variables -- */
  let output, outputData, filteredData;
  let totalPageNo = 0;

  /* -- API URLs -- */
  const mainData = useApiData(
    `${base_url}/api/${
      authUser.role === adminRole
        ? "showbookings"
        : `showbooking/${authUser.id}`
    }`,
    authToken
  );

  // user data states
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userDataError, setUserDataError] = useState(null);

  useEffect(() => {
    (async () => {
      if (authUser.role === adminRole) {
        setUserDataLoading(true);
        try {
          const res = await fetch(`${base_url}/api/agent`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": true,
            },
          });

          const resData = await res.json();

          if (resData) {
            setUserData(resData);
          }
        } catch (error) {
          setUserDataError(error);
        } finally {
          setUserDataLoading(false);
        }
      } else {
        setUserDataLoading(true);
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
            setUserData(resData);
          }
        } catch (error) {
          setUserDataError(error);
        } finally {
          setUserDataLoading(false);
        }
      }
    })();
  }, []);

  /* -- state variables -- */
  const [filterValue, setFilterValue] = useState({
    search: "",
  });
  let [perPage, setPerPage] = useState(10);
  let [currPageNo, setCurrPageNo] = useState(0);

  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [popUp, setPopUp] = useState(false);

  /* -- render data -- */
  if (!mainData.loading && mainData.data?.data) {
    // filtering

    const rawData = [...mainData.data?.data];

    let data;
    if (authUser.role === adminRole) {
      data = rawData.filter(
        (item) => item.payment_status?.toLowerCase() === "paid"
      );
    } else {
      data = rawData.filter(
        (item) => item.booking?.payment_status?.toLowerCase() === "paid"
      );
    }

    data?.reverse();

    if (authUser.role === adminRole) {
      filteredData = data?.filter((item) => {
        return (
          item.customer_name
            .toLowerCase()
            .includes(filterValue.search.toLowerCase()) ||
          item.userData
            ?.find((user) => user.id === item.user_id)
            ?.email.includes(filterValue.search.toLowerCase())
        );
      });
    } else {
      filteredData = data?.filter((item) =>
        item.booking?.customer_name
          .toLowerCase()
          .includes(filterValue.search.toLowerCase())
      );
    }

    totalPageNo = Math.ceil(filteredData.length / perPage);

    // pagination
    outputData = filteredData.slice(
      perPage * currPageNo,
      perPage * currPageNo + perPage
    );

    // render
    output = outputData.map((item) =>
      authUser.role === adminRole ? (
        <tr key={item.id}>
          <td>{item.customer_name}</td>
          <td>{item.phone_no}</td>
          <td>{userData?.find((user) => user.id === item.user_id)?.email}</td>
          <td>
            {userData?.find((user) => user.id === item.user_id)?.company_name}
          </td>
          <td>
            {item.no_adults}
            {item.no_children > 0 && ` + ${item.no_children}`}
          </td>
          <td>{item.final_payment}</td>
          <td>{item.travel_date_from.split("T")[0]}</td>
          <td>{item.created_date.split("T")[0]}</td>
          <td>
            <button
              className="btn rounded-pill p-0"
              onClick={() => {
                handleCancelCustomer(item.id);
              }}
            >
              <span className="bg-danger text-light rounded-pill px-2 py-1">
                Cancel
              </span>
            </button>
          </td>
          <td>
            <div className="d-flex">
              <Link to={`/summary/${item.id}`} className="btn flex-shrink-0">
                <i className="fa-solid fa-eye text-primary"></i>
              </Link>
              <Link to={`/itinerary/${item.id}`} className="btn flex-shrink-0">
                <i className="fa-solid fa-circle-info text-primary"></i>
              </Link>
            </div>
          </td>
        </tr>
      ) : (
        <tr key={item.booking?.id}>
          <td>{item.booking?.customer_name}</td>
          <td>{item.booking?.phone_no}</td>
          <td>{userData?.email}</td>
          <td>{userData?.company_name}</td>
          <td>
            {item.booking?.no_adults}
            {item.booking?.no_children > 0 && ` + ${item.booking?.no_children}`}
          </td>
          <td>{item.booking?.final_payment}</td>
          <td>{item.booking?.travel_date_from.split("T")[0]}</td>
          <td>{item.booking?.created_date.split("T")[0]}</td>
          <td>
            <div className="d-flex">
              <Link
                to={`/summary/${item.booking?.id}`}
                className="btn flex-shrink-0"
              >
                <i className="fa-solid fa-eye text-primary"></i>
              </Link>
              <Link
                to={`/itinerary/${item.booking?.id}`}
                className="btn flex-shrink-0"
              >
                <i className="fa-solid fa-circle-info text-primary"></i>
              </Link>
            </div>
          </td>
        </tr>
      )
    );
  } else {
    output = (
      <tr>
        <td>Loading...</td>
      </tr>
    );
  }

  /* -- functions -- */
  const handlePerPage = (e) => {
    setPerPage(e.target.value);
    setCurrPageNo(0);
  };

  const handleSort = (key) => {
    // data = data.sort((a, b) => a[key] - b[key])
  };

  const handleFilter = ({ currentTarget }) => {
    setFilterValue((item) => ({
      ...item,
      [currentTarget.name]: currentTarget.value,
    }));
    setCurrPageNo(0);
  };

  const handlePageInc = () => {
    if (currPageNo + 1 < totalPageNo) {
      setCurrPageNo((item) => item + 1);
    }
  };
  const handlePageDec = () => {
    if (currPageNo > 0) {
      setCurrPageNo((item) => item - 1);
    }
  };

  const handleCancelCustomer = async (id) => {
    if (authUser.role != adminRole) {
      return;
    }

    const res = await fetch(`${base_url}/api/cancelbooking/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        customer_status: "cancelled",
        payment_status: "failed",
      }),
    });

    const response = await res.json();

    if (response) {
      if (response.success) {
        setSuccess(response.success);
        mainData.refetch();
      } else {
        setSuccess(response.success);
      }
      setErr(response.message);
      setPopUp(true);
    }
  };

  return (
    <>
      {authUser.role === adminRole && (
        <Alert
          open={popUp}
          handleClose={() => {
            setPopUp(false);
          }}
          success={success}
        >
          <p>{err}</p>
        </Alert>
      )}

      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Confirmed Customers</h1>
          {authUser.role === agentRole && (
            <Link to="/calculator" className="btn btn-primary">
              Add B2B
            </Link>
          )}
        </div>

        {/* Table */}
        <div className="mt-4">
          <div className="table-container">
            <div className="border-bottom">
              <div className="row g-3 pb-3">
                <div className="col-12 col-md-4 col-lg-3">
                  <select
                    id="destination"
                    className="ctform-sele"
                    name="country"
                    onChange={handleFilter}
                  >
                    <option value="">All Destination</option>
                    <option value="Thailand">Thailand</option>
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <select
                  id="show"
                  className="form-select"
                  onChange={handlePerPage}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  name="search"
                  placeholder="search..."
                  className="form-control"
                  value={filterValue.search}
                  onChange={handleFilter}
                />
              </div>
            </div>

            <div style={{ display: "grid" }}>
              <div className="table-responsive mt-4">
                <table className="table table-hover text-center">
                  <thead>
                    <tr>
                      <th
                        onClick={() => {
                          handleSort("");
                        }}
                      >
                        Customer Name
                      </th>
                      <th>Phone Number</th>
                      <th>Agent</th>
                      <th>Company Name</th>
                      <th>PAX</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>Created At</th>
                      {authUser.role === adminRole && <th>Cancellation</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {mainData.loading ? (
                      <tr>
                        <td colSpan={99}>
                          <Loader />
                        </td>
                      </tr>
                    ) : output.length > 0 ? (
                      output
                    ) : (
                      <tr>
                        <td colSpan={99}>No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  Showing {(currPageNo + 1) * perPage - (perPage - 1)} to{" "}
                  {(currPageNo + 1) * perPage < filteredData?.length
                    ? (currPageNo + 1) * perPage
                    : filteredData?.length}{" "}
                  of {filteredData?.length} entries
                </small>
                <ul className="pagination mt-4">
                  <li className="page-item">
                    <button
                      className={`page-link ${currPageNo <= 0 && "disabled"}`}
                      onClick={handlePageDec}
                    >
                      Prev
                    </button>
                  </li>
                  <li className="page-item">
                    <button
                      className={`page-link ${
                        currPageNo + 1 >= totalPageNo && "disabled"
                      }`}
                      onClick={handlePageInc}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ConfirmationList;
