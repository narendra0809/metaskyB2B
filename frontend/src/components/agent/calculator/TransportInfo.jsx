const TransportInfo = ({
  formData,
  showPrompt,
  handleAdd,
  handleDelete,
  handleChange, // This is handleNestedDataChange
  handleShowTerms,
  destinationsData,
  transportData,
  countriesData,
}) => {
  return (
    <div className="px-2 py-2 px-md-4 mb-4">
      <div className="title-line">
        <span>Transport info</span>
      </div>

      {showPrompt && (
        <div
          className="mb-3 p-3 rounded"
          style={{ border: "1px solid #16acbf" }}
        >
          <p className="mb-2 fw-bold">
            Do you need transportation services for your trip?
          </p>
          <button
            className="btn btn-main"
            onClick={() => handleAdd("transport")}
          >
            <i className="fas fa-car me-2"></i> Add Transport
          </button>
        </div>
      )}

      {formData.transport_info.map((item, index) => (
        <div className="mb-3" key={index}>
          <div className="d-flex align-items-center justify-content-between column-gap-3">
            <h5 className="fs-6 fw-bold">Transport {index + 1}</h5>
            <div className="d-flex gap-3">
              <button
                className="btn btn-danger rounded-circle"
                onClick={() => handleDelete("transport_info", index)}
              >
                <i className="fa-regular fa-trash-can"></i>
              </button>
              {item.option_index !== null && item.option_index !== "" && (
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
            {/* City Selection */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">City</label>
              <select
                className="form-control mt-1"
                name="destination_id"
                value={item.destination_id}
                onChange={(e) => handleChange(e, "transport_info", index)}
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

            {/* Transport Selection */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Transport</label>
              <select
                className="form-control mt-1"
                name="transport_id"
                value={item.transport_id}
                onChange={(e) => handleChange(e, "transport_info", index)}
                disabled={!item.destination_id}
              >
                <option value="">-- select --</option>
                {transportData.data?.data
                  ?.filter((t) => t.destination_id == item.destination_id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.transport || "N/A"}
                    </option>
                  ))}
              </select>
            </div>

            {/* Capacity (Read Only) */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold d-block mb-1">Vehicle Capacity</label>
              <select className="form-control mt-1" disabled>
                <option value="">{item.v_type}</option>
              </select>
            </div>

            {/* Options */}
            <div className="col mb-3 mb-md-4">
              <label className="fw-bold">Transfer Options</label>
              <select
                className="form-control mt-1"
                name="option_index"
                value={
                  item.option_index !== null ? String(item.option_index) : ""
                }
                onChange={(e) => handleChange(e, "transport_info", index)}
                disabled={!item.transport_id}
              >
                <option value="">-- select --</option>
                {transportData.data?.data
                  ?.find((t) => t.id == item.transport_id)
                  ?.options.map((option, i) => (
                    <option key={i} value={String(i)}>
                      {option.from} → {option.to} AED {option.rate} /- (
                      {option.transfer_type})
                    </option>
                  ))}
              </select>
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
                onChange={(e) => handleChange(e, "transport_info", index)}
                disabled={!formData.travel_date_from}
              />
            </div>
          </div>
        </div>
      ))}

      {formData.transport_info.length > 0 && (
        <button className="btn btn-info" onClick={() => handleAdd("transport")}>
          Add Another Transport
        </button>
      )}
    </div>
  );
};

export default TransportInfo;
