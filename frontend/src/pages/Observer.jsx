import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LogoutButton from "../components/LogoutButton";
import "./Observer.css";

export default function Observer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  // ✅ règle du PDF : accès bloqué tant que non validé
  const validated = localStorage.getItem("observer_validated") === "true";

  const cards = [
    {
      title: "Pré-validation observateur",
      desc: "Tests obligatoires : Ishihara (couleurs) + sensibilité au contraste.",
      status: validated ? "Validé" : "Obligatoire",
      locked: false,
      path: "/observer/pre-validation",
    },
    {
      title: "Évaluation de la qualité d’image",
      desc: "Deux modes : comparaison par paires (ITU) + notation Likert (1–5).",
      status: validated ? "Disponible" : "Bloqué",
      locked: !validated,
      path: "/observer/quality",
    },
    {
      title: "Visibilité & détectabilité",
      desc: "Détectabilité (fond uniforme), symétrie perceptive, tumeurs simulées.",
      status: validated ? "Disponible" : "Bloqué",
      locked: !validated,
      path: "/observer/detectability",
    },
  ];

  const go = (path, locked) => {
    if (locked) return;
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
                {validated ? "VALIDÉ" : "NON VALIDÉ"}
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
                className={`obs-btn ${c.locked ? "btn-locked" : ""}`}
                onClick={() => go(c.path, c.locked)}
                title={
                  c.locked
                    ? "Terminez la pré-validation pour débloquer"
                    : "Ouvrir"
                }
              >
                {c.locked ? "Verrouillé" : "Commencer"}
              </button>

              {c.locked && (
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
