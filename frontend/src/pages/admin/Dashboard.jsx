import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>

          <button className="admin-logout" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="admin-menu">
          <Link className="admin-link" to="/admin/studies/new">
            Create Study
          </Link>

          <Link className="admin-link" to="/admin/invitations">
            Invitations
          </Link>

          <Link className="admin-link" to="/admin/studies">
            Manage Studies
          </Link>
        </div>
      </div>
    </div>
  );
}
