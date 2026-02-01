import "./Header.css";

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true" />
        <div className="brand-text">
          <div className="brand-title">
            CT <span>Vision</span>
          </div>
          <div className="brand-subtitle">
            Image Quality Assessment Platform
          </div>
        </div>
      </div>
    </header>
  );
}
