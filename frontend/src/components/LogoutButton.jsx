export default function LogoutButton() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <button
      onClick={logout}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        color: "white",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      Déconnexion
    </button>
  );
}
