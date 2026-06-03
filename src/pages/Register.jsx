import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  CircleAlert,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import BrandLogo from '../components/common/BrandLogo';
import { useAppStore } from '../store/useAppStore';

const steps = [
  { label: 'Cuenta', desc: 'Datos de acceso' },
  { label: 'Ubicación', desc: 'Región y distrito' },
  { label: 'Congregación', desc: 'Tu iglesia local' },
];

const REGIONS = [
  { id: 'r1', name: 'Andina' },
  { id: 'r2', name: 'Caribe' },
  { id: 'r3', name: 'Pacífica' },
  { id: 'r4', name: 'Orinoquía' },
  { id: 'r5', name: 'Amazonía' },
];

const DISTRICTS = Array.from({ length: 35 }, (_, index) => ({
  id: `d${index + 1}`,
  name: `Distrito ${index + 1}`,
}));

function RegisterBrandPanel() {
  return (
    <aside className="auth-brand-panel auth-brand-panel-register">
      <img src="/hero-map.png" alt="" aria-hidden="true" className="auth-brand-map" />
      <div className="auth-brand-overlay" />
      <div className="auth-brand-content">
        <button type="button" className="auth-brand-lockup" aria-label="Somos Misión Colombia">
          <span><BrandLogo decorative /></span>
          <strong>Somos Misión Colombia</strong>
        </button>
        <div className="auth-brand-copy">
          <p>Registro conectado</p>
          <h2>Crea tu cuenta real y activa tu perfil misionero.</h2>
          <span>El registro crea tu usuario en Supabase Auth y tu perfil extendido en la base de datos.</span>
        </div>
      </div>
    </aside>
  );
}

