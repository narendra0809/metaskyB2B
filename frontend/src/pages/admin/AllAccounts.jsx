import { useState } from "react";
import useApiData from "../../hooks/useApiData";
import "./common.css";
import Loader from "../../Loader";
import "../../Loader.css";
import { useAuth } from "../../context/AuthContext";

const AllAccounts = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();

  const token = authToken;

  // Fetch destination and country data
  const mainData = useApiData(`${base_url}/api/allbankdetail/`, token);

  // State variables for search and pagination
  const [searchValue, setSearchValue] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currPageNo, setCurrPageNo] = useState(0);

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
    mainData.data?.data?.filter(
      (item) =>
        item.account_holder_name
          ?.toLowerCase()
          .includes(searchValue.toLowerCase()) ||
        item.bank_name?.toLowerCase().includes(searchValue.toLowerCase())
    ) || [];

  // Paginated data
  const paginatedData = filteredData.slice(
    perPage * currPageNo,
    perPage * currPageNo + perPage
  );

  return (
    <>
      <section className="display-section">
        <div className="display-header">
          <h2 className="display-title">All Bank Accounts</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="Search by name..."
            onChange={handleSearch}
          />
        </div>

        <div style={{ display: "grid" }}>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Holder's Name</th>
                  <th>Account Number</th>
                  <th>Account Type</th>
                  <th>Bank Name</th>
                  <th>UPI ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mainData.loading ? (
                  <tr>
                    <td colSpan="100" className="text-center">
                      <Loader />
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr key={item.id}>
                      {/* Find the account_holder_name */}
                      <td>{item.account_holder_name}</td>

                      {/* Find the account_details */}
                      <td>{item.account_details}</td>

                      {/* Find the account_type */}
                      <td>{item.account_type}</td>

                      {/* Find the bank_name */}
                      <td>{item.bank_name}</td>

                      {/* Find the upi_id */}
                      <td>{item.upi_id}</td>

                      {/* Status */}
                      <td
                        className={`text-center ${
                          item.status === "online"
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {item.status === "online" ? "Active" : "Inactive"}
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

export default AllAccounts;
