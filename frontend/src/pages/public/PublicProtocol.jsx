import { useNavigate } from "react-router-dom";

export default function PublicProtocol() {
  const navigate = useNavigate();

  function choose(mode) {
    localStorage.setItem("selectedProtocol", mode);
    if (mode === "PAIRWISE") navigate("/public/pairwise");
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Choisir un protocole</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => choose("PAIRWISE")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Pairwise (2 images)
        </button>

        <button
          disabled
          style={{ padding: "10px 14px", opacity: 0.6, cursor: "not-allowed" }}
          title="À implémenter plus tard"
        >
          Rating (1 image) — coming soon
        </button>
      </div>
    </div>
  );
}
