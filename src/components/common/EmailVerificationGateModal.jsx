import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Mail, Send, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api';

export default function EmailVerificationGateModal({ open, email, onClose }) {
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await api.auth.resendVerification(email);
      toast.success('Correo enviado. Revisa también SPAM.');
    } catch (error) {
      toast.error(error.message || 'No se pudo enviar el correo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="email-gate-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !sending && onClose?.()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="email-gate-modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="email-gate-close"
              onClick={() => !sending && onClose?.()}
              aria-label="Cerrar verificación de correo"
            >
              <X size={18} />
            </button>
            <div className="email-gate-icon">
              <Mail size={25} />
            </div>
            <p>Verificación necesaria</p>
            <h3>Ya llegaste a 100 XP. Verifica tu correo para seguir sumando.</h3>
            <span className="email-gate-text">
              Te enviaremos un enlace seguro. Al abrirlo, vuelve a la plataforma y tu cuenta quedará habilitada para continuar ganando puntos.
            </span>
            <div className="email-gate-warning">
              <ShieldCheck size={17} />
              <strong>DEBES VERIFICAR LA CARPETA DE SPAM</strong>
            </div>
            <ol>
              <li><Send size={15} />Presiona “Enviar correo de verificación”.</li>
              <li><Mail size={15} />Busca el correo en Recibidos, Promociones o SPAM.</li>
              <li><CheckCircle2 size={15} />Abre el enlace y regresa a Somos Misión Colombia.</li>
            </ol>
            <div className="email-gate-actions">
              <button type="button" onClick={() => onClose?.()} disabled={sending}>Después</button>
              <button type="button" onClick={handleSend} disabled={sending}>
                {sending ? 'Enviando...' : 'Enviar correo'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
