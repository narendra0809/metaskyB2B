import Modal from "../Modal";

const SightseeingModal = ({
  open,
  handleClose,
  title,
  data,
  onDataChange,
  onSubmit,
  loading,
  response,
  destinations = [],
  cities = [],
  onTermsClick,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <div className="container p-3">
        <div className="container border-bottom border-light-subtle">
          {/* --- Name --- */}
          <div className="mb-3">
            <label htmlFor="company_name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="company_name"
              placeholder="Name..."
              name="company_name"
              value={data.company_name || ""}
              onChange={handleChange}
            />
          </div>

          {/* --- Address --- */}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              placeholder="Transport Address..."
              name="address"
              value={data.address || ""}
              onChange={handleChange}
            />
          </div>

          {/* --- Destination Select --- */}
          <div className="mb-3">
            <label htmlFor="destination_id" className="form-label">
              Destination
            </label>
            <select
              className="form-control"
              name="destination_id"
              id="destination_id"
              value={data.destination_id || ""}
              onChange={handleChange}
            >
              <option value="">-- select --</option>
              {destinations.map((item) => (
                <option key={item.id} value={item.id}>
                  {cities.find((city) => city.id === item.city_id)?.name ||
                    "N/A"}
                </option>
              ))}
            </select>
          </div>

          {/* --- Description --- */}
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <input
              type="text"
              className="form-control"
              id="description"
              placeholder="Description..."
              name="description"
              value={data.description || ""}
              onChange={handleChange}
            />
          </div>

          {/* --- Rates --- */}
          <div className="mb-3">
            <label htmlFor="rate_adult" className="form-label">
              Rate Adult
            </label>
            <input
              type="text"
              className="form-control"
              id="rate_adult"
              placeholder="Rate Adult..."
              name="rate_adult"
              value={data.rate_adult || ""}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="rate_child" className="form-label">
              Rate Child
            </label>
            <input
              type="text"
              className="form-control"
              id="rate_child"
              placeholder="Rate Child..."
              name="rate_child"
              value={data.rate_child || ""}
              onChange={handleChange}
            />
          </div>

          {/* --- Server Response Messages --- */}
          {response &&
            (response.success ? (
              <div className="alert alert-success">{response.message}</div>
            ) : (
              <div className="alert alert-danger">
                {typeof response.errors === "object"
                  ? Object.values(response.errors)[0]
                  : response.errors}
              </div>
            ))}
        </div>

        {/* --- Footer Buttons --- */}
        <div className="container p-3 d-flex justify-content-between">
          <button
            className={`btn ${
              title.includes("Edit") ? "btn-warning" : "btn-primary"
            }`}
            type="submit"
            onClick={onSubmit}
          >
            {loading
              ? "Processing..."
              : title.includes("Edit")
              ? "Update"
              : "Add"}
          </button>

          <button
            className="btn btn-primary"
            type="button"
            onClick={onTermsClick}
          >
            {data.terms_and_conditions
              ? "Edit terms & conditions"
              : "Add terms & conditions"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SightseeingModal;
