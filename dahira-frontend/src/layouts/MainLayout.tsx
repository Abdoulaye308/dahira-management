import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';

import './MainLayout.css';

const THEME_KEY = 'dahira-theme';

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(THEME_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.role === 'ADMIN';

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-container">
      {/* =========================
          SIDEBAR
      ========================== */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* LOGO */}
        <div className="sidebar-header">
          <div className="logo">
            <img
              src={logo}
              alt="Dahira Hisnoul Abraar"
              className="logo-img"
            />
          </div>

          <div>
            <h5>Dahira</h5>
            <small>Management</small>
          </div>
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          <p className="menu-title">
            {isAdmin ? 'Menu principal' : 'Mon espace'}
          </p>

          {/* =========================
              MENU ADMIN
          ========================== */}
          {isAdmin && (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-grid-1x2-fill"></i>
                <span>Tableau de bord</span>
              </NavLink>

              <NavLink
                to="/members"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-people-fill"></i>
                <span>Membres</span>
              </NavLink>

              <NavLink
                to="/contributions"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-wallet2"></i>
                <span>Cotisations</span>
              </NavLink>

              <NavLink
                to="/payments"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-cash-stack"></i>
                <span>Paiements</span>
              </NavLink>

              <NavLink
                to="/cash"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-safe2-fill"></i>
                <span>Caisse</span>
              </NavLink>

              <NavLink
                to="/events"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-calendar-event-fill"></i>
                <span>Événements</span>
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-person-gear"></i>
                <span>Utilisateurs</span>
              </NavLink>
            </>
          )}

          {/* =========================
              MENU MEMBER
          ========================== */}
          {!isAdmin && (
            <>
              <NavLink
                to="/member/dashboard"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-house-door-fill"></i>
                <span>Mon espace</span>
              </NavLink>

              <NavLink
                to="/member/profile"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-person-circle"></i>
                <span>Mon profil</span>
              </NavLink>

              <NavLink
                to="/member/contributions"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-wallet2"></i>
                <span>Mes cotisations</span>
              </NavLink>

              <NavLink
                to="/member/payments"
                className={({ isActive }) =>
                  `menu-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                <i className="bi bi-cash-stack"></i>
                <span>Mes paiements</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* =========================
            SIDEBAR FOOTER
        ========================== */}
        <div className="sidebar-footer">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="user-info">
            <strong>{user?.username || 'Utilisateur'}</strong>
            <small>{isAdmin ? 'Administrateur' : 'Membre'}</small>
          </div>

          <button
            className="logout-btn"
            title="Déconnexion"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      {/* =========================
          CONTENU PRINCIPAL
      ========================== */}
      <main className="main-content">
        {/* TOPBAR */}
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>

          <div className="topbar-title">
            <h6>Gestion du Dahira Hisnoul Abraar</h6>
            <span>{isAdmin ? 'Administration' : 'Espace membre'}</span>
          </div>

          <div className="topbar-actions">
            {/* NOTIFICATIONS */}
            <button className="icon-btn" title="Notifications">
              <i className="bi bi-bell"></i>
              <span className="notification-dot"></span>
            </button>

            {/* THÈME */}
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={
                theme === 'dark'
                  ? 'Passer en mode clair'
                  : 'Passer en mode sombre'
              }
            >
              <i
                className={`bi ${
                  theme === 'dark' ? 'bi-sun-fill' : 'bi-moon'
                }`}
              ></i>
            </button>
          </div>
        </header>

        {/* CONTENU DES PAGES */}
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;