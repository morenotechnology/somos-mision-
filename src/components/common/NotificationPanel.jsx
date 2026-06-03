import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Share2, Target, Trophy, X, Zap } from 'lucide-react';
import { api } from '../../api';

const iconMap = {
  bell: Bell,
  share: Share2,
  target: Target,
  trophy: Trophy,
  zap: Zap,
};

export default function NotificationPanel({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;

    async function loadNotifications() {
      setLoading(true);
      setError('');
      try {
        const result = await api.notifications.list({ limit: 12 });
        if (!cancelled) setItems(Array.isArray(result) ? result : []);
      } catch (loadError) {
        if (!cancelled) {
          setItems([]);
          setError(loadError.message || 'No se pudo cargar la actividad reciente');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const unread = useMemo(() => items.filter((item) => !item.read).length, [items]);

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
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[28px] border border-white/60 bg-white/92 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#0F172A]" />
                <span className="text-sm font-bold text-[#0F172A]">Actividad</span>
                {unread > 0 && (
                  <span className="rounded-full bg-[#1A237E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="rounded-lg p-1 transition hover:bg-[#F5F7FA]" type="button">
                <X size={14} className="text-[#94A3B8]" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#F5F7FA]">
              {loading && (
                <div className="flex items-center gap-3 px-4 py-5 text-xs text-[#64748B]">
                  <span className="h-4 w-4 rounded-full border-2 border-[#1A237E] border-t-transparent animate-spin" />
                  Cargando actividad real de tu cuenta...
                </div>
              )}

              {!loading && error && (
                <div className="px-4 py-5 text-xs leading-relaxed text-[#B91C1C]">
                  {error}
                </div>
              )}

              {!loading && !error && items.length === 0 && (
                <div className="px-4 py-5 text-xs leading-relaxed text-[#64748B]">
                  Aún no hay actividad registrada. Cuando compartas contenido o completes misiones, aparecerá aquí.
                </div>
              )}

              {!loading && !error && items.map((item, index) => {
                const Icon = iconMap[item.icon] || Bell;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`flex cursor-default items-start gap-3 px-4 py-3 transition hover:bg-[#F8FAFC] ${!item.read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${item.color}18` }}>
                      <Icon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold leading-snug ${item.read ? 'text-[#475569]' : 'text-[#0F172A]'}`}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[#94A3B8]">{item.desc}</p>
                      <p className="mt-1 text-[10px] text-[#CBD5E1]">{item.time}</p>
                    </div>
                    {!item.read && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#1A237E]" />}
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t border-[#E2E8F0] px-4 py-2.5 text-center">
              <span className="text-xs font-semibold text-[#1A237E]">
                Actividad sincronizada con Supabase
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
