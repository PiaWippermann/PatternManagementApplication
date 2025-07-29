import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Fetch initial token from localStorage
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("github_auth_token");
  });

  const login = (newToken: string) => {
    console.log("Login wurde ausgelöst");
    setToken(newToken);
    localStorage.setItem("github_auth_token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("github_auth_token");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  return context;
};
