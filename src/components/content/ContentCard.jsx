import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Copy, ExternalLink, Heart, MessageCircle, Send, Smartphone, Star, X, Zap } from 'lucide-react';
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

function waitForShareSignal() {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    let settled = false;
    let timer;

    const cleanup = () => {
      window.removeEventListener('focus', finishFromReturn);
      document.removeEventListener('visibilitychange', finishFromVisibility);
      window.clearTimeout(timer);
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      const elapsedMs = Date.now() - startedAt;
      resolve({
        status: elapsedMs > 1800 ? 'verified' : 'opened',
        elapsedMs,
      });
    };

    const finishFromReturn = () => finish();
    const finishFromVisibility = () => {
      if (document.visibilityState === 'visible') finish();
    };

    window.addEventListener('focus', finishFromReturn);
    document.addEventListener('visibilitychange', finishFromVisibility);
    timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        status: 'opened',
        elapsedMs: null,
      });
    }, 6500);
  });
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12.04 2.2a9.7 9.7 0 0 0-8.37 14.58L2.6 21.8l5.15-1.31a9.7 9.7 0 1 0 4.29-18.29Zm0 17.66a7.9 7.9 0 0 1-4.02-1.1l-.29-.18-3.06.78.65-3.01-.2-.31a7.9 7.9 0 1 1 6.92 3.82Zm4.4-5.9c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.95-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.92 3.77-3.92 1.09 0 2.23.2 2.23.2v2.47h-1.25c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2.1a3.5 3.5 0 0 0-3.5 3.5v8.8a3.5 3.5 0 0 0 3.5 3.5h8.8a3.5 3.5 0 0 0 3.5-3.5V7.6a3.5 3.5 0 0 0-3.5-3.5H7.6Zm9.02 2.38a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36ZM12 7.05A4.95 4.95 0 1 1 12 16.95 4.95 4.95 0 0 1 12 7.05Zm0 2.1a2.85 2.85 0 1 0 0 5.7 2.85 2.85 0 0 0 0-5.7Z" />
    </svg>
  );
}

function isMobileShareDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

