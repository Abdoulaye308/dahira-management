import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: ('ADMIN' | 'MEMBER')[];
}

function RoleProtectedRoute({
  allowedRoles,
}: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Chargement...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === 'ADMIN'
            ? '/dashboard'
            : '/member/dashboard'
        }
        replace
      />
    );
  }

  return <Outlet />;
}

export default RoleProtectedRoute;