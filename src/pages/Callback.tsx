import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Callback = () => {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(search);
      const code = params.get('code');

      if (!code) return;

      try {
        const res = await axios.get(`http://localhost:4000/auth/github/callback?code=${code}`);
        const token = res.data.access_token;

        localStorage.setItem('github_token', token); // z. B. persistieren

        navigate('/');
      } catch (err) {
        console.error('Fehler beim Token-Tausch', err);
      }
    };

    fetchToken();
  }, [search, navigate]);

  return <p>Authentifiziere mit GitHub…</p>;
};

export default Callback;
