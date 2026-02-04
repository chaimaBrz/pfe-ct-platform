import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";

function toImageUrl(uri) {
  if (!uri) return "";
  // Si backend sert les fichiers en relatif (ex: /demo/x1.png), on préfixe avec l’API.
  if (uri.startsWith("http://") || uri.startsWith("https://")) return uri;
  return `${API_BASE_URL}${uri}`;
}

export default function PublicPairwise() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId") || "";
  const token = localStorage.getItem("publicToken") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [taskId, setTaskId] = useState("");
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);

  const startRef = useRef(Date.now());

  async function loadNext() {
    setError("");
    if (!sessionId || !token) {
      setError("sessionId/token manquant. Reviens au lien public.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/pairwise/next`,
      );
      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      const json = JSON.parse(text);

      setTaskId(json.taskId);
      setLeft(json.left);
      setRight(json.right);
      startRef.current = Date.now();
    } catch (e) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function answer(choice) {
    setError("");
    if (!taskId) {
      setError("taskId manquant. Clique 'Recharger'.");
      return;
    }

    const responseTimeMs = Date.now() - startRef.current;

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/pairwise/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, choice, responseTimeMs }),
        },
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      // on enchaîne direct sur la prochaine tâche
      await loadNext();
    } catch (e) {
      setError(e.message || "Erreur");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sessionId) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Pairwise</h2>
        <p style={{ color: "crimson" }}>
          sessionId introuvable. Reviens au formulaire.
        </p>
        <button onClick={() => navigate("/public/form")}>
          Aller au formulaire
        </button>
      </div>
    );
  }

  if (loading && !left && !right)
    return <div style={{ padding: 16 }}>Chargement…</div>;

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Pairwise</h2>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h4>Left</h4>
          {left ? (
            <img
              src={toImageUrl(left.uri)}
              alt="left"
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
            >
              Pas d’image
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          <h4>Right</h4>
          {right ? (
            <img
              src={toImageUrl(right.uri)}
              alt="right"
              style={{
                width: "100%",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
            >
              Pas d’image
            </div>
          )}
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}
      >
        <button
          disabled={loading}
          onClick={() => answer("LEFT_BETTER")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Left better
        </button>

        <button
          disabled={loading}
          onClick={() => answer("EQUAL")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Equal
        </button>

        <button
          disabled={loading}
          onClick={() => answer("RIGHT_BETTER")}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Right better
        </button>

        <button
          disabled={loading}
          onClick={loadNext}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Recharger
        </button>
      </div>

      <p style={{ marginTop: 10, opacity: 0.8 }}>
        taskId: <code>{taskId || "—"}</code>
      </p>
    </div>
  );
}
