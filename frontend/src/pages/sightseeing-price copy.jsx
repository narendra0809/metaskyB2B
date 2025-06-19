import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import Loader from '../Loader';
import '../Loader.css';

/* -- components -- */
const SightseeingPrice = () => {
  /* -- variables -- */
  let output, outputData, filteredData
  let totalPageNo = 0

  /* -- contexts -- */
  const { data, loading } = useFetch('/data/dummydata.json')

  /* -- state variables -- */
  const [filterValue, setFilterValue] = useState({
    name: '',
  })
  let [perPage, setPerPage] = useState(10)
  let [currPageNo, setCurrPageNo] = useState(0)

  /* -- render data -- */
  if (!loading) {
    // filtering
    filteredData = data.filter((item) =>
      item.Name.toLowerCase().includes(filterValue.name.toLowerCase())
    )

    totalPageNo = Math.ceil(filteredData.length / perPage)

    // pagination
    outputData = filteredData.slice(
      perPage * currPageNo,
      perPage * currPageNo + perPage
    )

    // render
    output = outputData.map((item) => (
      <tr key={item.ID}>
        <td>{item.ID}</td>
        <td>{item.Name}</td>
        <td>{item.Age}</td>
        <td>{item.Email}</td>
        <td>{item.Country}</td>
      </tr>
    ))
  } else {
    output = (
      <tr>
        <td><Loader /> </td>
      </tr>
    )
  }

  /* -- functions -- */
  const handlePerPage = (e) => {
    setPerPage(e.target.value)
    setCurrPageNo(0)
  }

  const handleSort = (key) => {
    // data = data.sort((a, b) => a[key] - b[key])
  }

  const handleFilter = ({ currentTarget }) => {
    setFilterValue((item) => ({
      ...item,
      [currentTarget.name]: currentTarget.value,
    }))
    setCurrPageNo(0)
  }

  const handlePageInc = () => {
    if (currPageNo + 1 < totalPageNo) {
      setCurrPageNo((item) => item + 1)
    }
  }
  const handlePageDec = () => {
    if (currPageNo > 0) {
      setCurrPageNo((item) => item - 1)
    }
  }

  return (
    <>
      <section className="page-section">
        <div className="page-header">
          <h1 className="page-title">Sightseeing Price</h1>
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
                  name="name"
                  placeholder="search..."
                  className="form-control"
                  value={filterValue.name}
                  onChange={handleFilter}
                />
              </div>
            </div>
            <div style={{ display: 'grid' }}>
              <div className="table-responsive mt-4">
                <table className="table table-hover text-center">
                  <thead>
                    <tr>
                      <th
                        onClick={() => {
                          handleSort('ID')
                        }}
                      >
                        Id
                      </th>
                      <th
                        onClick={() => {
                          handleSort('Name')
                        }}
                      >
                        Name
                      </th>
                      <th
                        onClick={() => {
                          handleSort('Age')
                        }}
                      >
                        Age
                      </th>
                      <th
                        onClick={() => {
                          handleSort('Email')
                        }}
                      >
                        Email
                      </th>
                      <th
                        onClick={() => {
                          handleSort('Country')
                        }}
                      >
                        Country
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {output.length > 0 ? (
                      output
                    ) : (
                      <tr>
                        <td>No record found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small>
                  Showing {(currPageNo + 1) * perPage - (perPage - 1)} to{' '}
                  {(currPageNo + 1) * perPage < filteredData?.length
                    ? (currPageNo + 1) * perPage
                    : filteredData?.length}{' '}
                  of {filteredData?.length} entries
                </small>
                <ul className="pagination mt-4">
                  <li className="page-item">
                    <button
                      className={`page-link ${currPageNo <= 0 && 'disabled'}`}
                      onClick={handlePageDec}
                    >
                      Prev
                    </button>
                  </li>
                  <li className="page-item">
                    <button
                      className={`page-link ${
                        currPageNo + 1 >= totalPageNo && 'disabled'
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
  )
}

export default SightseeingPrice
