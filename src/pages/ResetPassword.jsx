import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api';
import BrandLogo from '../components/common/BrandLogo';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(Boolean(api.auth.getSession));
  const [hasSession, setHasSession] = useState(!api.auth.getSession);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (!api.auth.getSession) return undefined;
    let active = true;
    api.auth.getSession()
      .then((payload) => active && setHasSession(Boolean(payload?.session || payload?.user)))
      .catch(() => active && setHasSession(false))
      .finally(() => active && setChecking(false));
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await api.auth.updatePassword(password);
      setUpdated(true);
      toast.success('Contraseña actualizada');
    } catch (error) {
      toast.error(error.message || 'El enlace expiró. Solicita uno nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <aside className="auth-brand-panel">
        <img src="/hero-map.png" alt="" aria-hidden="true" className="auth-brand-map" />
        <div className="auth-brand-overlay" />
        <div className="auth-brand-content">
          <div className="auth-brand-lockup" aria-label="Misiones Nacionales">
            <span><BrandLogo decorative /></span>
            <strong>Misiones Nacionales</strong>
          </div>
          <div className="auth-brand-copy">
            <p>Cuenta protegida</p>
            <h2>Recupera tu acceso y vuelve a la misión.</h2>
            <span>El enlace es temporal y solo puede usarse para crear una nueva contraseña.</span>
          </div>
        </div>
      </aside>

      <section className="auth-form-panel">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
          <button type="button" onClick={() => navigate('/login')} className="auth-back-button">
            <ArrowLeft size={16} /> Volver al inicio de sesión
          </button>

          {updated ? (
            <div className="auth-success-state">
              <div className="auth-success-icon"><CheckCircle2 size={30} /></div>
              <p className="auth-eyebrow">Todo listo</p>
              <h1>Contraseña actualizada</h1>
              <p>Ya puedes entrar a tu cuenta con tu nueva contraseña.</p>
              <button type="button" className="auth-submit-button" onClick={() => navigate('/login')}>Entrar a la plataforma</button>
            </div>
          ) : checking ? (
            <div className="auth-loading-state"><span className="auth-spinner" /><p>Validando enlace seguro...</p></div>
          ) : !hasSession ? (
            <div className="auth-success-state">
              <div className="auth-success-icon is-warning"><ShieldCheck size={30} /></div>
              <p className="auth-eyebrow">Enlace no disponible</p>
              <h1>Solicita un nuevo enlace</h1>
              <p>Este enlace pudo haber vencido o ya fue utilizado.</p>
              <button type="button" className="auth-submit-button" onClick={() => navigate('/forgot-password')}>Recuperar contraseña</button>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <p className="auth-eyebrow">Acceso seguro</p>
                <h1>Crea una nueva contraseña</h1>
                <p>Usa al menos 8 caracteres. Te recomendamos combinar letras, números y símbolos.</p>
              </div>
              <form onSubmit={handleSubmit} className="auth-form">
                <label className="auth-field">
                  <span>Nueva contraseña</span>
                  <div className="auth-input-wrap">
                    <Lock size={17} />
                    <input className="auth-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" placeholder="Tu nueva contraseña" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="auth-input-action" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
                <label className="auth-field">
                  <span>Confirmar contraseña</span>
                  <div className="auth-input-wrap">
                    <Lock size={17} />
                    <input className="auth-input" type={showPassword ? 'text' : 'password'} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repite la contraseña" />
                  </div>
                </label>
                <button type="submit" disabled={loading} className="auth-submit-button">
                  {loading ? <span className="auth-spinner" /> : <><ShieldCheck size={17} /> Guardar nueva contraseña</>}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </section>
    </main>
  );
}
