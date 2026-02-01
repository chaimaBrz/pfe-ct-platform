import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, allow }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);

    // Vérifie expiration du token
    if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    // Vérifie le rôle
    if (allow && decoded?.role && !allow.includes(decoded.role)) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}
