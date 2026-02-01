export default function ObserverDashboard() {
  const token = localStorage.getItem("token");

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard Observateur</h1>
      <p>Token présent ? {token ? "✅ oui" : "❌ non"}</p>
    </div>
  );
}
