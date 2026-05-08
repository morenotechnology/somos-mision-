import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Send, Zap, Star } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const formatCount = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n);

export default function ContentCard({ item, delay = 0 }) {
  const { shareContent, sharedContent } = useAppStore();
  const [imgErr, setImgErr] = useState(false);
  const alreadyShared = sharedContent.includes(item.id);

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.copyText)
      .then(() => toast.success('Texto copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  };

  const handleShare = () => {
    if (alreadyShared) { toast('Ya compartiste este contenido'); return; }
    const url = `https://wa.me/?text=${encodeURIComponent(item.copyText)}`;
    window.open(url, '_blank');
    shareContent(item.id);
    toast.success(`+${item.xpReward} XP ganados`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="card card-hover flex flex-col overflow-hidden"
    >
      {/* Image / gradient banner */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden">
        {item.imageUrl && !imgErr ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgErr(true)}
              loading="lazy"
            />
            {/* dark overlay so text is readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-indigo-600" />
        )}

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#D4AF37] text-[#0D1257] text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
            <Star size={9} fill="currentColor" /> Destacado
          </div>
        )}

        {/* Category pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {item.category}
          </span>
          <span className="text-[10px] font-semibold text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize">
            {item.format}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[#0F172A] font-bold text-sm leading-snug mb-1.5 line-clamp-2">{item.title}</h3>
        <p className="text-[#64748B] text-xs leading-relaxed line-clamp-2 flex-1 mb-3">{item.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
            <Send size={10} /> {formatCount(item.shares)} compartidos
          </span>
          <div className="ml-auto flex items-center gap-1 bg-[#FBF6E2] px-2 py-0.5 rounded-full border border-[#D4AF37]/25">
            <Zap size={10} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold text-[#8B6914]">+{item.xpReward} XP</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-[#E2E8F0] text-[#475569] hover:border-[#1A237E]/30 hover:text-[#1A237E] hover:bg-[#EEF0FF] transition-all">
            <Copy size={12} /> Copiar
          </button>
          <button onClick={handleShare}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              alreadyShared
                ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]'
                : 'btn-primary !rounded-xl'
            }`}>
            <Send size={12} />
            {alreadyShared ? 'Compartido' : 'Compartir'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
