import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Trophy, Target, Zap, Star, Bell } from 'lucide-react';

const mockNotifications = [
  { id: 'n1', icon: Zap,    color: '#D4AF37', title: 'Ganaste 50 XP',            desc: 'Al compartir contenido de Juventud Misionera', time: 'Hace 5 min',   read: false },
  { id: 'n2', icon: Trophy, color: '#1A237E', title: 'Nueva misión disponible',   desc: 'Completa "Semana de Impacto" antes del domingo', time: 'Hace 1 hora',  read: false },
  { id: 'n3', icon: Star,   color: '#D4AF37', title: 'Insignia desbloqueada',     desc: 'Has ganado "Embajador Activo" por 7 días de racha', time: 'Hace 3 horas', read: true },
  { id: 'n4', icon: Share2, color: '#22c55e', title: 'Contenido destacado',       desc: 'Un nuevo contenido fue marcado como Destacado', time: 'Ayer',         read: true },
  { id: 'n5', icon: Target, color: '#5C1800', title: 'Reto especial activo',      desc: 'Participa en el reto "Voz del Movimiento"',       time: 'Hace 2 días',  read: true },
];

export default function NotificationPanel({ open, onClose }) {
  const unread = mockNotifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.3 }}
            className="absolute right-0 top-12 w-80 card shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#0F172A]" />
                <span className="font-bold text-sm text-[#0F172A]">Notificaciones</span>
                {unread > 0 && (
                  <span className="bg-[#1A237E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unread}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#F5F7FA] transition">
                <X size={14} className="text-[#94A3B8]" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#F5F7FA]">
              {mockNotifications.map((n, i) => {
                const Icon = n.icon;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F5F7FA] transition cursor-pointer ${!n.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${n.color}18` }}>
                      <Icon size={14} style={{ color: n.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${n.read ? 'text-[#475569]' : 'text-[#0F172A]'}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed">{n.desc}</p>
                      <p className="text-[10px] text-[#CBD5E1] mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-[#1A237E] flex-shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#E2E8F0] text-center">
              <button className="text-xs text-[#1A237E] font-semibold hover:underline">
                Marcar todas como leídas
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
