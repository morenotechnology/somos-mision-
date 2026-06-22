import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import BrandLogo from '../components/common/BrandLogo';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(email);
      setSent(true);
      toast.success('Te enviamos el enlace de recuperación');
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => navigate('/login')} className="p-2 rounded-xl hover:bg-white transition mr-1">
            <ArrowLeft size={16} className="text-[#475569]" />
          </button>
          <div className="w-11 h-8 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center p-1.5 shadow-sm">
            <BrandLogo decorative />
          </div>
          <span className="font-bold text-[#0F172A] text-sm">Misiones Nacionales</span>
        </div>

        <div className="card p-8">
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#1A237E]/10 flex items-center justify-center mb-5">
                <Mail size={22} className="text-[#1A237E]" />
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] mb-2">Recuperar contraseña</h1>
              <p className="text-[#475569] text-sm mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#475569] mb-1.5 block">Correo electrónico</label>
                  <input
                    className="input-base"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    autoFocus
                  />
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-700 text-xs">
                    Asegúrate de usar el correo con el que te registraste en la red.
                  </p>
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><Mail size={15} /> Enviar enlace de recuperación</>
                  }
                </motion.button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black text-[#0F172A] mb-2">Correo enviado</h2>
              <p className="text-[#475569] text-sm mb-6">
                Si <span className="font-semibold text-[#0F172A]">{email}</span> está
                registrado en la red, recibirás un enlace en los próximos minutos.
              </p>
              <p className="text-xs text-[#94A3B8] mb-6">Revisa también tu carpeta de spam o correo no deseado.</p>
              <button onClick={() => navigate('/login')} className="btn-primary py-2.5 px-6 text-sm">
                Volver al inicio de sesión
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
