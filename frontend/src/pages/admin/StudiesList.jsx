import { useEffect, useState } from "react";

export default function StudiesList() {
  const [studies, setStudies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/studies", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Error");
        return data;
      })
      .then(setStudies)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <h1 className="admin-title">Manage Studies</h1>

        {error && <div className="admin-error">{error}</div>}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Protocol</th>
            </tr>
          </thead>

          <tbody>
            {studies.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.studyType}</td>
                <td>{s.protocol?.mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
