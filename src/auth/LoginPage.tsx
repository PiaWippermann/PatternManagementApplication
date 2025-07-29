import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDevLogin = () => {
    const token = import.meta.env.VITE_GITHUB_PAT;
    console.log("Login-Token:", token); // Test
    if (token) {
      login(token);
      navigate("/");
    } else {
      console.error("Kein Token gefunden");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bitte bei GitHub einloggen</h1>
      <button onClick={handleDevLogin}>Mit Test-Token einloggen</button>
    </div>
  );
};

export default LoginPage;
