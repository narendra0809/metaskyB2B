import { useEffect, useState } from "react";
import Modal from "../Modal";

const PrivateTransportModal = ({
  open,
  handleClose,
  title,
  data,
  onDataChange,
  onSubmit,
  loading,
  errors = {},
  destinations = [],
  cities = [],
  onTermsClick,
}) => {
  const [tempOption, setTempOption] = useState({
    from: "",
    to: "",
    rate: "",
    transfer_type: "one_way",
  });

  useEffect(() => {
    if (open) {
      setTempOption({ from: "", to: "", rate: "", transfer_type: "one_way" });
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onDataChange({ ...data, [name]: value });
  };

  const handleFileChange = (e) => {
    onDataChange({ ...data, company_document: e.target.files[0] });
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setTempOption((prev) => ({ ...prev, [name]: value }));
  };

  const addOption = () => {
    if (!tempOption.from || !tempOption.to || !tempOption.rate) {
      alert("Please fill all option fields (From, To, Rate)");
      return;
    }

    const currentOptions = data.options || [];
    onDataChange({
      ...data,
      options: [...currentOptions, tempOption],
    });

    setTempOption({ from: "", to: "", rate: "", transfer_type: "one_way" });
  };

  const removeOption = (indexToRemove) => {
    const updatedOptions = data.options.filter(
      (_, index) => index !== indexToRemove
    );
    onDataChange({ ...data, options: updatedOptions });
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <div className="container p-3">
        <div className="container border-bottom border-light-subtle">
          {/* Transporter Name */}
          <div className="mb-3">
            <label htmlFor="company_name" className="form-label">
              Transporter Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Transporter Name..."
              name="company_name"
              value={data.company_name || ""}
              onChange={handleChange}
            />
            {errors.company_name && (
              <div className="text-danger">{errors.company_name[0]}</div>
            )}
          </div>

          {/* Vehicle Document */}
          <div className="mb-3">
            <label htmlFor="company_document" className="form-label">
              Vehicle Documents
            </label>
            <input
              type="file"
              className="form-control"
              name="company_document"
              onChange={handleFileChange}
            />
            {errors.company_document && (
              <div className="text-danger">{errors.company_document[0]}</div>
            )}
          </div>

          {/* Address */}
          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Transport Address..."
              name="address"
              value={data.address || ""}
              onChange={handleChange}
            />
            {errors.address && (
              <div className="text-danger">{errors.address[0]}</div>
            )}
          </div>

          {/* Destination */}
          <div className="mb-3">
            <label htmlFor="destination_id" className="form-label">
              Destination
            </label>
            <select
              className="form-control"
              name="destination_id"
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
            {errors.destination_id && (
              <div className="text-danger">{errors.destination_id[0]}</div>
            )}
          </div>

          {/* Vehicle Name */}
          <div className="mb-3">
            <label htmlFor="transport" className="form-label">
              Vehicle Name
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Vehicle Name..."
              name="transport"
              value={data.transport || ""}
              onChange={handleChange}
            />
            {errors.transport && (
              <div className="text-danger">{errors.transport[0]}</div>
            )}
          </div>

          {/* Vehicle Capacity */}
          <div className="mb-3">
            <label htmlFor="vehicle_type" className="form-label">
              Vehicle Capacity
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Vehicle Capacity..."
              name="vehicle_type"
              value={data.vehicle_type || ""}
              onChange={handleChange}
            />
            {errors.vehicle_type && (
              <div className="text-danger">{errors.vehicle_type[0]}</div>
            )}
          </div>

          {/* Transfer Options Section */}
          <div className="mb-3">
            <label className="form-label">Transfer Options</label>

            {/* Input Row */}
            <div className="row g-2">
              <div className="col-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="From ..."
                  name="from"
                  value={tempOption.from}
                  onChange={handleOptionChange}
                />
              </div>
              <div className="col-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="To ..."
                  name="to"
                  value={tempOption.to}
                  onChange={handleOptionChange}
                />
              </div>
              <div className="col-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rate ..."
                  name="rate"
                  value={tempOption.rate}
                  onChange={handleOptionChange}
                />
              </div>
              <div className="col-12">
                <select
                  className="form-control"
                  name="transfer_type"
                  value={tempOption.transfer_type}
                  onChange={handleOptionChange}
                >
                  <option value="one_way">One Way</option>
                  <option value="two_way">Two Way</option>
                </select>
              </div>
            </div>

            {errors.options && (
              <div className="text-danger mt-1">{errors.options[0]}</div>
            )}

            {/* List of Added Options */}
            <div className="mt-2">
              {data.options?.map((item, index) => (
                <div
                  className="d-flex align-items-center gap-2 mt-2 border p-2 rounded"
                  key={index}
                >
                  <div className="flex-grow-1 fw-bold ">
                    {item.from} {item.transfer_type === "one_way" ? "→" : "↔"}{" "}
                    {item.to}
                  </div>
                  <div className="text-muted small me-2">{item.rate} AED</div>
                  <div className="badge  me-2">
                    {item.transfer_type.replace("_", " ")}
                  </div>
                  <button
                    className="btn btn-sm py-0 px-2"
                    type="button"
                    onClick={() => removeOption(index)}
                  >
                    <i className="fa-solid fa-trash-can text-danger"></i>
                  </button>
                </div>
              ))}
            </div>

            <button
              className="btn btn-success mt-3 w-100"
              type="button"
              onClick={addOption}
            >
              Add Option
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="container p-3 d-flex justify-content-between">
          <button
            className={`btn ${
              title.includes("Edit") ? "btn-warning" : "btn-primary"
            }`}
            type="submit"
            onClick={onSubmit}
            disabled={loading}
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
            disabled={loading}
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

export default PrivateTransportModal;
