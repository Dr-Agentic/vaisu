
/**
 * App Component
 *
 * Main application entry point using Stage-based architecture.
 * Integrates the new Vaisu UI Design System with core application logic.
 *
 * Flow: Welcome → Input → Analysis → Visualization
 * Plus: UI Sampler route for design system exploration
 */

import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { StageContainer, Stage } from './components/patterns';
import { ThemeProvider } from './design-system/ThemeProvider';
import { ThemeSwitcher } from './components/UISampler/ThemeSwitcher';
import {
  StageWelcome,
  StageInput,
  StageAnalysis,
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
        await Promise.all([
          fetchDocumentList(),
          fetchDashboardStats()
        ]);
      } catch (e) {
        console.error("Failed to preload data", e);
      }
      // Guarantee minimum visibility for splash screen
      setTimeout(() => setIsLoaded(true), 2000);
    };
    loadData();
  }, [fetchDocumentList, fetchDashboardStats]);

  if (isLoaded) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen w-full">
      <StageWelcome
        onGetStarted={() => { }}
        subtitle="Initializing your intelligent workspace..."
        buttonText="Syncing Data..."
      />
    </div>
  );
};


/**
 * App
 *
 * Main app component that manages stage transitions and integrates all stage components.
 */
export default function App() {
  const {
    currentStage,
    setStage,
    document,
    isAnalyzing,
    toasts,
    removeToast,
  } = useDocumentStore();

  const checkAuth = useUserStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigate = useNavigate();
  const location = useLocation();

  // Auto-transition to analysis stage when document is uploaded and analysis starts
  useEffect(() => {
    if (document && isAnalyzing && (currentStage === 'input' || currentStage === 'welcome')) {
      setStage('analysis');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Auto-transition to visualization stage when analysis completes
  useEffect(() => {
    if (document && !isAnalyzing && (currentStage === 'analysis' || currentStage === 'input' || currentStage === 'welcome')) {
      setStage('visualization');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Handle URL redirection when starting from Dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard' && document) {
      if (currentStage === 'analysis' || currentStage === 'visualization' || isAnalyzing) {
        navigate('/stages');
      }
    }
  }, [location.pathname, document, currentStage, isAnalyzing, navigate]);

  // Stage transition handlers
  const handleGetStarted = () => {
    setStage('input');
  };

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
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Dashboard - The new centralized UI */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Legacy Stage Flow - Kept for specific workflows if needed, but redirected by default */}
          <Route path="/stages" element={
            <ProtectedRoute>
              <StageContainer currentStage={currentStage}>
                <ToastContainer toasts={toasts} onClose={removeToast} />
                <Stage active={currentStage === 'welcome'}>
                  <StageWelcome onGetStarted={handleGetStarted} />
                </Stage>
                <Stage active={currentStage === 'input'}>
                  <StageInput />
                </Stage>
                <Stage active={currentStage === 'analysis'}>
                  <StageAnalysis />
                </Stage>
                <Stage active={currentStage === 'visualization'}>
                  <StageVisualization onBack={handleBackFromVisualization} />
                </Stage>
              </StageContainer>
            </ProtectedRoute>
          } />

          {/* UI Sampler routes */}
          <Route path="/ui-sampler" element={<UISamplerPage />} />
          <Route path="/theme/sampler" element={<SimpleValidator />} />

          {/* Root redirect for logged in users to Dashboard via Splash */}
          <Route path="/" element={
            <ProtectedRoute>
              <SplashOrchestrator />
            </ProtectedRoute>
          } />

          {/* Redirect unknown routes to main app */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}
