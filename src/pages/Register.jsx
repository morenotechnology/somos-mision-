import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  KeyRound,
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASTOR_ACCESS_KEY = 'IPUC2026MISION';
const PUBLISHER_ACCESS_KEY = 'ADMIN2026MISION';

function getPastorAccessLevel(accessKey = '') {
  const key = accessKey.trim();
  if (key === PUBLISHER_ACCESS_KEY) return 'publisher';
  if (key === PASTOR_ACCESS_KEY) return 'pastor';
  return null;
}

function RegisterBrandPanel() {
  return (
    <aside className="auth-brand-panel auth-brand-panel-register">
      <img src="/hero-map.png" alt="" aria-hidden="true" className="auth-brand-map" />
      <div className="auth-brand-overlay" />
      <div className="auth-brand-content">
        <button type="button" className="auth-brand-lockup" aria-label="Misiones Nacionales">
          <span><BrandLogo decorative /></span>
          <strong>Misiones Nacionales</strong>
        </button>
        <div className="auth-brand-copy">
          <p>Registro nacional</p>
          <h2>Crea tu cuenta y activa tu perfil de multiplicador.</h2>
          <span>Completa tus datos para unirte a la red y comenzar a participar desde tu iglesia local.</span>
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
    accessKey: '',
    region: '',
    district: '',
    congregation: '',
  });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validateStep = (stepToValidate = step) => {
    if (stepToValidate === 0 && (!form.name || !form.email || !form.phone || !form.password)) {
      toast.error('Completa todos los datos de la cuenta');
      return false;
    }
    if (stepToValidate === 0 && !EMAIL_PATTERN.test(form.email.trim())) {
      toast.error('Ingresa un correo válido');
      return false;
    }
    if (stepToValidate === 0 && form.password.length < 8) {
      toast.error('La contraseña debe tener mínimo 8 caracteres');
      return false;
    }
    if (stepToValidate === 1 && (!form.role || !form.region || !form.district)) {
      toast.error('Selecciona rol, región y distrito');
      return false;
    }
    if (stepToValidate === 1 && form.role === 'pastor' && !form.accessKey.trim()) {
      toast.error('Ingresa la llave de acceso para Pastor/Directivo');
      return false;
    }
    if (stepToValidate === 1 && form.role === 'pastor' && !getPastorAccessLevel(form.accessKey)) {
      toast.error('La llave de acceso no es válida. Verifica con tu líder o equipo nacional.');
      return false;
    }
    if (stepToValidate === 2 && !form.congregation) {
      toast.error('Escribe el nombre de tu congregación');
      return false;
    }
    return true;
  };

  const validateRegistration = () => {
    for (const stepIndex of [0, 1, 2]) {
      if (!validateStep(stepIndex)) {
        setStep(stepIndex);
        return false;
      }
    }
    return true;
  };

  const finishRegistration = () => {
    if (!betaModal) return;
    setBetaModal(null);
    navigate(betaModal.needsEmailConfirmation ? '/login' : '/dashboard');
  };

  const handleSubmit = async () => {
    if (!validateRegistration()) return;
    setLoading(true);
    try {
      const finalCongregation = form.congregation.trim();
      const result = await api.auth.register({
        ...form,
        congregation: finalCongregation,
        congregationId: null,
        canPublish: form.role === 'pastor' && getPastorAccessLevel(form.accessKey) === 'publisher',
      });
      if (!result.needsEmailConfirmation) loginFromApi(result);
      setBetaModal({
        needsEmailConfirmation: Boolean(result.needsEmailConfirmation),
        email: form.email.trim(),
        betaPosition: result.betaPosition || 1,
        betaTotal: result.betaTotal || 500,
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
            <strong>Misiones Nacionales</strong>
          </div>

          <div className="auth-card-header">
            <p className="auth-eyebrow">Nuevo perfil</p>
            <h1>Únete a la red</h1>
            <p>Completa tu información para crear tu cuenta de multiplicador o pastor/directivo.</p>
          </div>

          <div className="auth-stepper">
            {steps.map((item, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (index <= step) setStep(index);
                  }}
                  disabled={index > step}
                  className={`${active ? 'is-active' : ''} ${done ? 'is-done' : ''}`}
                >
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
                    <AuthInput as="select" icon={ShieldCheck} value={form.role} onChange={(event) => {
                      set('role', event.target.value);
                      if (event.target.value !== 'pastor') set('accessKey', '');
                    }}>
                      <option value="multiplicador">Multiplicador digital</option>
                      <option value="pastor">PASTOR/DIRECTIVO</option>
                    </AuthInput>
                  </FieldGroup>
                  {form.role === 'pastor' && (
                    <FieldGroup label="Llave de acceso Pastor/Directivo">
                      <AuthInput
                        icon={KeyRound}
                        type="password"
                        value={form.accessKey}
                        onChange={(event) => set('accessKey', event.target.value)}
                        placeholder="Ingresa tu llave de acceso"
                        autoComplete="off"
                      />
                      <small className="auth-key-hint">Esta llave confirma tu rol. Algunas llaves habilitan creación de publicaciones oficiales; no compartas este acceso.</small>
                    </FieldGroup>
                  )}
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
                  <div className="auth-congregation-new-note">
                    <Building2 size={17} />
                    <span>Registraremos esta congregación como nueva, asociada a la región y distrito seleccionados.</span>
                  </div>
                  <div className="auth-bonus-card">
                    <span><Zap size={17} fill="currentColor" /></span>
                    <div>
                      <strong>Acceso Beta</strong>
                      <p>Tu cuenta quedará lista para entrar a la beta privada de Misiones Nacionales y empezar a compartir contenido oficial.</p>
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
                className="auth-beta-modal-shell"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 18, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={`auth-beta-modal ${betaModal.needsEmailConfirmation ? 'is-email-confirm' : ''}`}>
                  <div className="auth-beta-pill">{betaModal.needsEmailConfirmation ? 'Verificación pendiente' : 'Beta cerrada'}</div>
                  <div className="auth-beta-badge">
                    {betaModal.needsEmailConfirmation ? <Mail size={26} /> : <CheckCircle size={26} />}
                  </div>
                  <p className="auth-beta-kicker">{betaModal.needsEmailConfirmation ? 'Confirma tu correo' : 'Registro confirmado'}</p>
                  {betaModal.needsEmailConfirmation ? (
                    <>
                      <h3>Revisa tu correo para activar la cuenta</h3>
                      <p>Ya reservamos tu lugar en la beta. Para entrar a la plataforma, abre el enlace de confirmación que enviamos a este correo:</p>
                      <div className="auth-email-callout">
                        <Mail size={16} />
                        {betaModal.email}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3>Eres el registro número {betaModal.betaPosition} de {betaModal.betaTotal}</h3>
                      <p>Tu lugar ya quedó reservado en la beta. Tu perfil está listo para entrar y empezar a usar la plataforma.</p>
                      <div className="auth-beta-progress" aria-hidden="true">
                        <span style={{ width: `${Math.min((betaModal.betaPosition / betaModal.betaTotal) * 100, 100)}%` }} />
                      </div>
                      <div className="auth-beta-meta">
                        <span><Zap size={14} /> Cupos limitados</span>
                        <span><CheckCircle size={14} /> Acceso anticipado</span>
                      </div>
                    </>
                  )}
                  <button type="button" className="auth-submit-button auth-beta-cta" onClick={finishRegistration}>
                    {betaModal.needsEmailConfirmation ? 'Volver al inicio de sesión' : 'Entrar al panel'}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
