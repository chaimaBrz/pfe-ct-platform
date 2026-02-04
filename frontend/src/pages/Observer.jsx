import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LogoutButton from "../components/LogoutButton";
import { apiFetch } from "../lib/api";
import "./Observer.css";

export default function Observer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 1) Infos user depuis JWT (id, role)
  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token); // { id, role, exp, iat, ... }
    } catch {
      return null;
    }
  }, [token]);

  // 2) Statut vision depuis backend: PASS / FAIL / PENDING
  const [visionStatus, setVisionStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // si pas de token -> retour login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/vision/status"); // attendu: { status: "PASS"|"FAIL"|"PENDING" }
        const status = data?.status || "PENDING";
        setVisionStatus(status);

        // optionnel: garder aussi un bool pour d'autres pages
        localStorage.setItem(
          "observer_validated",
          status === "PASS" ? "true" : "false",
        );
      } catch {
        // Si token invalide/expiré ou serveur down
        setVisionStatus("PENDING");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  const validated = visionStatus === "PASS";

  const cards = [
    {
      title: "Pré-validation observateur",
      desc: "Tests obligatoires : Ishihara (couleurs) + sensibilité au contraste.",
      status: loading ? "Chargement..." : validated ? "Validé" : "Obligatoire",
      locked: false,
      path: "/observer/pre-validation",
    },
    {
      title: "Évaluation de la qualité d’image",
      desc: "Deux modes : comparaison par paires (ITU) + notation Likert (1–5).",
      status: loading ? "—" : validated ? "Disponible" : "Bloqué",
      locked: !validated,
      path: "/observer/quality",
    },
    {
      title: "Visibilité & détectabilité",
      desc: "Détectabilité (fond uniforme), symétrie perceptive, tumeurs simulées.",
      status: loading ? "—" : validated ? "Disponible" : "Bloqué",
      locked: !validated,
      path: "/observer/detectability",
    },
  ];

  const go = (path, locked) => {
    if (locked || loading) return;
    navigate(path);
  };

  return (
    <div className="obs-shell">
      <header className="obs-topbar">
        <div className="obs-brand">
          <div className="obs-title">CT Vision</div>
          <div className="obs-subtitle">Espace Observateur</div>
        </div>

        <div className="obs-user">
          <div className="obs-user-meta">
            <div className="obs-user-line">
              <span className="k">ID:</span>{" "}
              <span className="v">{user?.id ?? "—"}</span>
            </div>
            <div className="obs-user-line">
              <span className="k">Rôle:</span>{" "}
              <span className="v">{user?.role ?? "—"}</span>
            </div>
            <div className="obs-user-line">
              <span className="k">Statut:</span>{" "}
              <span className={`v ${validated ? "ok" : "ko"}`}>
                {loading
                  ? "CHARGEMENT..."
                  : validated
                    ? "VALIDÉ"
                    : "NON VALIDÉ"}
              </span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </header>

      <main className="obs-main">
        <h2 className="obs-h2">Parcours des tests</h2>
        <p className="obs-p">
          La pré-validation (Ishihara + contraste) est obligatoire avant toute
          participation aux tests subjectifs.
        </p>

        <div className="obs-grid">
          {cards.map((c) => (
            <section
              className={`obs-card ${c.locked ? "locked" : ""}`}
              key={c.title}
            >
              <div className="obs-card-head">
                <h3>{c.title}</h3>
                <span
                  className={`obs-badge ${c.locked ? "b-locked" : "b-open"}`}
                >
                  {c.status}
                </span>
              </div>

              <p className="obs-card-desc">{c.desc}</p>

              <button
                className={`obs-btn ${c.locked || loading ? "btn-locked" : ""}`}
                onClick={() => go(c.path, c.locked)}
                disabled={c.locked || loading}
                title={
                  loading
                    ? "Chargement du statut..."
                    : c.locked
                      ? "Terminez la pré-validation pour débloquer"
                      : "Ouvrir"
                }
              >
                {loading
                  ? "Chargement..."
                  : c.locked
                    ? "Verrouillé"
                    : "Commencer"}
              </button>

              {c.locked && !loading && (
                <div className="obs-hint">
                  Débloquez en terminant la <b>pré-validation</b>.
                </div>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
