import { useState } from "react";
import useApiData from "../hooks/useApiData";
import Loader from "../Loader";
import "../Loader.css";
import { useAuth } from "../context/AuthContext";
import { convertTo12HoursFormate } from "../functions/utils";

const TicketPrice = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();

  let output, outputData, filteredData;
  let totalPageNo = 0;

  const { data, loading } = useApiData(`${base_url}/api/tickets`, authToken);
  const [filterValue, setFilterValue] = useState({
    search: "",
    hotels: "",
  });
  let [perPage, setPerPage] = useState(10);
  let [currPageNo, setCurrPageNo] = useState(0);

  if (!loading) {
    if (data && data.data) {
      // filtering
      filteredData = data.data.filter((item) =>
        item.name.toLowerCase().includes(filterValue.search.toLowerCase())
      );

      totalPageNo = Math.ceil(filteredData.length / perPage);

      // pagination
      outputData = filteredData.slice(
        perPage * currPageNo,
        perPage * currPageNo + perPage
      );

      // render
      console.log(outputData);
      output = outputData.map((item, index) => (
        <tr key={index}>
          <td className="align-middle">{item.name}</td>
          <td>
            {item.time_slots.map((time, i) => (
              <p key={i}>{convertTo12HoursFormate(time.start_time) || "N/A"}</p>
            ))}
          </td>
          <td>
            {item.time_slots.map((time, i) => (
              <p key={i}>
                <span>Adult Rate : {time.adult_price} AED</span> |{" "}
                <span>Child Rate : {time.child_price} AED</span>
              </p>
            ))}
          </td>
        </tr>
      ));
    } else {
      output = (
        <tr>
          <td colSpan={4} style={{ textAlign: "center" }}>
            No tickets found
          </td>
        </tr>
      );
    }
  } else {
    output = (
      <tr>
        <td colSpan={4} style={{ textAlign: "center" }}>
          {" "}
          <Loader />
        </td>
      </tr>
    );
  }

  /* -- functions -- */
  const handlePerPage = (e) => {
    setPerPage(e.target.value);
    setCurrPageNo(0);
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

  return (
    <>
      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Ticket Price</h1>
        </div>

        {/* Table */}
        <div className="mt-4">
          <div className="table-container">
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
                      <th>Name</th>
                      <th>Start Time</th>
                      <th>Rates</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">{output}</tbody>
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

export default TicketPrice;
