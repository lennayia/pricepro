import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { WeekProvider } from './contexts/WeekContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RootRedirect from './components/common/RootRedirect';
import { ScrollToTop } from './components/layout/ScrollToTop';

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
import CategorySettingsPage from './pages/app/settings/CategorySettingsPage';
import ProjectsSettingsPage from './pages/app/settings/ProjectsSettingsPage';
import ClientsSettingsPage from './pages/app/settings/ClientsSettingsPage';
import ThemesSettingsPage from './pages/app/settings/ThemesSettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WeekProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />

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

              {/* Settings routes */}
              <Route path="nastaveni/kategorie" element={<CategorySettingsPage />} />
              <Route path="nastaveni/projekty" element={<ProjectsSettingsPage />} />
              <Route path="nastaveni/klienti" element={<ClientsSettingsPage />} />
              <Route path="nastaveni/temata" element={<ThemesSettingsPage />} />

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
        </WeekProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
