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

// const TermsConditionsModal = ({
//   open,
//   onClose,
//   onSubmit,
//   initialData = {},
// }) => {
//   const [form, setForm] = useState({ ...defaultState, ...initialData });

//   const handleArrChange = (arrName, idx, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [arrName]: prev[arrName].map((v, i) => (i === idx ? value : v)),
//     }));
//   };
//   const addArrItem = (arrName) =>
//     setForm((prev) => ({
//       ...prev,
//       [arrName]: [...prev[arrName], ""],
//     }));
//   const removeArrItem = (arrName, idx) =>
//     setForm((prev) => ({
//       ...prev,
//       [arrName]: prev[arrName].filter((_, i) => i !== idx),
//     }));

//   // Booking policy arrays
//   const handlePolicyChange = (policyType, idx, value) => {
//     setForm((prev) => ({
//       ...prev,
//       bookingPolicy: {
//         ...prev.bookingPolicy,
//         [policyType]: prev.bookingPolicy[policyType].map((v, i) =>
//           i === idx ? value : v
//         ),
//       },
//     }));
//   };
//   const addPolicyItem = (policyType) =>
//     setForm((prev) => ({
//       ...prev,
//       bookingPolicy: {
//         ...prev.bookingPolicy,
//         [policyType]: [...prev.bookingPolicy[policyType], ""],
//       },
//     }));
//   const removePolicyItem = (policyType, idx) =>
//     setForm((prev) => ({
//       ...prev,
//       bookingPolicy: {
//         ...prev.bookingPolicy,
//         [policyType]: prev.bookingPolicy[policyType].filter(
//           (_, i) => i !== idx
//         ),
//       },
//     }));

//   const handleSubmit = () => {
//     onSubmit(form);
//     onClose();
//   };

//   return (
//     <Modal open={open} handleClose={onClose} title="Terms & Conditions">
//       <form className="container p-3">
//         <div className="mb-3">
//           <label className="form-label">Mobile Voucher</label>
//           <input
//             type="text"
//             className="form-control"
//             value={form.mobileVoucher}
//             onChange={(e) =>
//               setForm({ ...form, mobileVoucher: e.target.value })
//             }
//           />
//         </div>

//         <div className="mb-3">
//           <label className="form-label">Instant Confirmation</label>
//           <input
//             type="text"
//             className="form-control"
//             value={form.instantConfirmation}
//             onChange={(e) =>
//               setForm({ ...form, instantConfirmation: e.target.value })
//             }
//           />
//         </div>

//         {/* Policy arrays */}
//         <div className="mb-3">
//           <label className="form-label">Cancellation Policy</label>
//           {form.bookingPolicy.cancellationPolicy.map((v, idx) => (
//             <div className="input-group mb-2" key={idx}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={v}
//                 onChange={(e) =>
//                   handlePolicyChange("cancellationPolicy", idx, e.target.value)
//                 }
//               />
//               <button
//                 type="button"
//                 className="btn btn-outline-danger"
//                 onClick={() => removePolicyItem("cancellationPolicy", idx)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="btn btn-outline-primary btn-sm"
//             onClick={() => addPolicyItem("cancellationPolicy")}
//           >
//             Add Cancellation Policy
//           </button>
//         </div>

//         <div className="mb-3">
//           <label className="form-label">Child Policy</label>
//           {form.bookingPolicy.childPolicy.map((v, idx) => (
//             <div className="input-group mb-2" key={idx}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={v}
//                 onChange={(e) =>
//                   handlePolicyChange("childPolicy", idx, e.target.value)
//                 }
//               />
//               <button
//                 type="button"
//                 className="btn btn-outline-danger"
//                 onClick={() => removePolicyItem("childPolicy", idx)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="btn btn-outline-primary btn-sm"
//             onClick={() => addPolicyItem("childPolicy")}
//           >
//             Add Child Policy
//           </button>
//         </div>

