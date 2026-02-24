import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert("Login failed");
      return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    navigate("/admin/dashboard");
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Admin Login</h1>

        <form className="admin-form" onSubmit={handleLogin}>
          <input
            className="admin-input"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="admin-input"
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="admin-button">Login</button>
        </form>
      </div>
    </div>
  );
}
