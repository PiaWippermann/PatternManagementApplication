import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";

import AppLayout from "./layout/AppLayout";
import LoginPage from "./auth/LoginPage";
import { JSX } from "react";
import Dashboard from "./pages/Dashboard";
import Patterns from "./pages/patterns/Patterns";
import PatternDetailPanel from "./pages/patterns/PatternDetailPanel";
import CreatePattern from "./pages/patterns/CreatePattern";
import SolutionDetailPanel from "./pages/solutions/SolutionDetailPanel";
import Solutions from "./pages/solutions/Solutions";
import { DiscussionDataProvider } from "./context/DiscussionDataContext";
import CreateSolution from "./pages/solutions/CreateSolution";

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
        <Route index element={<Dashboard />} />
        <Route path="patterns" element={<Patterns />}>
          <Route path=":patternId" element={<PatternDetailPanel />} />
          <Route path="new" element={<CreatePattern />} />
        </Route>
        <Route path="solutions" element={<Solutions />}>
          <Route path=":solutionId" element={<SolutionDetailPanel />} />
          <Route path="new" element={<CreateSolution />} />
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