function AuthInput({ icon: Icon, as = 'input', children, ...props }) {
  const Control = as;
  return (
    <div className="auth-input-wrap">
      <Icon size={17} />
      <Control className="auth-input" {...props}>{children}</Control>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { loginFromApi } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [betaModal, setBetaModal] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'multiplicador',
    region: '',
    district: '',
    congregation: '',
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validateStep = () => {
    if (step === 0 && (!form.name || !form.email || !form.phone || !form.password)) {
      toast.error('Completa todos los datos de la cuenta');
      return false;
    }
    if (step === 1 && (!form.role || !form.region || !form.district)) {
      toast.error('Selecciona rol, región y distrito');
      return false;
    }
    if (step === 2 && !form.congregation) {
      toast.error('Escribe el nombre de tu congregación');
      return false;
    }
    return true;
  };

  const finishRegistration = () => {
    if (!betaModal) return;
    const target = betaModal.needsEmailConfirmation ? '/login' : '/dashboard';
    setBetaModal(null);
    navigate(target);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const result = await api.auth.register(form);
      if (!result.needsEmailConfirmation) {
        loginFromApi(result);
      }
      setBetaModal({
        betaPosition: result.betaPosition || 1,
        betaTotal: result.betaTotal || 500,
        needsEmailConfirmation: Boolean(result.needsEmailConfirmation),
      });
    } catch (error) {
      toast.error(error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <RegisterBrandPanel />
      <section className="auth-form-panel">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }} className="auth-card auth-card-register">
          <button type="button" onClick={() => navigate('/')} className="auth-back-button">
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          <div className="auth-mobile-brand">
            <span><BrandLogo decorative /></span>
            <strong>Somos Misión Colombia</strong>
          </div>

          <div className="auth-card-header">
            <p className="auth-eyebrow">Nuevo perfil</p>
            <h1>Únete a la red</h1>
            <p>Completa tu información para crear una cuenta conectada con Supabase.</p>
          </div>

          <div className="auth-stepper">
            {steps.map((item, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <button key={item.label} type="button" onClick={() => setStep(index)} className={`${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}>
                  <span>{done ? <CheckCircle size={15} /> : index + 1}</span>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.24 }} className="auth-form">
              {step === 0 && (
                <>
                  <FieldGroup label="Nombre completo">
                    <AuthInput icon={User} value={form.name} onChange={(event) => set('name', event.target.value)} placeholder="Carlos Andres Perez" />
                  </FieldGroup>
                  <FieldGroup label="Correo electrónico">
                    <AuthInput icon={Mail} type="email" value={form.email} onChange={(event) => set('email', event.target.value)} placeholder="tu@correo.com" />
                  </FieldGroup>
                  <FieldGroup label="Teléfono / WhatsApp">
                    <AuthInput icon={Phone} value={form.phone} onChange={(event) => set('phone', event.target.value)} placeholder="+57 300 000 0000" />
                  </FieldGroup>
                  <FieldGroup label="Contraseña">
                    <AuthInput icon={Lock} type="password" value={form.password} onChange={(event) => set('password', event.target.value)} placeholder="Minimo 8 caracteres" />
                  </FieldGroup>
                </>
              )}

              {step === 1 && (
                <>
                  <FieldGroup label="Rol en la red">
                    <AuthInput as="select" icon={ShieldCheck} value={form.role} onChange={(event) => set('role', event.target.value)}>
                      <option value="multiplicador">Multiplicador - Embajador digital</option>
                      <option value="pastor">Pastor / Supervisor territorial</option>
                    </AuthInput>
                  </FieldGroup>
                  <FieldGroup label="Región">
                    <AuthInput as="select" icon={MapPin} value={form.region} onChange={(event) => set('region', event.target.value)}>
                      <option value="">Seleccionar región</option>
                      {REGIONS.map((region) => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </AuthInput>
                  </FieldGroup>
                  <FieldGroup label="Distrito">
                    <AuthInput as="select" icon={Building2} value={form.district} onChange={(event) => set('district', event.target.value)}>
                      <option value="">Seleccionar distrito</option>
                      {DISTRICTS.map((district) => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </AuthInput>
                  </FieldGroup>
                </>
              )}

              {step === 2 && (
                <>
                  <FieldGroup label="Nombre de tu congregación">
                    <AuthInput icon={Building2} value={form.congregation} onChange={(event) => set('congregation', event.target.value)} placeholder="Nombre de tu iglesia local" />
                  </FieldGroup>
                  <div className="auth-bonus-card">
                    <span><Zap size={17} fill="currentColor" /></span>
                    <div>
                      <strong>Acceso Beta</strong>
                      <p>Tu cuenta quedará lista para entrar a la beta privada de Somos Misión y empezar a compartir contenido oficial.</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="auth-register-actions">
            <button type="button" onClick={() => (step > 0 ? setStep((value) => value - 1) : navigate('/login'))} className="auth-light-button">
              <ArrowLeft size={16} />
              Atrás
            </button>

            {step < steps.length - 1 ? (
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} type="button" onClick={() => validateStep() && setStep((value) => value + 1)} className="auth-submit-button is-compact">
                Continuar
                <ArrowRight size={17} />
              </motion.button>
            ) : (
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }} type="button" onClick={handleSubmit} disabled={loading} className="auth-submit-button is-compact is-gold">
                {loading ? <span className="auth-spinner is-dark" /> : <><CheckCircle size={17} /> Completar registro</>}
              </motion.button>
            )}
          </div>

          <p className="auth-switch">
            ¿Ya tienes cuenta?
            <button type="button" onClick={() => navigate('/login')}>Iniciar sesión</button>
          </p>
        </motion.div>

        <AnimatePresence>
          {betaModal && (
            <>
              <motion.div
                className="auth-beta-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="auth-beta-modal"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="auth-beta-pill">Beta cerrada</div>
                <div className="auth-beta-badge">
                  <CheckCircle size={26} />
                </div>
                <p className="auth-beta-kicker">Registro confirmado</p>
                <h3>Eres el registro número {betaModal.betaPosition} de {betaModal.betaTotal}</h3>
                <p>
                  {betaModal.needsEmailConfirmation
                    ? 'Tu lugar quedó reservado. Confirma tu correo para activar el acceso y entrar a la plataforma.'
                    : 'Tu lugar ya quedó reservado en la beta. Tu perfil está listo para entrar y empezar a usar la plataforma.'}
                </p>
                <div className="auth-beta-progress" aria-hidden="true">
                  <span style={{ width: `${Math.min((betaModal.betaPosition / betaModal.betaTotal) * 100, 100)}%` }} />
                </div>
                <div className="auth-beta-meta">
                  <span><Zap size={14} /> Cupos limitados</span>
                  <span><CircleAlert size={14} /> Acceso anticipado</span>
                </div>
                <button type="button" className="auth-submit-button auth-beta-cta" onClick={finishRegistration}>
                  {betaModal.needsEmailConfirmation ? 'Ir al login' : 'Entrar al panel'}
                  <ArrowRight size={17} />
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
