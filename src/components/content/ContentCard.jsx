import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, MessageCircle, Send, Star, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const dateFmt = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });
const formatTone = {
  imagen: '#1A237E',
  video: '#AD1457',
  texto: '#2E7D32',
  carrusel: '#D4AF37',
};

export default function ContentCard({ item, delay = 0 }) {
  const { shareContent, sharedContent } = useAppStore();
  const [imgErr, setImgErr] = useState(false);
  const alreadyShared = sharedContent.includes(String(item.id));
  const accent = formatTone[item.format] || '#1A237E';

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
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`content-card-pro ${alreadyShared ? 'is-shared' : ''}`}
      style={{ '--content-tone': accent }}
    >
      <div className="content-media-pro">
        {item.imageUrl && !imgErr ? (
          <>
            <img src={item.imageUrl} alt={item.title} onError={() => setImgErr(true)} loading="lazy" />
            <div className="content-media-overlay" />
          </>
        ) : (
          <div className="content-media-fallback" />
        )}

        <div className="content-chip-row">
          <span className="content-format-chip">{item.format}</span>
          {item.coordinationName && (
            <span className="content-glass-chip">{item.coordinationName}</span>
          )}
        </div>

        {item.featured && (
          <div className="content-featured-chip">
            <Star size={10} fill="currentColor" />
            Destacado
          </div>
        )}

        <div className="content-category-row">
          <span>{item.category}</span>
        </div>
      </div>

      <div className="content-card-body-pro">
        <div className="content-card-meta-pro">
          <span>{dateFmt.format(new Date(item.createdAt))}</span>
          <strong><Zap size={12} fill="currentColor" strokeWidth={0} />+{item.xpReward} XP</strong>
        </div>

        <h3>{item.title}</h3>
        <p>{item.description}</p>

        <div className="content-engagement-pro">
          <span><Send size={12} />{formatCount(item.shares)}</span>
          <span><Heart size={12} />{formatCount(item.likes)}</span>
          <span><MessageCircle size={12} />Oficial</span>
        </div>

        <div className="content-actions-pro">
          <button type="button" onClick={handleCopy} className="content-action-ghost">
            <Copy size={14} /> Copiar
          </button>
          <button type="button" onClick={handleShare} className={`content-action-primary ${alreadyShared ? 'is-shared' : ''}`}>
            <Send size={14} />
            {alreadyShared ? 'Compartido' : 'Compartir'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
