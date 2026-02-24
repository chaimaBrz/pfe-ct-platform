import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  const fakeStats = {
    studies: 12,
    sessions: 84,
    evaluations: 1260,
    invitations: 5,
  };

  return (
    <div className="admin-page">
      <div className="admin-card wide">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>

          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <h3>Studies</h3>
            <p>{fakeStats.studies}</p>
          </div>

          <div className="stat-card">
            <h3>Sessions</h3>
            <p>{fakeStats.sessions}</p>
          </div>

          <div className="stat-card">
            <h3>Evaluations</h3>
            <p>{fakeStats.evaluations}</p>
          </div>

          <div className="stat-card">
            <h3>Invitations</h3>
            <p>{fakeStats.invitations}</p>
          </div>
        </div>

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
