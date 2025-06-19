import { useEffect, useRef, useState } from "react";
import LoaderIcon from "../Loader"; // Adjust the path as necessary
import useSendFile from "../hooks/useSendFile";
import useApiData from "../hooks/useApiData";
import { useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

const AddWallet = () => {
  const base_url = import.meta.env.VITE_API_URL;
  const { authUser, authToken } = useAuth();
  const navigator = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  /* -- API URLs -- */
  const addForm = useSendFile(`${base_url}/api/add-payment`, authToken);
  const userData = useApiData(
    `${base_url}/api/showuser/${authUser.id}`,
    authToken
  );

  /* -- State Variables -- */
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);
  const [popUp, setPopUp] = useState(false);

  /* -- Form Data -- */
  const [formData, setFormData] = useState({
    mode: "manual",
    amount: "",
    payment_date: "",
    description: "",
    screenshot: null,
  });
  const attachmentFile = useRef(null);

  const handleOnchange = (e) => {
    const { name, value, type } = e.target;
    let filteredValue = value;

    switch (name) {
      case "amount":
        filteredValue = value
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1");
        break;

      default:
        filteredValue = value;
        break;
    }

    setFormData((prev) => {
      return {
        ...prev,
        [name]: type == "file" ? e.target.files[0] : filteredValue,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.amount ||
      !formData.description ||
      !formData.payment_date ||
      !formData.screenshot
    ) {
      setSuccess(false);
      setErr("All fields are required");
      setPopUp(true);
      return;
    }

    const submitFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });
    addForm.sendData(submitFormData);
  };
  useEffect(() => {
    if (!addForm.loading && addForm.response) {
      setSuccess(addForm.response?.success);

      if (addForm.response?.success) {
        setErr(addForm.response?.message);
        if (attachmentFile.current) {
          attachmentFile.current.value = "";
        }
        setFormData({
          mode: "manual",
          amount: "",
          payment_date: "",
          description: "",
          screenshot: null,
        });
      } else {
        setErr(
          typeof addForm.response.error === "object"
            ? Object.values(addForm.response.error)[0]
            : addForm.response.error
        );
      }

      setPopUp(true);
    }
  }, [addForm.loading]);
  return (
    <>
      <Alert
        open={popUp}
        handleClose={() => {
          setPopUp(false);
        }}
        success={success}
      >
        <p>{err}</p>
      </Alert>
      <div className="title">Add Wallet Balance</div>
      <section className="page-section">
        <div className="px-2 py-2 px-md-4 mb-4">
          <div>
            <p className="mb-2">
              <span className="fw-bold">Company Name:</span>{" "}
              {userData.loading ? "Loading..." : userData.data?.company_name}
            </p>
            <p className="mb-2">
              <span className="fw-bold">Email:</span>{" "}
              {userData.loading ? "Loading..." : userData.data?.email}
            </p>
            <p className="mb-2">
              <span className="fw-bold">Address:</span>{" "}
              {userData.loading ? "Loading..." : userData.data?.address}
            </p>
            <p className="mb-2">
              <span className="fw-bold">Contact Person Name:</span>{" "}
              {userData.loading ? "Loading..." : userData.data?.username}
            </p>
            <p className="mb-2">
              <span className="fw-bold">Mobile Number:</span>{" "}
              {userData.loading ? "Loading..." : userData.data?.phoneno}
            </p>
          </div>

          <div className="mt-5 p-3 shadow rounded">
            <div className="row">
              <div className="col-12 col-lg-7">
                <form onSubmit={handleSubmit}>
                  {/* mode */}
                  <div className="mb-3 row">
                    <div className="col-12 col-sm-3">
                      <label htmlFor="mode" className="form-label">
                        Mode
                      </label>
                    </div>
                    <div className="col-12 col-sm-9">
                      <select
                        className="form-control"
                        name="mode"
                        id="mode"
                        value={formData.mode}
                        onChange={handleOnchange}
                      >
                        <option value="manual">Manual</option>
                        {/* <option value="online">Online</option> */}
                      </select>
                    </div>
                  </div>
                  {/* amount */}
                  <div className="mb-3 row">
                    <div className="col-12 col-sm-3">
                      <label htmlFor="amount" className="form-label">
                        Amount
                      </label>
                    </div>
                    <div className="col-12 col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        name="amount"
                        id="amount"
                        value={formData.amount}
                        onChange={handleOnchange}
                      />
                    </div>
                  </div>
                  {/* date */}
                  <div className="mb-3 row">
                    <div className="col-12 col-sm-3">
                      <label htmlFor="payment_date" className="form-label">
                        Date
                      </label>
                    </div>
                    <div className="col-12 col-sm-9">
                      <input
                        type="date"
                        id="payment_date"
                        name="payment_date"
                        value={formData.payment_date}
                        onChange={handleOnchange}
                        className="form-control mt-1"
                        max={today}
                      />
                    </div>
                  </div>
                  {/* Description */}
                  <div className="mb-3 row">
                    <div className="col-12 col-sm-3">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                    </div>
                    <div className="col-12 col-sm-9">
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleOnchange}
                        className="form-control"
                      />
                    </div>
                  </div>
                  {/* Attachment */}
                  <div className="mb-3 row">
                    <div className="col-12 col-sm-3">
                      <label htmlFor="screenshot" className="form-label">
                        Attachment
                      </label>
                    </div>
                    <div className="col-12 col-sm-9">
                      <input
                        type="file"
                        name="screenshot"
                        id="screenshot"
                        ref={attachmentFile}
                        onChange={handleOnchange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-3 flex-wrap">
                    <button type="submit" className="btn btn-primary">
                      {addForm.loading ? <LoaderIcon /> : "Add Payment"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator(-1);
                      }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>

              <div className="col-12 col-lg-5 mt-5 mt-lg-0">
                <div>
                  <div className="row">
                    <div className="col-md-6 col-sm-12 col-lg-12">
                      <h4 className="mb-4">INDIAN ACCOUNT</h4>
                      <div style={{ fontSize: "14px" }}>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>UPI Id</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b>K1travels@hdfcbank</b>
                          </div>
                        </div>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>Bank name</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b>HDFC BANK</b>
                          </div>
                        </div>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>Account holder name</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b> K1 TRAVELS PRIVATE LIMITED</b>
                          </div>
                        </div>

                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>Account number</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b> 50200095153502</b>
                          </div>
                        </div>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>IFSC Code</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b> HDFC0000210</b>
                          </div>
                        </div>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>Account Type</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b>CURRENT</b>
                          </div>
                        </div>
                        <div className="mb-3 d-flex">
                          <div className="col-lg-5 col-md-12">
                            <label htmlFor="name" className="form-label">
                              <b>Branch</b>
                            </label>
                          </div>
                          <div className="col-lg-7 col-md-12">
                            <b> Model Town YNR</b>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default AddWallet;
