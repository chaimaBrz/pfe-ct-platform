import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public pages
import PublicLanding from "./pages/public/PublicLanding.jsx";
import PublicObserverForm from "./pages/public/PublicObserverForm.jsx";
import PublicDemo from "./pages/public/PublicDemo.jsx";
import PublicProtocol from "./pages/public/PublicProtocol.jsx";
import PublicPairwise from "./pages/public/PublicPairwise.jsx";
import PublicRating from "./pages/public/PublicRating.jsx";

// ✅ Vision step = PreValidation (Ishihara PDF + Contrast + POST /vision)
import PreValidation from "./pages/PreValidation/PreValidation.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: 30 }}>
              ✅ Front OK — ouvre un lien /public/TOKEN
            </div>
          }
        />

        {/* PUBLIC OBSERVER FLOW */}
        <Route path="/public/:token" element={<PublicLanding />} />
        <Route path="/public/:token/form" element={<PublicObserverForm />} />

        {/* ✅ remplace PublicVisionTest */}
        <Route path="/public/:token/vision" element={<PreValidation />} />

        <Route path="/public/:token/demo" element={<PublicDemo />} />
        <Route path="/public/:token/protocol" element={<PublicProtocol />} />
        <Route path="/public/:token/pairwise" element={<PublicPairwise />} />
        <Route path="/public/:token/rating" element={<PublicRating />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
