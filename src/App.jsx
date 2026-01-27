import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RootRedirect from './components/common/RootRedirect';

// Public Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// App Pages
import DashboardPage from './pages/app/DashboardPage';
import TrackerPage from './pages/app/tracker/TrackerPage';
import TrackerDayPage from './pages/app/tracker/TrackerDayPage';
import TrackerResultsPage from './pages/app/tracker/TrackerResultsPage';
import CalculatorPage from './pages/app/calculator/CalculatorPage';
import CalculatorResultsPage from './pages/app/calculator/CalculatorResultsPage';
import HistoryPage from './pages/app/HistoryPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/prihlaseni" element={<LoginPage />} />
              <Route path="/registrace" element={<RegisterPage />} />
            </Route>

            {/* Protected app routes */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />

              {/* Tracker routes */}
              <Route path="tracker" element={<TrackerPage />} />
              <Route path="tracker/den/:dayNumber" element={<TrackerDayPage />} />
              <Route path="tracker/vysledky" element={<TrackerResultsPage />} />

              {/* Calculator routes */}
              <Route path="kalkulacka" element={<CalculatorPage />} />
              <Route path="kalkulacka/vysledky" element={<CalculatorResultsPage />} />

              {/* History */}
              <Route path="historie" element={<HistoryPage />} />
            </Route>

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
