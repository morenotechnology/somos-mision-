import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { api } from './api';
import { useAppStore } from './store/useAppStore';
import AppLayout from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Hub = lazy(() => import('./pages/Hub'));
const Ranking = lazy(() => import('./pages/Ranking'));
const Missions = lazy(() => import('./pages/Missions'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

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

function AuthBootstrap() {
  const bootstrapAuth = useAppStore((state) => state.bootstrapAuth);
  const loginFromApi = useAppStore((state) => state.loginFromApi);
  const setAuthReady = useAppStore((state) => state.setAuthReady);

  useEffect(() => {
    bootstrapAuth();
    const subscription = api.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        loginFromApi({ user: null, session: null, sharedContentIds: [], completedMissionIds: [] });
        setAuthReady(true);
        return;
      }
      try {
        const payload = await api.auth.getSession();
        if (payload?.user) loginFromApi(payload);
      } finally {
        setAuthReady(true);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, [bootstrapAuth, loginFromApi, setAuthReady]);

  return null;
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const authReady = useAppStore((state) => state.authReady);

  if (!authReady) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function SuperAdminRoute({ children }) {
  const currentUser = useAppStore((state) => state.currentUser);
  return currentUser?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap />
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
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/inicio" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ingresar" element={<Navigate to="/login" replace />} />
          <Route path="/signin" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro" element={<Navigate to="/register" replace />} />
          <Route path="/crear-cuenta" element={<Navigate to="/register" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/recuperar" element={<Navigate to="/forgot-password" replace />} />
          <Route path="/auth/callback" element={<Login />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/inicio-app" element={<Navigate to="/dashboard" replace />} />
            <Route path="/hub" element={<Hub />} />
            <Route path="/hub/*" element={<Navigate to="/hub" replace />} />
            <Route path="/contenido" element={<Navigate to="/hub" replace />} />
            <Route path="/contenidos" element={<Navigate to="/hub" replace />} />
            <Route path="/publicaciones" element={<Navigate to="/hub" replace />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/ranking/*" element={<Navigate to="/ranking" replace />} />
            <Route path="/hall" element={<Navigate to="/ranking" replace />} />
            <Route path="/hall-de-honor" element={<Navigate to="/ranking" replace />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/missions/*" element={<Navigate to="/missions" replace />} />
            <Route path="/misiones" element={<Navigate to="/missions" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/*" element={<Navigate to="/profile" replace />} />
            <Route path="/perfil" element={<Navigate to="/profile" replace />} />
            <Route path="/admin" element={<SuperAdminRoute><Admin /></SuperAdminRoute>} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
