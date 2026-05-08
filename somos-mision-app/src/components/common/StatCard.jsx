import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = '#1A237E', delay = 0 }) {
  const hex   = color;
  const light = `${hex}18`;
  const mid   = `${hex}30`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card p-5 flex flex-col gap-3"
    >
      {/* Icon + accent strip */}
      <div className="flex items-center justify-between">
        <div
          className="icon-box icon-box-md"
          style={{ background: light, border: `1px solid ${mid}` }}
        >
          <Icon size={18} style={{ color: hex }} />
        </div>
        <div
          className="h-1.5 w-8 rounded-full"
          style={{ background: `linear-gradient(90deg, ${hex}40, ${hex})` }}
        />
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-black leading-none tracking-tight" style={{ color: hex }}>
          {value}
        </p>
        <p className="text-sm font-medium text-[#64748B] mt-1 leading-tight">{label}</p>
        {sub && <p className="text-xs text-[#94A3B8] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}
