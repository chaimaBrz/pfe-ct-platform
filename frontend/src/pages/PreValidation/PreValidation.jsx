import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PreValidation.css";
import { ISHIHARA_PLATES, ISHIHARA_PASS_MIN } from "./ishiharaData";

export default function PreValidation() {
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const plate = ISHIHARA_PLATES[current];

  const handleAnswer = (answer) => {
    if (answer === plate.answer) {
      setScore((s) => s + 1);
    }

    if (current + 1 < ISHIHARA_PLATES.length) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const validate = () => {
    localStorage.setItem("observer_validated", "true");
    navigate("/observer");
  };

  const retry = () => {
    setCurrent(0);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="pv-shell">
      <div className="pv-card">
        <h2>Pré-validation observateur</h2>
        <p className="pv-desc">
          Test de vision des couleurs (planches d’Ishihara). Cette étape est
          obligatoire avant les évaluations subjectives.
        </p>

        {!finished ? (
          <>
            <div className="pv-image">
              <img src={plate.image} alt="Ishihara test" />
            </div>

            <p className="pv-question">{plate.question}</p>

            <div className="pv-options">
              {plate.options.map((opt) => (
                <button
                  key={opt}
                  className="pv-btn"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pv-progress">
              Planche {current + 1} / {ISHIHARA_PLATES.length}
            </div>
          </>
        ) : (
          <>
            <div
              className={`pv-result ${
                score >= ISHIHARA_PASS_MIN ? "ok" : "ko"
              }`}
            >
              Résultat : {score} / {ISHIHARA_PLATES.length}
            </div>

            {score >= ISHIHARA_PASS_MIN ? (
              <>
                <p className="pv-success">
                  ✔ Pré-validation réussie. Accès débloqué.
                </p>
                <button className="pv-btn success" onClick={validate}>
                  Accéder à l’espace observateur
                </button>
              </>
            ) : (
              <>
                <p className="pv-fail">
                  ✖ Pré-validation échouée. Veuillez réessayer.
                </p>
                <button className="pv-btn ghost" onClick={retry}>
                  Recommencer le test
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
