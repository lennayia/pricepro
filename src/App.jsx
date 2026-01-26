import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/pricepro" element={<LandingPage />} />
              <Route path="/pricepro/prihlaseni" element={<LoginPage />} />
              <Route path="/pricepro/registrace" element={<RegisterPage />} />
            </Route>

            {/* Protected app routes */}
            <Route
              path="/pricepro/app"
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
            <Route path="/" element={<Navigate to="/pricepro" replace />} />
            <Route path="*" element={<Navigate to="/pricepro" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
