import { useState } from "react";
import Modal from "./Modal";

const defaultState = {
  mobileVoucher: "",
  instantConfirmation: "",
  tourTransfers: [],
  bookingPolicy: {
    cancellationPolicy: [""],
    childPolicy: [""],
  },
  inclusions: [""],
  exclusions: [""],
};

const transferOptions = [
  { type: "private", label: "Private Transfer" },
  { type: "share", label: "Shared Transfer" },
  { type: "none", label: "Without Transfer" },
];

const TermsConditionsModal = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
}) => {
  const [form, setForm] = useState({ ...defaultState, ...initialData });

  const handleTransferChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      tourTransfers: prev.tourTransfers.map((obj, i) =>
        i === idx ? { ...obj, [field]: value } : obj
      ),
    }));
  };
  const addTransfer = () =>
    setForm((prev) => ({
      ...prev,
      tourTransfers: [
        ...prev.tourTransfers,
        { type: "", timeSlots: "", cost: "", duration: "" },
      ],
    }));
  const removeTransfer = (idx) =>
    setForm((prev) => ({
      ...prev,
      tourTransfers: prev.tourTransfers.filter((_, i) => i !== idx),
    }));

  // Other repeated input handlers (arrays)
  const handleArrChange = (arrName, idx, value) => {
    setForm((prev) => ({
      ...prev,
      [arrName]: prev[arrName].map((v, i) => (i === idx ? value : v)),
    }));
  };
  const addArrItem = (arrName) =>
    setForm((prev) => ({
      ...prev,
      [arrName]: [...prev[arrName], ""],
    }));
  const removeArrItem = (arrName, idx) =>
    setForm((prev) => ({
      ...prev,
      [arrName]: prev[arrName].filter((_, i) => i !== idx),
    }));

  // Booking policy arrays
  const handlePolicyChange = (policyType, idx, value) => {
    setForm((prev) => ({
      ...prev,
      bookingPolicy: {
        ...prev.bookingPolicy,
        [policyType]: prev.bookingPolicy[policyType].map((v, i) =>
          i === idx ? value : v
        ),
      },
    }));
  };
  const addPolicyItem = (policyType) =>
    setForm((prev) => ({
      ...prev,
      bookingPolicy: {
        ...prev.bookingPolicy,
        [policyType]: [...prev.bookingPolicy[policyType], ""],
      },
    }));
  const removePolicyItem = (policyType, idx) =>
    setForm((prev) => ({
      ...prev,
      bookingPolicy: {
        ...prev.bookingPolicy,
        [policyType]: prev.bookingPolicy[policyType].filter(
          (_, i) => i !== idx
        ),
      },
    }));

  const handleSubmit = () => {
    onSubmit(form);
    onClose();
  };

  return (
    <Modal open={open} handleClose={onClose} title="Terms & Conditions">
      <form className="container p-3">
        <div className="mb-3">
          <label className="form-label">Mobile Voucher</label>
          <input
            type="text"
            className="form-control"
            value={form.mobileVoucher}
            onChange={(e) =>
              setForm({ ...form, mobileVoucher: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Instant Confirmation</label>
          <input
            type="text"
            className="form-control"
            value={form.instantConfirmation}
            onChange={(e) =>
              setForm({ ...form, instantConfirmation: e.target.value })
            }
          />
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label mb-0">Tour Transfers</label>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={addTransfer}
            >
              Add Transfer
            </button>
          </div>
          {form.tourTransfers.map((t, idx) => (
            <div className="row mt-2" key={idx}>
              <div className="col-md-3">
                <select
                  className="form-control"
                  value={t.type}
                  onChange={(e) =>
                    handleTransferChange(idx, "type", e.target.value)
                  }
                >
                  <option value="">Select Type</option>
                  {transferOptions.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Time Slots"
                  value={t.timeSlots}
                  onChange={(e) =>
                    handleTransferChange(idx, "timeSlots", e.target.value)
                  }
                />
              </div>
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Duration"
                  value={t.duration}
                  onChange={(e) =>
                    handleTransferChange(idx, "duration", e.target.value)
                  }
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Cost"
                  value={t.cost}
                  onChange={(e) =>
                    handleTransferChange(idx, "cost", e.target.value)
                  }
                />
              </div>
              <div className="col-md-2 d-flex align-items-center">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => removeTransfer(idx)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Policy arrays */}
        <div className="mb-3">
          <label className="form-label">Cancellation Policy</label>
          {form.bookingPolicy.cancellationPolicy.map((v, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                value={v}
                onChange={(e) =>
                  handlePolicyChange("cancellationPolicy", idx, e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removePolicyItem("cancellationPolicy", idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => addPolicyItem("cancellationPolicy")}
          >
            Add Cancellation Policy
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">Child Policy</label>
          {form.bookingPolicy.childPolicy.map((v, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                value={v}
                onChange={(e) =>
                  handlePolicyChange("childPolicy", idx, e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removePolicyItem("childPolicy", idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => addPolicyItem("childPolicy")}
          >
            Add Child Policy
          </button>
        </div>

        {/* Inclusions/Exclusions arrays */}
        <div className="mb-3">
          <label className="form-label">Inclusions</label>
          {form.inclusions.map((v, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                value={v}
                onChange={(e) =>
                  handleArrChange("inclusions", idx, e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeArrItem("inclusions", idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => addArrItem("inclusions")}
          >
            Add Inclusion
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label">Exclusions</label>
          {form.exclusions.map((v, idx) => (
            <div className="input-group mb-2" key={idx}>
              <input
                type="text"
                className="form-control"
                value={v}
                onChange={(e) =>
                  handleArrChange("exclusions", idx, e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeArrItem("exclusions", idx)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => addArrItem("exclusions")}
          >
            Add Exclusion
          </button>
        </div>

        <div className="text-end m-3">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleSubmit}
          >
            Save Terms & Conditions
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TermsConditionsModal;
