import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, ArrowRight, CheckCircle, User, Mail, Phone, Lock, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';
import { regions, districts } from '../data/mockData';

const steps = ['Cuenta', 'Ubicación', 'Ministerio'];

function FieldGroup({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function InputIcon({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
      <input className="input-base pl-10" {...props} />
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: 'multiplicador', region: '', district: '', congregation: '', cargo: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const districtOptions = districts.filter((d) => d.regionId === form.region);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login(form.role);
    toast.success('Bienvenido a la red. +100 XP de bienvenida');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F8] flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22,1,0.36,1] }}
        className="w-full max-w-md"
      >
        {/* Top bar */}
        <div className="flex items-center gap-2.5 mb-6">
          <button onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-white transition text-[#475569] hover:text-[#0F172A]">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg,#1A237E,#283593)' }}>
            <Globe size={16} className="text-[#D4AF37]" />
          </div>
          <span className="font-bold text-[#0F172A] text-sm">Somos Misión Colombia</span>
        </div>

        {/* Card */}
        <div className="card p-7 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#0F172A] mb-0.5">Únete a la red</h1>
            <p className="text-sm text-[#64748B]">
              Paso {step + 1} de {steps.length}
              <span className="mx-2 text-[#E2E8F0]">·</span>
              <span className="text-[#1A237E] font-semibold">{steps[step]}</span>
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-1.5 mb-7">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#E2E8F0]">
                <motion.div
                  className="h-full rounded-full bg-[#1A237E]"
                  initial={{ width: 0 }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            ))}
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Step 0 */}
              {step === 0 && (
                <>
                  <FieldGroup label="Nombre completo *">
                    <InputIcon icon={User} value={form.name} onChange={(e) => set('name', e.target.value)}
                      placeholder="Carlos Andrés Pérez" />
                  </FieldGroup>
                  <FieldGroup label="Correo electrónico *">
                    <InputIcon icon={Mail} type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                      placeholder="tu@correo.com" />
                  </FieldGroup>
                  <FieldGroup label="Teléfono">
                    <InputIcon icon={Phone} value={form.phone} onChange={(e) => set('phone', e.target.value)}
                      placeholder="+57 300 000 0000" />
                  </FieldGroup>
                  <FieldGroup label="Contraseña *">
                    <InputIcon icon={Lock} type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                      placeholder="Mín. 8 caracteres" />
                  </FieldGroup>
                </>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <>
                  <FieldGroup label="Rol en la red *">
                    <select className="input-base" value={form.role} onChange={(e) => set('role', e.target.value)}>
                      <option value="multiplicador">Multiplicador — Embajador Digital</option>
                      <option value="pastor">Pastor / Supervisor</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Región *">
                    <select className="input-base" value={form.region} onChange={(e) => { set('region', e.target.value); set('district', ''); }}>
                      <option value="">Seleccionar región...</option>
                      {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </FieldGroup>
                  <FieldGroup label="Distrito">
                    <select className="input-base" value={form.district} onChange={(e) => set('district', e.target.value)}
                      disabled={!form.region}>
                      <option value="">Seleccionar distrito...</option>
                      {districtOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </FieldGroup>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <FieldGroup label="Congregación">
                    <input className="input-base" value={form.congregation}
                      onChange={(e) => set('congregation', e.target.value)}
                      placeholder="Nombre de tu iglesia local" />
                  </FieldGroup>
                  <FieldGroup label="Cargo / Función">
                    <input className="input-base" value={form.cargo}
                      onChange={(e) => set('cargo', e.target.value)}
                      placeholder="Ej: Diácono, Líder de célula..." />
                  </FieldGroup>
                  {/* Bonus card */}
                  <div className="p-4 rounded-2xl border flex items-start gap-3"
                    style={{ background: 'rgba(212,175,55,0.06)', borderColor: 'rgba(212,175,55,0.25)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#FBF6E2]">
                      <Zap size={15} className="text-[#D4AF37]" fill="#D4AF37" />
                    </div>
                    <div>
                      <p className="text-[#8B6914] text-xs font-bold mb-0.5">Bono de bienvenida</p>
                      <p className="text-[#8B6914] text-xs leading-relaxed">
                        Al completar el registro recibirás <strong>+100 XP</strong> y la insignia <strong>"Primer Paso"</strong>.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#F0F2F8]">
            <button
              type="button"
              onClick={() => step > 0 ? setStep((s) => s - 1) : navigate('/login')}
              className="flex items-center gap-1.5 text-sm text-[#64748B] font-medium hover:text-[#0F172A] transition px-2"
            >
              <ArrowLeft size={14} /> Atrás
            </button>

            {step < steps.length - 1 ? (
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={() => setStep((s) => s + 1)}
                className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2">
                Continuar <ArrowRight size={14} />
              </motion.button>
            ) : (
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={handleSubmit} disabled={loading}
                className="btn-gold py-2.5 px-6 text-sm flex items-center gap-2">
                {loading
                  ? <span className="w-4 h-4 border-2 border-[#0D1257]/30 border-t-[#0D1257] rounded-full animate-spin" />
                  : <><CheckCircle size={14} /> Completar registro</>
                }
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-5">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} className="text-[#1A237E] font-semibold hover:underline">
            Iniciar sesión
          </button>
        </p>
      </motion.div>
    </div>
  );
}
