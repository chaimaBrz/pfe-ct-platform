import { useNavigate } from "react-router-dom";

export default function PublicDemo() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Vidéo de démonstration</h2>

      <p>Regarde la vidéo puis clique “Continuer”.</p>

      <video
        controls
        style={{ width: "100%", borderRadius: 8, border: "1px solid #ddd" }}
        src="/demo.mp4"
        onError={() => {
          // si tu n’as pas de vidéo pour l’instant, pas grave
        }}
      />

      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => navigate("/public/protocol")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
