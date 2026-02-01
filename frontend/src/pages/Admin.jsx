export default function Admin() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <button
        onClick={() => (
          localStorage.removeItem("token"),
          (window.location.href = "/login")
        )}
      >
        Déconnexion
      </button>
    </div>
  );
}
