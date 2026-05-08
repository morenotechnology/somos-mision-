import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function XPNotification() {
  const xpNotification = useAppStore((s) => s.xpNotification);

  return (
    <AnimatePresence>
      {xpNotification.show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="fixed bottom-24 lg:bottom-8 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #F5E27A 100%)',
            boxShadow: '0 8px 32px rgba(212,175,55,0.5)',
          }}
        >
          <Zap size={18} className="text-[#0D1257]" fill="#0D1257" />
          <span className="text-[#0D1257] font-bold text-sm">+{xpNotification.amount} XP</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
