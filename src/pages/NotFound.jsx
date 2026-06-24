import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home, LayoutDashboard, MapPinned, Search } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';
import { useAppStore } from '../store/useAppStore';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const safeHome = isAuthenticated ? '/dashboard' : '/';

  const goBackSafely = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(safeHome, { replace: true });
  };

  const quickLinks = isAuthenticated
    ? [
        { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard },
        { label: 'Contenido', path: '/hub', Icon: Search },
        { label: 'Misiones', path: '/missions', Icon: Compass },
      ]
    : [
        { label: 'Inicio', path: '/', Icon: Home },
        { label: 'Iniciar sesión', path: '/login', Icon: Compass },
        { label: 'Registrarme', path: '/register', Icon: Search },
      ];

  return (
    <main className="not-found-page">
      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="not-found-card"
      >
        <div className="not-found-brand-row">
          <div className="not-found-logo">
            <BrandLogo decorative />
          </div>
          <span>Misiones Nacionales</span>
        </div>

        <div className="not-found-visual" aria-hidden="true">
          <div className="not-found-map-orb">
            <MapPinned size={44} />
          </div>
          <strong>404</strong>
        </div>

        <div className="not-found-copy">
          <p className="not-found-kicker">Ruta no encontrada</p>
          <h1>Esta página se salió del mapa.</h1>
          <p>
            La dirección no existe, cambió o el navegador intentó abrir una ruta interna directamente.
            Ya dejamos un camino seguro para volver sin romper la experiencia.
          </p>
        </div>

        <div className="not-found-path">
          <span>URL actual</span>
          <code>{location.pathname}{location.search}</code>
        </div>

        <div className="not-found-actions">
          <button type="button" className="not-found-secondary" onClick={goBackSafely}>
            <ArrowLeft size={17} />
            Volver
          </button>
          <button type="button" className="not-found-primary" onClick={() => navigate(safeHome, { replace: true })}>
            {isAuthenticated ? <LayoutDashboard size={17} /> : <Home size={17} />}
            {isAuthenticated ? 'Ir al Dashboard' : 'Ir al inicio'}
          </button>
        </div>

        <nav className="not-found-links" aria-label="Rutas rápidas">
          {quickLinks.map(({ label, path, Icon }) => (
            <button key={path} type="button" onClick={() => navigate(path, { replace: true })}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
      </motion.section>
    </main>
  );
}
