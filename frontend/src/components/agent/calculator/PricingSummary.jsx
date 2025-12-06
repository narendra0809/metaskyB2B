const PricingSummary = ({ calc }) => {
  return (
    <div className="px-2 py-2 px-md-4 mb-4">
      <div className="title-line">
        <span>Pricing</span>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col mb-3 mb-md-4">Adult's Total:-</div>
        <div className="col mb-3 mb-md-4">{calc.adultsTotal}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col mb-3 mb-md-4">Children's Total:-</div>
        <div className="col mb-3 mb-md-4">{calc.childrenTotal}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col mb-3 mb-md-4">Per Adult:-</div>
        <div className="col mb-3 mb-md-4">{calc.perAdult}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3">
        <div className="col mb-3 mb-md-4">Per Children:-</div>
        <div className="col mb-3 mb-md-4">{calc.perChild}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
        <div className="col mb-3 mb-md-4">Total:-</div>
        <div className="col mb-3 mb-md-4">{calc.total}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
        <div className="col mb-3 mb-md-4">Taxed Amount:-</div>
        <div className="col mb-3 mb-md-4">{calc.taxAmount}/-</div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 fw-bold">
        <div className="col mb-3 mb-md-4">Final Payment:-</div>
        <div className="col mb-3 mb-md-4">{calc.finalAmount}/-</div>
      </div>
    </div>
  );
};

export default PricingSummary;
