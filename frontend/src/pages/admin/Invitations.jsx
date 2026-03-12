import { useEffect, useState } from "react";

export default function Invitations() {
  const [studies, setStudies] = useState([]);
  const [studyId, setStudyId] = useState("");
  const [msg, setMsg] = useState("");
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/studies", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudies(data);
          if (data[0]) setStudyId(data[0].id);
        }
      });
  }, []);

  async function generate(e) {
    e.preventDefault();
    setMsg("");
    setInvite(null);

    const res = await fetch("http://localhost:4000/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studyId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMsg(data.error || data.message || "Error");
      return;
    }

    setInvite(data);
  }

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <h1 className="admin-title">Invitations</h1>

        <form className="admin-form" onSubmit={generate}>
          <label className="admin-label">Choose Study</label>
          <select
            className="admin-input"
            value={studyId}
            onChange={(e) => setStudyId(e.target.value)}
          >
            {studies.map((s) => {
              const mode = s.protocol?.mode || s.mode || "UNKNOWN";

              return (
                <option key={s.id} value={s.id}>
                  {s.name} ({mode})
                </option>
              );
            })}
          </select>

          <button className="admin-button">Generate Invitation</button>
        </form>

        {msg && <div className="admin-error">{msg}</div>}

        {invite && (
          <div className="admin-message">
            <div>
              ✅ Token: <b>{invite.token}</b>
            </div>
            <div>
              Link: <b>http://localhost:5173/public/{invite.token}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
