import { convertTo12HoursFormate } from "../../../functions/utils";

const TicketInfo = ({
  formData,
  showPrompt,
  setShowPrompt,
  handleAdd,
  handleDelete,
  handleChange,
  handleShowTerms,
  tickets,
}) => {
  const handleInitialAdd = () => {
    setShowPrompt(false);
    if (!formData.ticket_info || formData.ticket_info.length === 0) {
      handleAdd("ticket");
    }
  };

  console.log(formData.ticket_info);
  return (
    <div className="px-2 py-2 px-md-4 mb-4">
      <div className="title-line">
        <span>Tickets</span>
      </div>

      {showPrompt ? (
        <div
          className="mb-3 p-3 rounded"
          style={{ border: "1px solid #16acbf" }}
        >
          <p className="mb-2 fw-bold">
            Would you like to add any tickets to your package?
          </p>
          <button className="btn btn-main" onClick={handleInitialAdd}>
            <i className="fas fa-ticket me-2"></i> Add Ticket
          </button>
        </div>
      ) : (
        <>
          {formData.ticket_info?.map((item, index) => (
            <div className="mb-3" key={index}>
              <div className="d-flex align-items-center justify-content-between column-gap-3">
                <h5 className="fs-6 fw-bold">Ticket {index + 1}</h5>
                <div className="d-flex gap-3">
                  <button
                    className="btn btn-danger rounded-circle"
                    onClick={() => handleDelete("ticket_info", index)}
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                  {item.start_time && (
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
                {/* Ticket Selection */}
                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">Ticket</label>
                  <select
                    className="form-control mt-1"
                    name="id"
                    value={item.id}
                    onChange={(e) => handleChange(e, "ticket_info", index)}
                  >
                    <option value="">-- Select Ticket --</option>
                    {tickets.data?.data?.map((ticket) => (
                      <option key={ticket.id} value={ticket.id}>
                        {ticket.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                {/* {item.id && (
                  <div className="col mb-3 mb-md-4">
                    <label className="fw-bold">Category</label>
                    <select
                      className="form-control mt-1"
                      name="category"
                      value={item.category}
                      onChange={(e) => handleChange(e, "ticket_info", index)}
                    >
                      <option value="">-- Select Category --</option>
                      {tickets.data?.data
                        ?.find((t) => t.id == item.id)
                        ?.category?.map((cat, catIndex) => (
                          <option key={catIndex} value={cat}>
                            {cat}
                          </option>
                        ))}
                    </select>
                  </div>
                )} */}

                {/* Time Slot */}
                {item.has_time_slots === 1 && (
                  <div className="col mb-3 mb-md-4">
                    <label className="fw-bold">Start Time</label>
                    <select
                      className="form-control mt-1"
                      name="start_time"
                      value={item.start_time}
                      onChange={(e) => handleChange(e, "ticket_info", index)}
                    >
                      <option value="">-- Select Time Slot --</option>
                      {tickets.data?.data
                        ?.find((t) => t.id == item.id)
                        ?.time_slots?.map((slot, i) => (
                          <option key={i} value={slot.start_time}>
                            {convertTo12HoursFormate(slot.start_time)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">No. of Adults</label>
                  <input
                    type="number"
                    className="form-control mt-1"
                    name="adults"
                    value={item.adults}
                    onChange={(e) => handleChange(e, "ticket_info", index)}
                    min="0"
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">No. of Children</label>
                  <input
                    type="number"
                    className="form-control mt-1"
                    name="children"
                    value={item.children}
                    onChange={(e) => handleChange(e, "ticket_info", index)}
                    min="0"
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">Date</label>
                  <input
                    type="date"
                    className="form-control mt-1"
                    name="date"
                    value={item.date}
                    onChange={(e) => handleChange(e, "ticket_info", index)}
                    min={formData.travel_date_from}
                    max={formData.travel_date_to}
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">Adult Rate</label>
                  <input
                    type="number"
                    className="form-control mt-1"
                    value={item.adult_price}
                    disabled
                  />
                </div>
                <div className="col mb-3 mb-md-4">
                  <label className="fw-bold">Child Rate</label>
                  <input
                    type="number"
                    className="form-control mt-1"
                    value={item.child_price}
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.ticket_info?.length > 0 && (
            <button
              className="btn btn-info"
              onClick={() => handleAdd("ticket")}
            >
              Add Another Ticket
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TicketInfo;
