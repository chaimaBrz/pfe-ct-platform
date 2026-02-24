import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC ================= */
import PublicLanding from "./pages/public/PublicLanding.jsx";
import PublicObserverForm from "./pages/public/PublicObserverForm.jsx";
import PublicDemo from "./pages/public/PublicDemo.jsx";
import PublicProtocol from "./pages/public/PublicProtocol.jsx";
import PublicPairwise from "./pages/public/PublicPairwise.jsx";
import PublicRating from "./pages/public/PublicRating.jsx";
import PreValidation from "./pages/PreValidation/PreValidation.jsx";
import Results from "./pages/admin/Results.jsx";

/* ================= ADMIN ================= */
import Login from "./pages/admin/Login.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import StudiesList from "./pages/admin/StudiesList.jsx";
import CreateStudy from "./pages/admin/CreateStudy.jsx";
import Invitations from "./pages/admin/Invitations.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME → LOGIN ADMIN */}
        <Route path="/" element={<Login />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/studies" element={<StudiesList />} />
        <Route path="/admin/studies/new" element={<CreateStudy />} />
        <Route path="/admin/invitations" element={<Invitations />} />
        <Route path="/admin/results" element={<Results />} />

        {/* ================= PUBLIC ================= */}
        <Route path="/public/:token" element={<PublicLanding />} />
        <Route path="/public/:token/form" element={<PublicObserverForm />} />
        <Route path="/public/:token/vision" element={<PreValidation />} />
        <Route path="/public/:token/demo" element={<PublicDemo />} />
        <Route path="/public/:token/protocol" element={<PublicProtocol />} />
        <Route path="/public/:token/pairwise" element={<PublicPairwise />} />
        <Route path="/public/:token/rating" element={<PublicRating />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
