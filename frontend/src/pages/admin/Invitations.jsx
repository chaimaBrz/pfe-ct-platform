import { useState } from "react";

export default function Invitations() {
  const [studyId, setStudyId] = useState("");
  const [msg, setMsg] = useState("");
  const [invite, setInvite] = useState(null);

  async function generate(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.message || "Error");
      return;
    }

    setInvite(data);
    setMsg("");
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Invitations</h1>

        <form className="admin-form" onSubmit={generate}>
          <input
            className="admin-input"
            placeholder="Study ID"
            value={studyId}
            onChange={(e) => setStudyId(e.target.value)}
          />

          <button className="admin-button">Generate Invitation</button>
        </form>

        {msg && <div className="admin-error">{msg}</div>}

        {invite && (
          <div className="admin-message">
            <div>✅ Token: {invite.token}</div>
            <div>Link: http://localhost:5173/public/{invite.token}</div>
          </div>
        )}
      </div>
    </div>
  );
}
