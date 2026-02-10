import { useNavigate, useParams } from "react-router-dom";
import "./PublicProtocol.css";

export default function PublicProtocol() {
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <div className="pp-page">
      <div className="pp-bg" />

      <header className="pp-header">
        <div className="pp-brand">
          <div className="pp-logo">CT</div>
          <div className="pp-brandText">
            <div className="pp-brandTitle">CT Image Evaluation</div>
            <div className="pp-brandSub">Choose protocol</div>
          </div>
        </div>

        <div className="pp-chips">
          <span className="pp-chip">Anonymous</span>
          <span className="pp-chip">No account</span>
          <span className="pp-chip">10–15 min</span>
        </div>
      </header>

      <main className="pp-main">
        <h1 className="pp-title">Choose a protocol</h1>
        <p className="pp-subtitle">
          Select an evaluation mode. You can start immediately with{" "}
          <b>Pairwise</b> or <b>Rating</b>.
        </p>

        <section className="pp-grid">
          {/* Pairwise */}
          <article className="pp-card pp-cardActive">
            <div className="pp-cardTop">
              <div className="pp-icon">⇄</div>
              <div className="pp-cardHead">
                <div className="pp-cardTitleRow">
                  <h2 className="pp-cardTitle">Pairwise</h2>
                </div>
                <div className="pp-cardMeta">2 images • comparison</div>
              </div>
            </div>

            <p className="pp-cardDesc">
              Compare two images and choose the one that looks higher quality.
              Fast and intuitive.
            </p>

            <div className="pp-tags">
              <span className="pp-tag">Simple</span>
              <span className="pp-tag">Fast</span>
              <span className="pp-tag">Reliable</span>
            </div>

            <div className="pp-cardActions">
              <button
                className="pp-linkBtn"
                onClick={() => navigate(`/public/${token}/pairwise`)}
              >
                Start →
              </button>
            </div>
          </article>

          {/* Rating */}
          <article className="pp-card">
            <div className="pp-cardTop">
              <div className="pp-icon">★</div>
              <div className="pp-cardHead">
                <div className="pp-cardTitleRow">
                  <h2 className="pp-cardTitle">Rating</h2>
                </div>
                <div className="pp-cardMeta">1 image • score</div>
              </div>
            </div>

            <p className="pp-cardDesc">
              Rate a single image using a quality scale. Great for detailed
              scoring.
            </p>

            <div className="pp-tags">
              <span className="pp-tag">Detailed</span>
              <span className="pp-tag">Scale-based</span>
              <span className="pp-tag">Single image</span>
            </div>

            <div className="pp-cardActions">
              <button
                className="pp-linkBtn"
                onClick={() => navigate(`/public/${token}/rating`)}
              >
                Start →
              </button>
            </div>
          </article>
        </section>

        <div className="pp-bottom">
          <button
            className="pp-ghostBtn"
            onClick={() => navigate(`/public/${token}/demo`)}
          >
            Back
          </button>

          <div className="pp-primaryActions">
            <button
              className="pp-primaryBtn pp-primaryBtnLight"
              onClick={() => navigate(`/public/${token}/rating`)}
            >
              Start Rating
            </button>
            <button
              className="pp-primaryBtn"
              onClick={() => navigate(`/public/${token}/pairwise`)}
            >
              Start Pairwise
            </button>
          </div>
        </div>

        <footer className="pp-footer">
          CT Image Evaluation Platform – Public observer access
        </footer>
      </main>
    </div>
  );
}
