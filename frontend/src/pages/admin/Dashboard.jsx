import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:4000/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>

        {stats && (
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Studies</h3>
              <p>{stats.studies}</p>
            </div>
            <div className="stat-card">
              <h3>Sessions</h3>
              <p>{stats.sessions}</p>
            </div>
            <div className="stat-card">
              <h3>Evaluations</h3>
              <p>{stats.evaluations}</p>
            </div>
            <div className="stat-card">
              <h3>Invitations</h3>
              <p>{stats.invitations}</p>
            </div>
          </div>
        )}

        <div className="admin-menu">
          <Link className="admin-link" to="/admin/studies/new">
            Create Study
          </Link>
          <Link className="admin-link" to="/admin/studies">
            Manage Studies
          </Link>
          <Link className="admin-link" to="/admin/invitations">
            Invitations
          </Link>
          <Link className="admin-link" to="/admin/results">
            Results / Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