//         {/* Inclusions/Exclusions arrays */}
//         <div className="mb-3">
//           <label className="form-label">Inclusions</label>
//           {form.inclusions.map((v, idx) => (
//             <div className="input-group mb-2" key={idx}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={v}
//                 onChange={(e) =>
//                   handleArrChange("inclusions", idx, e.target.value)
//                 }
//               />
//               <button
//                 type="button"
//                 className="btn btn-outline-danger"
//                 onClick={() => removeArrItem("inclusions", idx)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="btn btn-outline-primary btn-sm"
//             onClick={() => addArrItem("inclusions")}
//           >
//             Add Inclusion
//           </button>
//         </div>

//         <div className="mb-3">
//           <label className="form-label">Exclusions</label>
//           {form.exclusions.map((v, idx) => (
//             <div className="input-group mb-2" key={idx}>
//               <input
//                 type="text"
//                 className="form-control"
//                 value={v}
//                 onChange={(e) =>
//                   handleArrChange("exclusions", idx, e.target.value)
//                 }
//               />
//               <button
//                 type="button"
//                 className="btn btn-outline-danger"
//                 onClick={() => removeArrItem("exclusions", idx)}
//               >
//                 Remove
//               </button>
//             </div>
//           ))}
//           <button
//             type="button"
//             className="btn btn-outline-primary btn-sm"
//             onClick={() => addArrItem("exclusions")}
//           >
//             Add Exclusion
//           </button>
//         </div>

//         <div className="text-end m-3">
//           <button
//             className="btn btn-primary"
//             type="button"
//             onClick={handleSubmit}
//           >
//             Save Terms & Conditions
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// export default TermsConditionsModal;

const TermsConditionsModal = ({
  open,
  onClose,
  onSubmit,
  initialData = {},
  readOnly = false,
}) => {
  const [form, setForm] = useState({ ...defaultState, ...initialData });
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
    <Modal
      open={open}
      handleClose={onClose}
      title={
        readOnly && !initialData
          ? "No terms and conditions found"
          : "Terms & Conditions"
      }
    >
      {readOnly && initialData && (
        <form className="container p-3">
          <div className="mb-3">
            <label className="form-label">Mobile Voucher</label>
            <input
              type="text"
              className="form-control"
              value={form.mobileVoucher}
              onChange={(e) =>
                !readOnly && setForm({ ...form, mobileVoucher: e.target.value })
              }
              disabled={true}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Instant Confirmation</label>
            <input
              type="text"
              className="form-control"
              value={form.instantConfirmation}
              onChange={(e) =>
                !readOnly &&
                setForm({ ...form, instantConfirmation: e.target.value })
              }
              disabled={readOnly}
            />
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
                    !readOnly &&
                    handlePolicyChange(
                      "cancellationPolicy",
                      idx,
                      e.target.value
                    )
                  }
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removePolicyItem("cancellationPolicy", idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addPolicyItem("cancellationPolicy")}
              >
                Add Cancellation Policy
              </button>
            )}
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
                    !readOnly &&
                    handlePolicyChange("childPolicy", idx, e.target.value)
                  }
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removePolicyItem("childPolicy", idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addPolicyItem("childPolicy")}
              >
                Add Child Policy
              </button>
            )}
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
                    !readOnly &&
                    handleArrChange("inclusions", idx, e.target.value)
                  }
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeArrItem("inclusions", idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addArrItem("inclusions")}
              >
                Add Inclusion
              </button>
            )}
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
                    !readOnly &&
                    handleArrChange("exclusions", idx, e.target.value)
                  }
                  disabled={readOnly}
                />
                {!readOnly && (
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeArrItem("exclusions", idx)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {!readOnly && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => addArrItem("exclusions")}
              >
                Add Exclusion
              </button>
            )}
          </div>

          {!readOnly && (
            <div className="text-end m-3">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleSubmit}
              >
                Save Terms & Conditions
              </button>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};

export default TermsConditionsModal;
