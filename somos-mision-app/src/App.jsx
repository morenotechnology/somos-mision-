import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';

// Layout (not lazy — always needed)
import AppLayout from './components/layout/AppLayout';

// Pages — lazy loaded for code splitting
const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/Login'));
const Register       = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Hub            = lazy(() => import('./pages/Hub'));
const Ranking        = lazy(() => import('./pages/Ranking'));
const Missions       = lazy(() => import('./pages/Missions'));
const Profile        = lazy(() => import('./pages/Profile'));
const Admin          = lazy(() => import('./pages/Admin'));
const NotFound       = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#1A237E] border-t-[#D4AF37] rounded-full animate-spin" />
        <p className="text-[#475569] text-sm font-medium">Cargando...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F172A',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          },
          success: { iconTheme: { primary: '#D4AF37', secondary: '#0F172A' } },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/forgot-password"element={<ForgotPassword />} />

          {/* Protected */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hub"       element={<Hub />} />
            <Route path="/ranking"   element={<Ranking />} />
            <Route path="/missions"  element={<Missions />} />
            <Route path="/profile"   element={<Profile />} />
            <Route path="/admin"     element={<Admin />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
