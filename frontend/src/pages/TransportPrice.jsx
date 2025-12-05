import { useState } from "react";
import useApiData from "../hooks/useApiData";
import { useAuth } from "../context/AuthContext";
import Loader from "../Loader";

/* -- components -- */
const TransportPrice = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();

  /* -- variables -- */
  let output, outputData, filteredData;
  let totalPageNo = 0;

  /* -- fetch data -- */
  const { data, loading } = useApiData(
    `${base_url}/api/getTransportWithCity`,
    authToken
  );

  /* -- state variables -- */
  const [filterValue, setFilterValue] = useState({
    search: "",
    hotels: "",
  });
  let [perPage, setPerPage] = useState(10);
  let [currPageNo, setCurrPageNo] = useState(0);

  /* -- render data -- */
  if (!loading) {
    // filtering

    console.log("data", data);
    filteredData = data?.transport?.filter(
      (item) =>
        item.company_name
          .toLowerCase()
          .includes(filterValue.search.toLowerCase()) ||
        item.city.toLowerCase().includes(filterValue.search.toLowerCase())
    );

    totalPageNo = Math.ceil(filteredData?.length / perPage);

    // pagination
    outputData = filteredData?.slice(
      perPage * currPageNo,
      perPage * currPageNo + perPage
    );

    // render
    output = outputData?.map((item, index) => (
      <tr key={index}>
        <td className="align-middle">{item.company_name}</td>
        <td className="align-middle">{item.city}</td>
        <td>{item.vehicle_type}</td>
        <td style={{ textAlign: "left", verticalAlign: "top", padding: "8px" }}>
          {item.options.map((ele, i) => (
            <p key={i} style={{ margin: "4px 0" }}>
              {ele.from} {ele.transfer_type === "one_way" ? "→" : "↔"} {ele.to}{" "}
              AED {ele.rate} /- ({ele.transfer_type})
            </p>
          ))}
        </td>
      </tr>
    ));
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

  const handleSort = (key) => {
    // data = data?.sort((a, b) => a[key] - b[key])
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
          <h1 className="page-title">Private Transport </h1>
        </div>

        {/* Table */}
        <div className="mt-4">
          <div className="table-container">
            <div className="border-bottom">
              {/* <div className="row g-3 pb-3">
                <div className="col-12 col-md-4 col-lg-3">
                  <select
                    className="form-select"
                    name="hotels"
                    onChange={handleFilter}
                  >
                    <option value="">All Hotels</option>
                    <option value="this-hotel">This Hotel</option>
                    <option value="that-hotel">That Hotel</option>
                  </select>
                </div>
              </div> */}
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
                      <th>Transporter Name</th>
                      <th>City</th>
                      <th>Vehicle Capacity</th>
                      <th>Vehicle Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">{output}</tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  Showing {currPageNo * perPage + 1} to{" "}
                  {Math.min((currPageNo + 1) * perPage, filteredData?.length)}{" "}
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

export default TransportPrice;
