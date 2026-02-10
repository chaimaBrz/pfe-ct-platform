import { useNavigate, useParams } from "react-router-dom";

export default function PublicRating() {
  const navigate = useNavigate();
  const { token } = useParams();

  return (
    <div style={{ padding: 20 }}>
      <h2>Rating</h2>
      <p>Page Rating (en construction)</p>

      <button onClick={() => navigate(`/public/${token}/protocol`)}>
        Retour
      </button>
    </div>
  );
}
