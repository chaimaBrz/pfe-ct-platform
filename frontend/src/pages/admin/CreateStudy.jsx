import { useState } from "react";

export default function CreateStudy() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("PAIRWISE");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        studyType: "QUALITY",
        protocolId:
          mode === "PAIRWISE" ? "PAIRWISE_PROTOCOL_ID" : "RATING_PROTOCOL_ID",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Error");
      return;
    }

    setMsg("✅ Study created");
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Create Study</h1>

        <form className="admin-form" onSubmit={handleSubmit}>
          <input
            className="admin-input"
            placeholder="Study name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="admin-input"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="PAIRWISE">Pairwise</option>
            <option value="RATING">Rating</option>
          </select>

          <button className="admin-button">Create Study</button>
        </form>

        {msg && <div className="admin-message">{msg}</div>}
      </div>
    </div>
  );
}
