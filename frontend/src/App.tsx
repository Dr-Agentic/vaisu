/**
 * App Component
 *
 * Main application entry point.
 * Integrates the new Vaisu UI Design System with core application logic.
 *
 * Flow: Dashboard -> Visualization
 * Plus: UI Sampler route for design system exploration
 */

import { useEffect, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { ThemeProvider } from './design-system/ThemeProvider';
import { ThemeSwitcher } from './components/UISampler/ThemeSwitcher';
import {
  StageVisualization,
  ToastContainer,
} from './features';
import UISamplerPage from './pages/UISamplerPage';
import { SimpleValidator } from './components/UISampler/SimpleValidator';
import { useDocumentStore } from './stores/documentStore';
import { useUserStore } from './stores/userStore';
import { UserMenu } from './components/UserMenu';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PricingPage from './pages/PricingPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const checkAuth = useUserStore((state) => state.checkAuth);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Public Only Route (redirects to home if logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * SplashOrchestrator
 *
 * Shows the welcome screen as a splash screen while loading vital dashboard data.
 * Redirects to dashboard once ready.
 */
const SplashOrchestrator = () => {
  const { fetchDocumentList, fetchDashboardStats } = useDocumentStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchDocumentList(), fetchDashboardStats()]);
      } catch (e) {
        console.error('Failed to preload data', e);
      }
      setIsLoaded(true);
    };
    loadData();
  }, [fetchDocumentList, fetchDashboardStats]);

  if (isLoaded) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">
      Initializing...
    </div>
  );
};

/**
 * App
 *
 * Main app component that manages navigation and authentication.
 */
export default function App() {
  const { toasts, removeToast }
    = useDocumentStore();

  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigate = useNavigate();

  const handleBackFromVisualization = () => {
    // Clear document and return to dashboard
    useDocumentStore.getState().clearDocument();
    navigate('/dashboard');
  };

  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-gray-900">
        {/* Floating Theme Switcher & User Menu */}
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-4">
          <ThemeSwitcher />
          <UserMenu />
        </div>

        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyEmailPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard - The new centralized UI */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <ProtectedRoute>
                <PricingPage />
              </ProtectedRoute>
            }
          />

          {/* Visualization Route - Replaces Legacy Stage Flow */}
          <Route
            path="/stages"
            element={
              <ProtectedRoute>
                <div className="stage-container h-screen relative overflow-hidden flex flex-col">
                  <ToastContainer toasts={toasts} onClose={removeToast} />
                  <StageVisualization onBack={handleBackFromVisualization} />
                </div>
              </ProtectedRoute>
            }
          />

          {/* UI Sampler routes */}
          <Route path="/ui-sampler" element={<UISamplerPage />} />
          <Route path="/theme/sampler" element={<SimpleValidator />} />

          {/* Root redirect for logged in users to Dashboard via Splash */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SplashOrchestrator />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to main app */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
