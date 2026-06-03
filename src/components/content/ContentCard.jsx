import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, MessageCircle, Send, Star, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const dateFmt = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });

export default function ContentCard({ item, delay = 0 }) {
  const { shareContent, sharedContent } = useAppStore();
  const [imgErr, setImgErr] = useState(false);
  const alreadyShared = sharedContent.includes(String(item.id));

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.copyText)
      .then(() => toast.success('Texto copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  };

  const handleShare = async () => {
    if (alreadyShared) {
      toast('Ya compartiste este contenido');
      return;
    }
    const url = `https://wa.me/?text=${encodeURIComponent(item.copyText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    try {
      await shareContent(item.id, item.xpReward);
      toast.success(`+${item.xpReward} XP ganados`);
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar el compartido');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="content-card card card-hover flex flex-col overflow-hidden"
    >
      <div className="relative h-44 flex-shrink-0 overflow-hidden">
        {item.imageUrl && !imgErr ? (
          <>
            <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" onError={() => setImgErr(true)} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050716]/85 via-[#050716]/24 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 grad-primary" />
        )}

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="content-chip bg-white/18 text-white backdrop-blur-md capitalize">{item.format}</span>
          {item.coordinationName && (
            <span className="content-chip bg-white/18 text-white backdrop-blur-md">{item.coordinationName}</span>
          )}
        </div>

        {item.featured && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#D4AF37] text-[#0D1257] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
            <Star size={10} fill="currentColor" />
            Destacado
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <span className="content-chip bg-white text-[#1A237E]">{item.category}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="t-caption">{dateFmt.format(new Date(item.createdAt))}</span>
          <div className="flex items-center gap-1 bg-[#FBF6E2] px-2.5 py-1 rounded-full border border-[#D4AF37]/25">
            <Zap size={11} className="text-[#D4AF37]" fill="#D4AF37" />
            <span className="text-[10px] font-black text-[#8B6914]">+{item.xpReward} XP</span>
          </div>
        </div>

        <h3 className="text-[15px] font-bold leading-snug mb-1.5 line-clamp-2" style={{ color: 'var(--text)' }}>{item.title}</h3>
        <p className="text-xs leading-relaxed line-clamp-2 flex-1 mb-4" style={{ color: 'var(--text-3)' }}>{item.description}</p>

        <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--text-4)' }}>
          <span className="flex items-center gap-1"><Send size={11} />{formatCount(item.shares)}</span>
          <span className="flex items-center gap-1"><Heart size={11} />{formatCount(item.likes)}</span>
          <span className="ml-auto flex items-center gap-1"><MessageCircle size={11} />Oficial</span>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={handleCopy} className="action-button action-button-ghost flex-1">
            <Copy size={13} /> Copiar
          </button>
          <button type="button" onClick={handleShare} className={`action-button flex-1 ${alreadyShared ? 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]' : 'action-button-primary'}`}>
            <Send size={13} />
            {alreadyShared ? 'Compartido' : 'Compartir'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
