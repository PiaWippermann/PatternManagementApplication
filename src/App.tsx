import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";

import AppLayout from "./layout/AppLayout";
import LoginPage from "./auth/LoginPage";
import { JSX } from "react";
import Patterns from "./pages/patterns/PatternList";
import PatternDetailPanel from "./pages/patterns/PatternDetail";
import SolutionDetailPanel from "./pages/solutions/SolutionDetail";
import Solutions from "./pages/solutions/SolutionImplementationList";
import { DiscussionDataProvider } from "./context/DiscussionDataContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="patterns" element={<Patterns />}>
          <Route path=":patternNumber" element={<PatternDetailPanel />} />
        </Route>
        <Route path="solutions" element={<Solutions />}>
          <Route path=":solutionId" element={<SolutionDetailPanel />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DiscussionDataProvider>
        <AppRoutes />
      </DiscussionDataProvider>
    </AuthProvider>
  );
}
