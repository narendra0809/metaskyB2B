import { useEffect, useState } from "react";
import Modal from "../Modal";
import { convertTo12HoursFormate } from "../../functions/utils";

const TicketModal = ({
  open,
  handleClose,
  title,
  data,
  onDataChange,
  onSubmit,
  loading,
  response,
  onTermsClick,
}) => {
  const [tempSlot, setTempSlot] = useState({
    start_time: "",
    adult_price: "",
    child_price: "",
  });

  useEffect(() => {
    if (!open) {
      setTempSlot({ start_time: "", adult_price: "", child_price: "" });
    }
  }, [open]);

  const handleTempChange = (e) => {
    const { name, value } = e.target;
    setTempSlot((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = () => {
    if (!tempSlot.adult_price || !tempSlot.child_price) {
      alert("Please enter prices");
      return;
    }
    if (data.has_time_slots === 1 && !tempSlot.start_time) {
      alert("Please select a start time");
      return;
    }

    const newItem = { ...tempSlot };
    const currentSlots = data.time_slots || [];

    onDataChange({
      ...data,
      time_slots: [...currentSlots, newItem],
    });

    setTempSlot({ start_time: "", adult_price: "", child_price: "" });
  };

  const handleRemoveSlot = (indexToRemove) => {
    const updatedSlots = data.time_slots.filter(
      (_, index) => index !== indexToRemove
    );
    onDataChange({
      ...data,
      time_slots: updatedSlots,
    });
  };

  return (
    <Modal open={open} handleClose={handleClose} title={title}>
      <div className="container p-3">
        <div className="container border-bottom border-light-subtle">
          <div className="mb-3">
            <label className="form-label">Ticket Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ticket name..."
              value={data.name || ""}
              onChange={(e) => onDataChange({ ...data, name: e.target.value })}
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`has_time_slots_${title}`}
              checked={data.has_time_slots === 1}
              onChange={(e) =>
                onDataChange({
                  ...data,
                  has_time_slots: e.target.checked ? 1 : 0,
                })
              }
            />
            <label
              className="form-check-label"
              htmlFor={`has_time_slots_${title}`}
            >
              Enable time slots
            </label>
          </div>

          <div className="mb-3">
            <label className="form-label">
              {data.has_time_slots === 1 ? "Time Slot" : "Rates"}
            </label>

            <div className="row g-2">
              {data.has_time_slots === 1 && (
                <div className="col-4">
                  <input
                    type="time"
                    className="form-control"
                    name="start_time"
                    value={tempSlot.start_time}
                    onChange={handleTempChange}
                  />
                </div>
              )}

              <div className={data.has_time_slots === 1 ? "col-4" : "col-6"}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Adult Rate(AED)"
                  name="adult_price"
                  value={tempSlot.adult_price}
                  onChange={handleTempChange}
                />
              </div>

              <div className={data.has_time_slots === 1 ? "col-4" : "col-6"}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Child Rate(AED)"
                  name="child_price"
                  value={tempSlot.child_price}
                  onChange={handleTempChange}
                />
              </div>
            </div>

            <div>
              {data.time_slots?.map((item, index) => (
                <div className="row m-0 mt-2 align-items-center" key={index}>
                  {data.has_time_slots === 1 && (
                    <div className="col-4">
                      {convertTo12HoursFormate(item.start_time) || "--:--"}
                    </div>
                  )}
                  <div
                    className={data.has_time_slots === 1 ? "col-3" : "col-5"}
                  >
                    Adult: AED {item.adult_price}
                  </div>
                  <div
                    className={data.has_time_slots === 1 ? "col-3" : "col-5"}
                  >
                    Child: AED {item.child_price}
                  </div>
                  <div className="col-2 text-end">
                    <button
                      className="btn btn-sm"
                      onClick={() => handleRemoveSlot(index)}
                    >
                      <i className="fa-solid fa-trash-can text-danger"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-success mt-3 w-100"
              onClick={handleAddSlot}
            >
              {data.has_time_slots === 1 ? "Add Time Slot" : "Add Rate"}
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={data.status || "Active"}
              onChange={(e) =>
                onDataChange({ ...data, status: e.target.value })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

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

export default TicketModal;
