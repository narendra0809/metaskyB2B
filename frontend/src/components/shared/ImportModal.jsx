import { useState } from "react";
import Modal from "../Modal";

const ImportModal = ({
  open,
  onClose,
  apiEndpoint,
  token,
  onSuccess,
  title = "Import Excel File",
}) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleCloseInternal = () => {
    setFile(null);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an Excel file to import");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Import failed");
      } else {
        // Success!
        if (onSuccess) onSuccess();
        handleCloseInternal();
      }
    } catch (err) {
      setError("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} handleClose={handleCloseInternal} title={title}>
      <div className="container p-3">
        <div className="mb-3">
          <label htmlFor="importFile" className="form-label">
            Select File
          </label>
          <input
            id="importFile"
            type="file"
            accept=".xls,.xlsx"
            className="form-control"
            onChange={handleFileChange}
            // Reset input value so same file can be selected again if needed
            onClick={(e) => (e.target.value = null)}
          />
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            className="btn btn-secondary"
            onClick={handleCloseInternal}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;
