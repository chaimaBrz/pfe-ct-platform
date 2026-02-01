import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Header from "../components/Header";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("zran_user@mail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Redirection automatique si déjà connecté
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      // Token expiré
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem("token");
        return;
      }

      // Redirection selon le rôle
      if (decoded.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/observer";
      }
    } catch {
      localStorage.removeItem("token");
    }
  }, []);

  // 🔑 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Email ou mot de passe incorrect");
      }

      // Stocker le token
      localStorage.setItem("token", data.token);

      // Décoder pour connaître le rôle
      const decoded = jwtDecode(data.token);

      if (decoded.role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/observer";
      }
    } catch (err) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <Header />

      <main className="login-wrap">
        <section className="login-card">
          <div className="login-head">
            <h2>Connexion</h2>
            <p>Accédez à votre espace sécurisé</p>
          </div>

          {error && (
            <div className="alert">
              <span className="alert-dot" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="nom@hopital.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="field">
              <span>Mot de passe</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className="foot">
              <span className="foot-brand">CT Vision</span>
              <span className="foot-sep">•</span>
              <span className="foot-sub">
                Image Quality Assessment Platform
              </span>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
