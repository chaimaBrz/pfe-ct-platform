import "./PreValidation.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetchPublic } from "../../lib/api";

// ✅ IMPORTS MANQUANTS (cause de la page blanche)
import IshiharaFromPDF from "./IshiharaFromPDF";
import ContrastTest from "./ContrastTest";

export default function PreValidation() {
  const { token } = useParams();
  const navigate = useNavigate();

  // ✅ même clé partout
  const sessionId = localStorage.getItem("sessionId");

  const [ishihara, setIshihara] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ redirection si sessionId absent
  useEffect(() => {
    if (!sessionId) {
      navigate(`/public/${token}/form`, { replace: true });
    }
  }, [sessionId, token, navigate]);

  if (!sessionId) {
    return <div style={{ padding: 20 }}>Redirection vers le formulaire…</div>;
  }

  async function submitVision({ ishiharaScore, ishiharaTotal, contrastScore }) {
    setError("");
    setSaving(true);

    try {
      await apiFetchPublic(`/public/session/${sessionId}/vision`, {
        method: "POST",
        body: {
          ishiharaScore: Number(ishiharaScore ?? 0),
          ishiharaTotal: Number(ishiharaTotal ?? 24),
          contrastScore: Number(contrastScore ?? 0),
        },
      });

      navigate(`/public/${token}/demo`);
    } catch (e) {
      setError(e?.message || "Erreur lors de l’enregistrement du test.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pv-shell">
      {/* 1️⃣ Ishihara */}
      {!ishihara && (
        <IshiharaFromPDF
          onDone={({ ishiharaScore, ishiharaTotal }) => {
            setIshihara({
              ishiharaScore: Number(ishiharaScore ?? 0),
              ishiharaTotal: Number(ishiharaTotal ?? 24),
            });
          }}
        />
      )}

      {/* 2️⃣ Contraste */}
      {ishihara && (
        <>
          <ContrastTest
            totalRounds={16}
            onDone={({ contrastScore }) => {
              submitVision({
                ishiharaScore: ishihara.ishiharaScore,
                ishiharaTotal: ishihara.ishiharaTotal,
                contrastScore,
              });
            }}
          />

          {saving && <p style={{ padding: 12 }}>Saving results…</p>}
          {error && <p style={{ padding: 12, color: "crimson" }}>{error}</p>}
        </>
      )}
    </div>
  );
}
