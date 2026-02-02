import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ComplianceProvider } from './contexts/ComplianceContext';
import { EncryptionProvider } from './contexts/EncryptionContext';
import './App.css';

// ============================================================================
// Lazy Loaded Pages - Code Splitting
// ============================================================================
// Each page is loaded on-demand, reducing initial bundle size
// Vite automatically handles tree shaking to remove unused code

const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings').then(module => ({ default: module.SecuritySettings })));
const PrivacySettings = lazy(() => import('./pages/PrivacySettings').then(module => ({ default: module.PrivacySettings })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(module => ({ default: module.TermsOfService })));

// ============================================================================
// Loading States
// ============================================================================

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

function LoadingSpinner({ message = 'Loading...', fullScreen = true }: LoadingSpinnerProps) {
  const spinner = (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 relative">
        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      {spinner}
    </div>
  );
}

// ============================================================================
// Route-Specific Loading Wrappers
// ============================================================================

function AuthPageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading authentication..." fullScreen />}>
      {children}
    </Suspense>
  );
}

function DashboardPageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading dashboard..." fullScreen />}>
      {children}
    </Suspense>
  );
}

function SettingsPageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading settings..." fullScreen />}>
      {children}
    </Suspense>
  );
}

function LegalPageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading document..." fullScreen />}>
      {children}
    </Suspense>
  );
}

// ============================================================================
// Route Guards
// ============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// Route Preloader
// ============================================================================

function RoutePreloader() {
  const location = useLocation();

  useEffect(() => {
    // Preload likely next routes based on current location
    const preloadRoute = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
      importFn().catch(() => {
        // Silently fail - preloading is optional
      });
    };

    switch (location.pathname) {
      case '/login':
        preloadRoute(() => import('./pages/Register'));
        preloadRoute(() => import('./pages/Dashboard'));
        break;
      case '/dashboard':
        preloadRoute(() => import('./pages/SecuritySettings'));
        preloadRoute(() => import('./pages/PrivacySettings'));
        break;
      case '/settings/security':
        preloadRoute(() => import('./pages/PrivacySettings'));
        break;
    }
  }, [location.pathname]);

  return null;
}

// ============================================================================
// Route Configuration
// ============================================================================

function AppRoutes() {
  return (
    <>
      <RoutePreloader />
      <Routes>
        {/* Authentication Routes */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPageLoader>
                <Login />
              </AuthPageLoader>
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthPageLoader>
                <Register />
              </AuthPageLoader>
            </GuestRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPageLoader>
                <Dashboard />
              </DashboardPageLoader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/security"
          element={
            <ProtectedRoute>
              <SettingsPageLoader>
                <SecuritySettings />
              </SettingsPageLoader>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/privacy"
          element={
            <ProtectedRoute>
              <SettingsPageLoader>
                <PrivacySettings />
              </SettingsPageLoader>
            </ProtectedRoute>
          }
        />

        {/* Legal Routes (Public) */}
        <Route
          path="/privacy-policy"
          element={
            <LegalPageLoader>
              <PrivacyPolicy />
            </LegalPageLoader>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <LegalPageLoader>
              <TermsOfService />
            </LegalPageLoader>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

// ============================================================================
// Main App
// ============================================================================

function App() {
  return (
    <AuthProvider>
      <ComplianceProvider>
        <EncryptionProvider>
          <Router>
            <AppRoutes />
          </Router>
        </EncryptionProvider>
      </ComplianceProvider>
    </AuthProvider>
  );
}

export default App;