export default function ContentCard({ item, delay = 0 }) {
  const { shareContent, sharedContent } = useAppStore();
  const [imgErr, setImgErr] = useState(false);
  const [mobileGuide, setMobileGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const alreadyShared = sharedContent.includes(String(item.id));
  const accent = formatTone[item.format] || '#1A237E';
  const networkNames = { whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram' };
  const fallbackUrl = `${window.location.origin}/dashboard?contenido=${encodeURIComponent(item.id)}`;
  const sourceLooksFacebook = /facebook\.com|fb\.com|fb\.watch/i.test(item.sourceUrl || '');
  const hasInstagramLink = Boolean(item.instagramUrl);
  const hasFacebookLink = Boolean(item.facebookUrl || sourceLooksFacebook);
  const originalLinks = [
    hasFacebookLink ? { network: 'facebook', label: 'Facebook', url: item.facebookUrl || item.sourceUrl } : null,
    item.instagramUrl ? { network: 'instagram', label: 'Instagram', url: item.instagramUrl } : null,
  ].filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.copyText)
      .then(() => toast.success('Texto copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  };

  const getNetworkUrl = (network) => {
    if (network === 'facebook') return item.facebookUrl || (sourceLooksFacebook ? item.sourceUrl : '') || fallbackUrl;
    if (network === 'instagram') return item.instagramUrl || '';
    return item.facebookUrl || item.instagramUrl || item.sourceUrl || fallbackUrl;
  };

  const getShareMessage = () => {
    const base = item.copyText || item.description || item.title;
    const message = base.toLowerCase().includes(item.title.toLowerCase()) ? base : `${base}\n\n${item.title}`;
    const links = [
      item.facebookUrl && !message.includes(item.facebookUrl) ? `Facebook: ${item.facebookUrl}` : '',
      item.instagramUrl && !message.includes(item.instagramUrl) ? `Instagram: ${item.instagramUrl}` : '',
    ].filter(Boolean);
    return links.length ? `${message}\n\n${links.join('\n')}` : message;
  };

  const openNetworkShare = async (network) => {
    const shareUrl = getNetworkUrl(network);
    const message = getShareMessage();
    const shareText = message.includes(shareUrl) ? message : `${message}\n${shareUrl}`;
    if (network === 'instagram') {
      if (!shareUrl) {
        toast.error('Esta publicación no tiene enlace de Instagram asignado');
        return '';
      }
      await navigator.clipboard?.writeText(shareText).catch(() => {});
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      return shareUrl;
    }

    const url = network === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return shareUrl;
  };

  const handleShare = async (network) => {
    if (network === 'instagram' && !hasInstagramLink) return;

    if (isMobileShareDevice() && network === 'facebook') {
      const shareUrl = getNetworkUrl(network);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      await registerShare(network, shareUrl);
      return;
    }

    if (isMobileShareDevice() && network === 'instagram') {
      setMobileGuide({
        network,
        label: networkNames[network],
        shareUrl: getNetworkUrl(network),
      });
      return;
    }

    const shareUrl = await openNetworkShare(network);
    await registerShare(network, shareUrl);
  };

  const registerShare = async (network, shareUrl) => {
    try {
      const shareSignal = await waitForShareSignal();
      const payload = await shareContent(item.id, item.xpReward, network, {
        share_url: shareUrl,
        verification_status: shareSignal.status,
        share_latency_ms: shareSignal.elapsedMs,
      });
      const xp = Number(payload.share?.xp_ganado || 0);
      const statusText = shareSignal.status === 'verified' ? 'verificado' : 'registrado';
      toast.success(xp > 0 ? `Compartido ${statusText}. +${xp} XP` : `Compartido ${statusText} en ${networkNames[network]}`);
    } catch (error) {
      toast.error(error.message || 'No se pudo registrar el compartido');
    }
  };

  const confirmMobileShareGuide = async () => {
    if (!mobileGuide) return;
    setGuideLoading(true);
    window.open(mobileGuide.shareUrl, '_blank', 'noopener,noreferrer');
    try {
      await registerShare(mobileGuide.network, mobileGuide.shareUrl);
      setMobileGuide(null);
    } finally {
      setGuideLoading(false);
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

        {alreadyShared && (
          <div className="content-shared-ribbon">
            <CheckCircle2 size={12} />
            Compartida
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

        {(originalLinks.length > 0 || item.sourceUrl) && (
          <div className="content-original-links">
            {originalLinks.length > 0 ? originalLinks.map((link) => (
              <a key={link.network} className="content-original-link" href={link.url} target="_blank" rel="noreferrer">
                <ExternalLink size={13} />
                Ver en {link.label}
              </a>
            )) : (
              <a className="content-original-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={13} />
                Ver publicación original
              </a>
            )}
          </div>
        )}

        <div className="content-actions-pro">
          <button type="button" onClick={handleCopy} className="content-action-ghost">
            <Copy size={14} /> Copiar
          </button>
          <button type="button" onClick={() => handleShare('whatsapp')} className={`content-action-social is-whatsapp ${alreadyShared ? 'is-shared' : ''}`}>
            <WhatsAppIcon />
            WhatsApp
          </button>
          {hasFacebookLink && (
            <button type="button" onClick={() => handleShare('facebook')} className={`content-action-social is-facebook ${alreadyShared ? 'is-shared' : ''}`}>
              <FacebookIcon />
              Facebook
            </button>
          )}
          {hasInstagramLink && (
            <button type="button" onClick={() => handleShare('instagram')} className={`content-action-social is-instagram ${alreadyShared ? 'is-shared' : ''}`}>
              <InstagramIcon />
              Instagram
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileGuide && (
          <>
            <motion.div
              className="content-share-guide-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !guideLoading && setMobileGuide(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className="content-share-guide-modal"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="content-share-guide-close"
                onClick={() => !guideLoading && setMobileGuide(null)}
                aria-label="Cerrar pasos para compartir"
              >
                <X size={18} />
              </button>
              <div className="content-share-guide-icon">
                {mobileGuide.network === 'facebook' ? <FacebookIcon /> : <InstagramIcon />}
              </div>
              <p>Compartir en {mobileGuide.label}</p>
              <h3>Abre la publicación original y compártela manualmente</h3>
              <ol>
                <li><Smartphone size={15} />Toca “Abrir publicación”.</li>
                <li><Send size={15} />En la red social, pulsa “Compartir”.</li>
                <li><CheckCircle2 size={15} />Publícala en tu perfil o historias.</li>
                <li><Zap size={15} />Regresa aquí para registrar tu avance.</li>
              </ol>
              <div className="content-share-guide-actions">
                <button type="button" onClick={() => setMobileGuide(null)} disabled={guideLoading}>Cancelar</button>
                <button type="button" onClick={confirmMobileShareGuide} disabled={guideLoading}>
                  {guideLoading ? 'Registrando...' : 'Abrir publicación'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
