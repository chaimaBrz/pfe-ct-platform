import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Observer from "./pages/Observer.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

import PreValidation from "./pages/PreValidation/PreValidation.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/observer/pre-validation"
          element={
            <ProtectedRoute allow={["OBSERVER", "ADMIN"]}>
              <PreValidation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/observer"
          element={
            <ProtectedRoute allow={["OBSERVER", "ADMIN"]}>
              <Observer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/observer/pre-validation"
          element={
            <ProtectedRoute allow={["OBSERVER", "ADMIN"]}>
              <PreValidation />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
