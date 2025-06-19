import { useState } from 'react'

import useFetch from '../../hooks/useFetch'

import './common.css'

const AdminTable = ({ title, th, tk }) => {
  /* -- Table Logic -- */
  let output, outputData, filteredData
  let totalPageNo = 0

  /* -- data Hook -- */
  const { data, loading } = useFetch('/data/dummydata.json')

  /* -- state variables -- */
  const [searchValue, setSearchValue] = useState('')
  let [perPage, setPerPage] = useState(10)
  let [currPageNo, setCurrPageNo] = useState(0)

  /* -- render data -- */
  if (!loading) {
    // filtering
    filteredData = data.filter((item) =>
      item.Name.toLowerCase().includes(searchValue.toLowerCase())
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
        <td>{item.Name}</td>
        <td>{item.Country}</td>
        <td style={{ width: '1%' }}>
          <a href={`/destination/${item.ID}`} className="btn">
            <i class="fa-solid fa-pencil"></i>
          </a>
        </td>
      </tr>
    ))
  } else {
    output = (
      <tr>
        <td>
        <div className="loader"></div>
        </td>
      </tr>
    )
  }

  /* -- functions -- */

  const handleSearch = (e) => {
    setSearchValue(e.target.value)
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
      <section className="display-section">
        <div className="display-header">
          <h2 className="display-title">Destination</h2>
          <input
            type="text"
            className="form-control display-search"
            placeholder="search by name..."
            onChange={handleSearch}
          />
          <button className="btn btn-sm btn-primary">Add Destination</button>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                {th.map((item) => (
                  <th>{item}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
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
      </section>
    </>
  )
}

export default AdminTable
