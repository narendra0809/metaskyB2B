const BasicInfo = ({ formData, handleDataChange, today }) => {
  return (
    <div className="px-2 py-2 px-md-4 mb-4">
      <div className="title-line">
        <span>Basic info</span>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col mb-3 mb-md-4">
          <label htmlFor="customer_number" className="fw-bold">
            Customer Name
          </label>
          <input
            type="text"
            id="customer_number"
            className="form-control mt-1"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleDataChange}
          />
        </div>
        <div className="col mb-3 mb-md-4">
          <label htmlFor="phone_no" className="fw-bold">
            Phone Number
          </label>
          <input
            type="text"
            id="phone_no"
            className="form-control mt-1"
            maxLength={10}
            name="phone_no"
            value={formData.phone_no}
            onChange={handleDataChange}
          />
        </div>
        <div className="col mb-3 mb-md-4">
          <label htmlFor="travel_date_from" className="fw-bold">
            Travel Date From
          </label>
          <input
            type="date"
            id="travel_date_from"
            className="form-control mt-1" // Removed text-white as it might be invisible on white bg
            min={today}
            name="travel_date_from"
            value={formData.travel_date_from}
            onChange={handleDataChange}
          />
        </div>
        <div className="col mb-3 mb-md-4">
          <label htmlFor="travel_date_to" className="fw-bold">
            Travel Date To
          </label>
          <input
            type="date"
            id="travel_date_to"
            className="form-control mt-1"
            name="travel_date_to"
            min={formData.travel_date_from}
            value={formData.travel_date_to}
            onChange={handleDataChange}
            disabled={!formData.travel_date_from}
          />
        </div>
        <div className="col mb-3 mb-md-4">
          <label htmlFor="no_adults" className="fw-bold">
            Adults
          </label>
          <input
            id="no_adults"
            type="number"
            className="form-control mt-1"
            name="no_adults"
            value={formData.no_adults}
            onChange={handleDataChange}
          />
        </div>
        <div className="col mb-3 mb-md-4">
          <label htmlFor="no_children" className="fw-bold">
            Children
          </label>
          <input
            type="number"
            id="no_children"
            className="form-control mt-1"
            name="no_children"
            value={formData.no_children}
            onChange={handleDataChange}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
