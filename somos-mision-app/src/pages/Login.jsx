import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Eye, EyeOff, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'multiplicador', label: 'Multiplicador', desc: 'Embajador digital' },
  { value: 'pastor', label: 'Pastor', desc: 'Supervisor territorial' },
  { value: 'admin', label: 'Admin', desc: 'Control total del sistema' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [role, setRole] = useState('multiplicador');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    login(role);
    toast.success('¡Bienvenido de vuelta! 🌟');
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Left panel - brand */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-60 h-60 bg-[#5C6BC0]/20 rounded-full blur-3xl" />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#F5E27A] flex items-center justify-center">
            <Globe size={20} className="text-[#0D1257]" />
          </div>
          <div>
            <p className="text-white font-bold">Somos Misión Colombia</p>
            <p className="text-[#D4AF37] text-xs">Red de Embajadores · IPUC</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-5xl font-black text-white leading-tight mb-4">
            Bienvenido<br />de vuelta<span className="text-[#D4AF37]">.</span>
          </h2>
          <p className="text-white/60 text-lg">Tu misión te espera. Cada día importa, cada acción suma.</p>

          <div className="mt-10 flex gap-6">
            {[{ n: '4.2K', l: 'Embajadores' }, { n: '124K', l: 'Compartidos' }, { n: '48', l: 'Distritos' }].map(m => (
              <div key={m.l}>
                <p className="text-2xl font-black text-white">{m.n}</p>
                <p className="text-white/50 text-xs">{m.l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs">© 2024 Misiones Nacionales IPUC</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#1A237E] flex items-center justify-center">
              <Globe size={16} className="text-[#D4AF37]" />
            </div>
            <span className="font-bold text-[#0F172A]">Somos Misión Colombia</span>
          </div>

          <h1 className="text-3xl font-black text-[#0F172A] mb-2">Iniciar sesión</h1>
          <p className="text-[#475569] text-sm mb-8">Selecciona tu rol y accede a la plataforma.</p>

          {/* Role selector */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-[#475569] uppercase tracking-wide mb-2 block">
              Ingresar como
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    role === r.value
                      ? 'border-[#1A237E] bg-[#1A237E]/5'
                      : 'border-[#E2E8F0] hover:border-[#C7D2E0]'
                  }`}
                >
                  <p className={`text-xs font-bold ${role === r.value ? 'text-[#1A237E]' : 'text-[#0F172A]'}`}>
                    {r.label}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#475569] mb-1.5 block">Correo electrónico</label>
              <input className="input-base" type="email" defaultValue="admin@ipuc.org" placeholder="tu@correo.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#475569] mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input className="input-base pr-10" type={showPass ? 'text' : 'password'} defaultValue="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-[#1A237E] font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap size={16} fill="white" /> Entrar a la plataforma</>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-[#475569] mt-6">
            ¿No tienes cuenta?{' '}
            <button onClick={() => navigate('/register')} className="text-[#1A237E] font-semibold hover:underline">
              Regístrate gratis
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
