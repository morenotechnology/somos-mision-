import { motion } from 'framer-motion';
import { SearchX } from 'lucide-react';

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Sin resultados',
  description = 'No hay contenido que mostrar.',
  action,
  actionLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F5F7FA] border border-[#E2E8F0] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#94A3B8]" />
      </div>
      <h3 className="text-[#0F172A] font-bold text-base mb-1">{title}</h3>
      <p className="text-[#475569] text-sm max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action}
          className="mt-5 btn-primary py-2 px-5 text-sm"
        >
          {actionLabel || 'Reintentar'}
        </button>
      )}
    </motion.div>
  );
}
