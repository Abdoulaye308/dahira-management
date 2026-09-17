import type { FormEvent } from 'react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import './Login.css';

function Login() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (user?.role === 'MEMBER') {
      return <Navigate to="/member/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login(email, password);

      const from = (location.state as any)?.from?.pathname;

      if (from && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        // Le rôle sera disponible après login dans AuthContext.
        // Le dashboard ADMIN est la destination par défaut.
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Email ou mot de passe incorrect.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =========================================
          PANNEAU DE MARQUE (masqué en mobile)
      ========================================= */}

      <div className="login-branding">

        <div className="login-branding-pattern"></div>

        <div className="login-branding-content">

          <div className="login-branding-logo">
            <img src={logo} alt="Dahira Hisnoul Abraar" />
          </div>

          <h1 className="login-branding-title">
            Dahira Hisnoul Abraar
          </h1>

          <p className="login-branding-sub">Touba Bayakh</p>

          <svg
            className="login-branding-swoosh"
            viewBox="0 0 220 26"
            fill="none"
          >
            <path
              d="M0 4 C 55 26, 80 26, 110 4 C 140 26, 165 26, 220 4"
              stroke="#E8CE84"
              strokeWidth="1.6"
            />
          </svg>

          <p className="login-branding-tagline">
            Gestion administrative et financière du Dahira —
            membres, cotisations, événements et caisse réunis
            en un seul espace.
          </p>

        </div>

      </div>

      {/* =========================================
          FORMULAIRE
      ========================================= */}

      <div className="login-form-panel">

        <div className="login-card">

          {/* Logo compact, visible uniquement en mobile */}
          <div className="login-mobile-logo">
            <img src={logo} alt="Dahira Hisnoul Abraar" />
          </div>

          <h2 className="login-title">Bienvenue</h2>
          <p className="login-subtitle">
            Connectez-vous à votre espace
          </p>

          {error && (
            <div className="login-alert">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="login-field">
              <label>Adresse email</label>

              <div className="login-input-wrap">
                <i className="bi bi-envelope"></i>

                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field">
              <label>Mot de passe</label>

              <div className="login-input-wrap">
                <i className="bi bi-lock"></i>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  <i
                    className={`bi ${
                      showPassword ? 'bi-eye-slash' : 'bi-eye'
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Se connecter
                </>
              )}
            </button>

          </form>

          <div className="login-footer">
            Dahira Hisnoul Abraar
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;