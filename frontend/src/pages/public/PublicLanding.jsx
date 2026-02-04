import { useNavigate, useParams } from "react-router-dom";

export default function PublicLanding() {
  const { token } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate(`/public/${token}/form`)}>
        Commencer
      </button>
    </div>
  );
}
