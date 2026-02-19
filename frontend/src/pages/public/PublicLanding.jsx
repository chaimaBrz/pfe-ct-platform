import { useNavigate, useParams } from "react-router-dom";
import "./PublicLanding.css";
import bgImage from "../../assets/medical-bg.png";

export default function PublicLanding() {
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <div
      className="landing-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="landing-overlay" />

      <header className="landing-header">
        <div className="logo">
          <div className="logo-circle">CT</div>
          <div>
            <div className="logo-title">CT Image Evaluation</div>
            <div className="logo-sub">Observer portal</div>
          </div>
        </div>

        <div className="top-badges">
          <span className="badge">Anonymous</span>
          <span className="badge">No account</span>
          <span className="badge">10–15 min</span>
        </div>
      </header>

      <main className="landing-content">
        <section className="landing-left">
          <h1>
            Help us improve <br />
            <span>CT image quality</span>
          </h1>

          <p className="landing-description">
            This study collects subjective evaluations of CT image quality to
            help improve acquisition and reconstruction protocols.
          </p>

          <div className="info-box light">
            <h3>Privacy</h3>
            <p>
              Answers are recorded discreetly. No vision scores are displayed.
            </p>
          </div>

          <div className="info-box light">
            <h3>Before starting</h3>
            <ul>
              <li>Increase your screen brightness</li>
              <li>Disable any blue-light filter</li>
              <li>Avoid interruptions during the study</li>
            </ul>
          </div>

          <button
            className="start-btn"
            onClick={() => navigate(`/public/${token}/form`)}
          >
            Start the study
          </button>

          <div className="consent-text">
            By clicking, you agree to participate voluntarily.
          </div>
        </section>

        <aside className="landing-right light">
          <h2>Steps in the study</h2>
          <p className="right-sub">Quick overview</p>

          <div className="step light">
            <span>1</span>
            <div>
              <strong>Observer profile</strong>
              <p>~ 1 min</p>
            </div>
          </div>

          <div className="step light">
            <span>2</span>
            <div>
              <strong>Vision: Ishihara + contrast</strong>
              <p>3–5 min (non-blocking)</p>
            </div>
          </div>

          <div className="step light">
            <span>3</span>
            <div>
              <strong>Demo instructions</strong>
              <p>~ 1 min</p>
            </div>
          </div>

          <div className="step light">
            <span>4</span>
            <div>
              <strong>Choose protocol</strong>
              <p>Pairwise</p>
            </div>
          </div>

          <div className="step light">
            <span>5</span>
            <div>
              <strong>Image comparisons</strong>
              <p>5–8 min</p>
            </div>
          </div>

          <div className="right-tip">
            Tip: use a sufficient screen size for best comfort.
          </div>
        </aside>
      </main>

      <footer className="landing-footer">
        CT Image Evaluation Platform – Public observer access
      </footer>
    </div>
  );
}
