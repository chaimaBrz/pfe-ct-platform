import { useEffect, useState } from "react";

export default function StudiesList() {
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/studies")
      .then((res) => res.json())
      .then(setStudies);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <h1 className="admin-title">Manage Studies</h1>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>

          <tbody>
            {studies.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.status}</td>
                <td>{s.studyType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
