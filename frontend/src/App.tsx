
/**
 * App Component
 *
 * Main application entry point using Stage-based architecture.
 * Integrates the new Electron UI Design System with core application logic.
 *
 * Flow: Welcome → Input → Analysis → Visualization
 * Plus: UI Sampler route for design system exploration
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

  // Auto-transition to analysis stage when document is uploaded and analysis starts
  useEffect(() => {
    if (document && isAnalyzing && currentStage === 'input') {
      setStage('analysis');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Auto-transition to visualization stage when analysis completes
  useEffect(() => {
    if (document && !isAnalyzing && currentStage === 'analysis') {
      setStage('visualization');
    }
  }, [document, isAnalyzing, currentStage, setStage]);

  // Stage transition handlers
  const handleGetStarted = () => {
    setStage('input');
  };

  const handleBackFromVisualization = () => {
    // Clear document and return to welcome
    useDocumentStore.getState().clearDocument();
    setStage('welcome');
  };

  return (
    <Router>
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

            {/* Main application routes (Protected) */}
            <Route path="/" element={
              <ProtectedRoute>
                <StageContainer currentStage={currentStage}>
                  {/* Toast Notifications */}
                  <ToastContainer toasts={toasts} onClose={removeToast} />

                  {/* Welcome Stage */}
                  <Stage active={currentStage === 'welcome'}>
                    <StageWelcome onGetStarted={handleGetStarted} />
                  </Stage>

                  {/* Input Stage */}
                  <Stage active={currentStage === 'input'}>
                    <StageInput />
                  </Stage>

                  {/* Analysis Stage */}
                  <Stage active={currentStage === 'analysis'}>
                    <StageAnalysis />
                  </Stage>

                  {/* Visualization Stage */}
                  <Stage active={currentStage === 'visualization'}>
                    <StageVisualization onBack={handleBackFromVisualization} />
                  </Stage>
                </StageContainer>
              </ProtectedRoute>
            } />

            {/* UI Sampler routes */}
            <Route path="/ui-sampler" element={<UISamplerPage />} />
            <Route path="/theme/sampler" element={<SimpleValidator />} />

            {/* Redirect unknown routes to main app */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </Router>
  );
}
