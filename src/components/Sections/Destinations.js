import "./Sections.css";

function Destinations() {
  return (
    <div className="container mt-5 destinations-section">
      <h2 className="text-center section-title">Places not to be missed</h2>

      <div className="row g-2 pictures justify-content-center">
        <div className="col-md-3  d-flex flex-column gap-2 ">
          <img
            src="/khan-el-khalili.jpeg"
            className="img-fluid rounded"
            alt="Khan El Khalili"
          />
          <img src="/alex.jpg" className="img-fluid rounded" alt="Alex" />
        </div>
        <div className="col-md-3 d-flex flex-column gap-2">
          <img src="/luxor.jpg" className="img-fluid rounded" alt="Luxor" />
          <img src="/aswan.jpg" className="img-fluid rounded" alt="Aswan" />
        </div>
        <div className="col-md-3 d-flex flex-column gap-2">
          <img src="/dahab.jpg" className="img-fluid rounded" alt="Dahab" />

          <img src="/giza.jpg" className="img-fluid rounded" alt="Giza" />
        </div>
      </div>
    </div>
  );
}

export default Destinations;
