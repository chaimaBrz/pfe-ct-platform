import { useEffect, useState } from "react";

export default function Results() {
  const [studies, setStudies] = useState([]);
  const [studyId, setStudyId] = useState("");
  const [results, setResults] = useState([]);

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

  useEffect(() => {
    if (!studyId) return;

    const token = localStorage.getItem("token");

    fetch(`http://localhost:4000/admin/studies/${studyId}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setResults);
  }, [studyId]);

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <h1 className="admin-title">Results / Analytics</h1>

        <select
          className="admin-input"
          value={studyId}
          onChange={(e) => setStudyId(e.target.value)}
        >
          {studies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.protocol?.mode})
            </option>
          ))}
        </select>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Started</th>
              <th>Evaluations</th>
              <th>Ishihara</th>
              <th>Contrast</th>
            </tr>
          </thead>

          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.token}</td>
                <td>{new Date(r.startedAt).toLocaleString()}</td>
                <td>{r.evaluationsCount}</td>
                <td>{r.ishiharaScore}</td>
                <td>{r.contrastScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
