import Modal from "../Modal";

const DestinationModal = ({
  open,
  handleClose,
  title,
  data,
  onDataChange,
  onSubmit,
  loading,
  response,
  countries = [],
  states = [],
  cities = [],
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  const filteredStates = states.filter((item) => item.country_id == 229);

  const filteredCities = cities.filter(
    (item) => item.state_id == data.state_id
  );

  const selectedCountry = countries.find((c) => c.id == 229);
  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <div className="container p-3">
        {/* Country (Read-Only/Fixed) */}
        <div className="mb-3">
          <label htmlFor="country_id" className="form-label">
            Country
          </label>
          <select
            className="form-control"
            name="country_id"
            disabled
            value={data.country_id || 229}
            onChange={handleChange}
          >
            <option value={selectedCountry?.id || 229}>
              {selectedCountry?.name || "United Arab Emirates"}
            </option>
          </select>
        </div>

        {/* State Selection */}
        <div className="mb-3">
          <label htmlFor="state_id" className="form-label">
            State
          </label>
          <select
            className="form-control"
            name="state_id"
            value={data.state_id || ""}
            onChange={handleChange}
          >
            <option value="">-- select state --</option>
            {filteredStates.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Selection */}
        <div className="mb-3">
          <label htmlFor="city_id" className="form-label">
            City
          </label>
          <select
            className="form-control"
            name="city_id"
            id="city_id"
            value={data.city_id || ""}
            onChange={handleChange}
            disabled={!data.state_id} // Disable if no state selected
          >
            <option value="">-- select city --</option>
            {filteredCities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selection */}
        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            className="form-control"
            name="status"
            id="status"
            value={data.status} // Ensure parent passes 0 or 1, or "0"/"1"
            onChange={handleChange}
          >
            <option value="">-- select status --</option>
            <option value={0}>Offline</option>
            <option value={1}>Online</option>
          </select>
        </div>

        {/* Server Response Messages */}
        {response &&
          (response.success ? (
            <div className="alert alert-success m-0">{response.message}</div>
          ) : (
            <div className="alert alert-danger m-0">
              {typeof response.errors === "object"
                ? Object.values(response.errors)[0]
                : response.errors || response.error}
            </div>
          ))}
      </div>

      {/* Footer */}
      <div className="container p-3">
        <button
          className={`btn ${
            title.includes("Edit") ? "btn-warning" : "btn-primary"
          }`}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : title.includes("Edit")
            ? "Update"
            : "Add"}
        </button>
      </div>
    </Modal>
  );
};

export default DestinationModal;
