import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";

import AppLayout from "./layout/AppLayout";
import LoginPage from "./auth/LoginPage";
import { JSX } from "react";
import Patterns from "./pages/patterns/PatternList";
import PatternDetail from "./pages/patterns/PatternDetail";
import SolutionDetail from "./pages/solutions/SolutionDetail";
import SolutionImplementations from "./pages/solutions/SolutionImplementationList";
import CreateSolution from "./pages/solutions/CreateSolution";
import CreatePattern from "./pages/patterns/CreatePattern";
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
          <Route path=":patternNumber" element={<PatternDetail />} />
          <Route path="create" element={<CreatePattern />} />
        </Route>
        <Route path="solutionImplementations" element={<SolutionImplementations />}>
          <Route path=":solutionImplementationNumber" element={<SolutionDetail />} />
          <Route path="create" element={<CreateSolution />} />
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
