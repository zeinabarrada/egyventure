import "./Sections.css";

function Destinations() {
  return (
    <div className="container mt-5 destinations-section">
      <h2 className="text-center section-title">Places not to be missed</h2>

      <div className="row g-2 pictures justify-content-center">
        <div className="col-md-3  d-flex flex-column gap-2 ">
          <div className="image-wrapper">
            <img
              src="/khan-el-khalili.jpeg"
              className="img-fluid rounded"
              alt="Khan El Khalili"
            />
            <div className="image-overlay">
              <h5>Khan El Khalili</h5>
              <p>Cairo</p>
            </div>
          </div>
          <div className="image-wrapper">
            <img src="/alex.jpg" className="img-fluid rounded" alt="Alex" />
            <div className="image-overlay">
              <h5>Qaitbay Citadel</h5>
              <p>Alexandria</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 d-flex flex-column gap-2">
          <div className="image-wrapper">
            <img src="/luxor.jpg" className="img-fluid rounded" alt="Luxor" />
            <div className="image-overlay">
              <h5>Karnak Temple</h5>
              <p>Luxor</p>
            </div>
          </div>
          <div className="image-wrapper">
            <img src="/aswan.jpg" className="img-fluid rounded" alt="Aswan" />
            <div className="image-overlay">
              <h5>Philae Temple</h5>
              <p>Aswan</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 d-flex flex-column gap-2">
          <div className="image-wrapper">
            <img src="/dahab.jpg" className="img-fluid rounded" alt="Dahab" />
            <div className="image-overlay">
              <h5>Blue Hole</h5>
              <p>Dahab</p>
            </div>
          </div>
          <div className="image-wrapper">
            <img src="/giza.jpg" className="img-fluid rounded" alt="Giza" />
            <div className="image-overlay">
              <h5>Great Pyramids</h5>
              <p>Giza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Destinations;
