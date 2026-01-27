import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Root Redirect Component
 * Redirects based on authentication status:
 * - Authenticated users → /app (dashboard)
 * - Unauthenticated users → /registrace
 */

const RootRedirect = () => {
  const { user } = useAuth();

  // Redirect authenticated users to app, others to registration
  return <Navigate to={user ? '/app' : '/registrace'} replace />;
};

export default RootRedirect;
