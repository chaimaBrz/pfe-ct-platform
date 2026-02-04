import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Admin from "./pages/Admin";
import ProtectedRoute from "./routes/ProtectedRoute";

// ✅ PUBLIC PAGES (bons noms)
import PublicLanding from "./pages/public/PublicLanding.jsx";
import PublicObserverForm from "./pages/public/PublicObserverForm.jsx";
import PublicVisionTest from "./pages/public/PublicVisionTest.jsx";
import PublicDemo from "./pages/public/PublicDemo.jsx";
import PublicProtocol from "./pages/public/PublicProtocol.jsx";
import PublicPairwise from "./pages/public/PublicPairwise.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin side */}
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

        {/* ✅ Public observer flow (NO login) */}
        <Route path="/public/:token" element={<PublicLanding />} />
        <Route path="/public/:token/form" element={<PublicObserverForm />} />
        <Route path="/public/:token/vision" element={<PublicVisionTest />} />
        <Route path="/public/:token/demo" element={<PublicDemo />} />
        <Route path="/public/:token/protocol" element={<PublicProtocol />} />
        <Route path="/public/:token/pairwise" element={<PublicPairwise />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
