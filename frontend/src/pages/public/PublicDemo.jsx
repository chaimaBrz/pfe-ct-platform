import { useNavigate, useParams } from "react-router-dom";
import "./PublicDemo.css";

export default function PublicDemo() {
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <div className="demo-page">
      {/* Top bar */}
      <header className="demo-topbar">
        <div className="demo-brand">
          <div className="demo-logo">CT</div>
          <div>
            <div className="demo-brandTitle">CT Image Evaluation</div>
            <div className="demo-brandSub">Demo instructions</div>
          </div>
        </div>

        <div className="demo-pills">
          <span className="demo-pill">Anonymous</span>
          <span className="demo-pill">No account</span>
          <span className="demo-pill">10–15 min</span>
        </div>
      </header>

      {/* Content */}
      <main className="demo-container">
        <h1 className="demo-title">Demonstration video</h1>
        <p className="demo-subtitle">
          Watch the video, then click <b>Continue</b>.
        </p>

        <section className="demo-card">
          <video className="demo-video" controls src="/demo.mp4" />

          <div className="demo-tip">
            Tip: switch to full screen to see image details more clearly.
          </div>

          <div className="demo-actions">
            <button
              className="demo-btn demo-btnGhost"
              onClick={() => navigate(`/public/${token}/vision`)}
            >
              Back
            </button>

            <button
              className="demo-btn demo-btnPrimary"
              onClick={() => navigate(`/public/${token}/protocol`)}
            >
              Continue
            </button>
          </div>
        </section>

        <footer className="demo-footer">
          CT Image Evaluation Platform – Public observer access
        </footer>
      </main>
    </div>
  );
}
