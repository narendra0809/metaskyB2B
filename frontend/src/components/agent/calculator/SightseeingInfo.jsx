const SightseeingInfo = ({
  formData,
  showPrompt,
  handleAdd,
  handleDelete,
  handleChange, // handleNestedDataChange
  handleShowTerms,
  destinationsData,
  sightseeingData,
  countriesData,
  adults,
  childs,
}) => {
  return (
    <div className="px-2 py-2 px-md-4 mb-4">
      <div className="title-line">
        <span>Sharing Transport info</span>
      </div>

      {showPrompt && (
        <div
          className="mb-3 p-3 rounded"
          style={{ border: "1px solid #16acbf" }}
        >
          <p className="mb-2 fw-bold">
            Would you like to add any sharing transport info?
          </p>
          <button
            className="btn btn-main"
            onClick={() => handleAdd("sightseeing")}
          >
            <i className="fas fa-binoculars me-2"></i> Add Sharing Transport
          </button>
        </div>
      )}

      {formData.sightseeing_info.map((item, index) => (
        <div className="mb-3" key={index}>
          <div className="d-flex align-items-center justify-content-between column-gap-3">
            <h5 className="fs-6 fw-bold">Sharing Transport {index + 1}</h5>
            <div className="d-flex gap-3">
              <button
                className="btn btn-danger rounded-circle"
                onClick={() => handleDelete("sightseeing_info", index)}
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>
              {item.sightseeing_id && (
                <button
                  className="btn btn-info rounded-circle"
                  title="View Terms & Conditions"
                  onClick={() =>
                    handleShowTerms(item.terms_and_conditions || {})
                  }
                >
                  <i className="fa-solid fa-info"></i>
                </button>
              )}
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4">
            {/* City */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">City</label>
              <select
                className="form-control mt-1"
                name="destination_id"
                value={item.destination_id}
                onChange={(e) => handleChange(e, "sightseeing_info", index)}
                disabled={!formData.travel_date_from}
              >
                <option value="">-- select --</option>
                {!destinationsData.loading &&
                  destinationsData.data?.destinations?.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {countriesData.data?.cities.find(
                        (city) => city.id == dest.city_id
                      )?.name || "N/A"}
                    </option>
                  ))}
              </select>
            </div>

            {/* Activity */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Sharing Transport Name</label>
              <select
                className="form-control mt-1"
                name="sightseeing_id"
                value={item.sightseeing_id}
                onChange={(e) => handleChange(e, "sightseeing_info", index)}
                disabled={!item.destination_id}
              >
                <option value="">-- select --</option>
                {sightseeingData.data?.data
                  ?.filter((s) => s.destination_id == item.destination_id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.company_name || "N/A"}
                    </option>
                  ))}
              </select>
            </div>

            {/* Pax Counts */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">No Of Adult</label>
              <input
                type="number"
                className="form-control mt-1"
                name="adults"
                value={item.adults || adults}
                onChange={(e) => handleChange(e, "sightseeing_info", index)}
                disabled={!item.sightseeing_id}
              />
            </div>
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">No Of Children</label>
              <input
                type="number"
                className="form-control mt-1"
                name="children"
                value={item.children || childs}
                onChange={(e) => handleChange(e, "sightseeing_info", index)}
                disabled={!item.sightseeing_id}
              />
            </div>

            {/* Rates (Read Only) */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Adult Rate</label>
              <input
                type="number"
                className="form-control mt-1"
                value={item.rate_adult}
                disabled
              />
            </div>
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Child Rate</label>
              <input
                type="number"
                className="form-control mt-1"
                value={item.rate_child}
                disabled
              />
            </div>

            {/* Date */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Date</label>
              <input
                type="date"
                className="form-control mt-1"
                min={formData.travel_date_from}
                max={formData.travel_date_to}
                name="date"
                value={item.date}
                onChange={(e) => handleChange(e, "sightseeing_info", index)}
                disabled={!formData.travel_date_from}
              />
            </div>
          </div>
        </div>
      ))}

      {formData.sightseeing_info.length > 0 && (
        <button
          className="btn btn-info"
          onClick={() => handleAdd("sightseeing")}
        >
          Add Another Sharing Transport
        </button>
      )}
    </div>
  );
};

export default SightseeingInfo;
