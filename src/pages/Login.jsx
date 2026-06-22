import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import BrandLogo from '../components/common/BrandLogo';
import { useAppStore } from '../store/useAppStore';

const roleHints = [
  { label: 'Multiplicador', desc: 'Lee contenido oficial y comparte avance.', Icon: Users },
  { label: 'Pastor/Directivo', desc: 'Publica contenido y revisa métricas.', Icon: ShieldCheck },
  { label: 'Misiones Nacionales', desc: 'Una señal nacional para coordinar misión.', brand: true },
];

function AuthBrandPanel() {
  return (
    <aside className="auth-brand-panel">
      <img src="/hero-map.png" alt="" aria-hidden="true" className="auth-brand-map" />
      <div className="auth-brand-overlay" />

      <div className="auth-brand-content">
        <button type="button" className="auth-brand-lockup" aria-label="Misiones Nacionales">
          <span>
            <BrandLogo decorative />
          </span>
          <strong>Misiones Nacionales</strong>
        </button>

        <div className="auth-brand-copy">
          <p>Acceso seguro</p>
          <h2>Entra con tu cuenta de multiplicador o de pastor/directivo.</h2>
          <span>
            Accede a tu panel, contenido oficial, ranking y avance nacional desde un solo lugar.
          </span>
        </div>

        <div className="auth-brand-stats">
          {roleHints.map(({ label, desc, Icon, brand }) => (
            <div key={label}>
              <strong className="flex items-center gap-2">
                {brand ? <span className="auth-stat-logo"><BrandLogo decorative /></span> : <Icon size={15} />}
                {label}
              </strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AuthInput({ icon: Icon, right, ...props }) {
  return (
    <div className="auth-input-wrap">
      <Icon size={17} />
      <input className="auth-input" {...props} />
      {right}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { loginFromApi } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailHint = useMemo(() => {
    if (!email) return 'Ingresa el correo con el que te registraste.';
    return `Accederás con ${email}.`;
  }, [email]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completa correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const result = await api.auth.login({ email, password });
      loginFromApi(result);
      toast.success('Bienvenido de vuelta');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <AuthBrandPanel />

      <section className="auth-form-panel">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="auth-card"
        >
          <button type="button" onClick={() => navigate('/')} className="auth-back-button">
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          <div className="auth-mobile-brand">
            <span>
              <BrandLogo decorative />
            </span>
            <strong>Misiones Nacionales</strong>
          </div>

          <div className="auth-card-header">
            <p className="auth-eyebrow">Acceso real</p>
            <h1>Iniciar sesión</h1>
            <p>Usa tu correo y contraseña para entrar con tu cuenta de multiplicador o de pastor/directivo.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <label className="auth-field">
              <span>Correo electrónico</span>
              <AuthInput
                icon={Mail}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                aria-label="Correo electrónico"
              />
            </label>

            <label className="auth-field">
              <span>Contraseña</span>
              <AuthInput
                icon={Lock}
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                aria-label="Contraseña"
                right={(
                  <button
                    type="button"
                    onClick={() => setShowPass((value) => !value)}
                    className="auth-input-action"
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                )}
              />
            </label>

            <div className="auth-form-meta">
              <span>{emailHint}</span>
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>

            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} type="submit" disabled={loading} className="auth-submit-button">
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <Zap size={17} fill="currentColor" />
                  Entrar a la plataforma
                </>
              )}
            </motion.button>
          </form>

          <p className="auth-switch">
            ¿No tienes cuenta?
            <button type="button" onClick={() => navigate('/register')}>Regístrate gratis</button>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
