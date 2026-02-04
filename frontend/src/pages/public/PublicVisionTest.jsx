import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

/**
 * IMPORTANT:
 * - Mets tes images Ishihara dans /public/ishihara/1.png ... 24.png (front)
 *   ou adapte les URLs ici.
 * - answers[]: tu dois mettre les vraies réponses de TES images (celles que vous utilisez).
 *   (Je ne fournis pas d’images ici.)
 */
const ishiharaImages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  // exemple (à adapter)
  src: `/ishihara/${i + 1}.png`,
}));

// ⚠️ À REMPLACER avec votre vérité terrain correspondant à VOS images
const answers = Array.from({ length: 24 }, () => "");

export default function PublicVisionTest() {
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId") || "";

  const [idx, setIdx] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState(() => Array(24).fill(""));
  const [contrast, setContrast] = useState(0.5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState("");

  const done = idx >= ishiharaImages.length;

  const correctCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < 24; i++) {
      const expected = (answers[i] ?? "").toString().trim();
      const got = (userAnswers[i] ?? "").toString().trim();
      if (expected && got && expected === got) c++;
    }
    return c;
  }, [userAnswers]);

  function saveCurrentAndNext() {
    setError("");
    const nextAnswers = [...userAnswers];
    nextAnswers[idx] = currentAnswer.trim();
    setUserAnswers(nextAnswers);
    setCurrentAnswer("");
    setIdx((v) => v + 1);
  }

  async function submitVision() {
    setError("");
    if (!sessionId) {
      setError("sessionId manquant. Reviens au formulaire.");
      return;
    }

    // Si vous n’avez pas encore les réponses, tu peux envoyer le score brute = correctCount (sera 0)
    const payload = {
      ishiharaScore: correctCount,
      ishiharaTotal: 24,
      contrastScore: Number(contrast),
    };

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/public/session/${sessionId}/vision`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const text = await res.text();
      if (!res.ok) throw new Error(`Erreur (${res.status}) : ${text}`);

      const json = JSON.parse(text);
      setServerStatus(json.status || "OK");

      // NON BLOQUANT => on continue quoi qu’il arrive
      navigate("/public/demo");
    } catch (e) {
      setError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (!sessionId) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Vision Test</h2>
        <p style={{ color: "crimson" }}>
          sessionId introuvable. Reviens à /public/form
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ padding: 16, maxWidth: 720 }}>
        <h2>Vision Test terminé</h2>

        <p>
          Ishihara : <b>{correctCount}</b> / 24
        </p>

        <div style={{ marginTop: 12 }}>
          <label>Contraste (slider démo) : {contrast}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={contrast}
            onChange={(e) => setContrast(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {serverStatus && <p>Backend status: {serverStatus}</p>}

        <button
          disabled={loading}
          onClick={submitVision}
          style={{ padding: "10px 14px", cursor: "pointer", marginTop: 12 }}
        >
          {loading ? "Envoi…" : "Continuer (enregistrer le test)"}
        </button>
      </div>
    );
  }

  const img = ishiharaImages[idx];

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>Test Ishihara</h2>
      <p>
        Image {idx + 1} / {ishiharaImages.length}
      </p>

      <div style={{ margin: "12px 0" }}>
        <img
          src={img.src}
          alt={`Ishihara ${img.id}`}
          style={{
            maxWidth: "100%",
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
          onError={(e) => {
            // si image manquante
            e.currentTarget.style.display = "none";
            setError(
              "Image Ishihara introuvable. Ajoute les images ou adapte les chemins.",
            );
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label>Nombre vu</label>
        <input
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="ex: 12"
        />

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <button
          onClick={saveCurrentAndNext}
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
