import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Award, CheckCircle2, Copy, ExternalLink, Heart, MapPin, MessageCircle, PencilLine, Send, Share2, Smartphone, Star, Trash2, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../api';
import { fetchSocialPreview, getSocialPlatform, isDirectVideoUrl, isPlaceholderImage } from '../../utils/socialPreview';
import SocialCoverFallback from './SocialCoverFallback';
import toast from 'react-hot-toast';

const formatCount = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
const dateFmt = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });
const VIP_WHATSAPP_URL = 'https://chat.whatsapp.com/G2Al7tjnAao6k1I4swB5mv?s=hd&p=i&mlu=4';
const formatVideoTime = (value) => {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};
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

function MobileShareGuidePortal({ mobileGuide, guideLoading, onClose, onConfirm }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {mobileGuide && (
        <>
          <motion.div
            className="content-share-guide-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !guideLoading && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-share-guide-title"
            className={`content-share-guide-modal is-${mobileGuide.network}`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="content-share-guide-close"
              onClick={() => !guideLoading && onClose()}
              aria-label="Cerrar pasos para compartir"
            >
              <X size={18} />
            </button>

            <div className="content-share-guide-head">
              <div className="content-share-guide-icon">
                {mobileGuide.network === 'facebook' ? <FacebookIcon /> : <InstagramIcon />}
              </div>
              <div>
                <span className="content-share-guide-kicker">Recordatorio</span>
                <p>Compartir en {mobileGuide.label}</p>
              </div>
            </div>

            <h3 id="mobile-share-guide-title">Abre la publicación original y compártela manualmente</h3>
            <span className="content-share-guide-copy">
              En móvil te llevamos a {mobileGuide.label}. Comparte desde la app y vuelve aquí para registrar tu avance.
            </span>

            <ol>
              <li><Smartphone size={15} /><span>Toca “Abrir publicación”.</span></li>
              <li><Send size={15} /><span>En {mobileGuide.label}, pulsa “Compartir”.</span></li>
              <li><CheckCircle2 size={15} /><span>Publícala en tu perfil, historia o grupo.</span></li>
              <li><Zap size={15} /><span>Regresa para guardar tu participación.</span></li>
            </ol>

            <div className="content-share-guide-actions">
              <button type="button" onClick={onClose} disabled={guideLoading}>Ahora no</button>
              <button type="button" onClick={onConfirm} disabled={guideLoading}>
                {guideLoading ? 'Registrando...' : `Abrir ${mobileGuide.label}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ShareConfirmationPortal({ confirmation, loading, onClose, onConfirm }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {confirmation && (
        <>
          <motion.div
            className="content-share-guide-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-confirm-title"
            className={`content-share-guide-modal content-share-confirm-modal is-${confirmation.network}`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="content-share-guide-close"
              onClick={() => !loading && onClose()}
              aria-label="Cerrar confirmación de compartido"
            >
              <X size={18} />
            </button>

            <div className="content-share-guide-head">
              <div className="content-share-guide-icon">
                {confirmation.network === 'whatsapp' && <WhatsAppIcon />}
                {confirmation.network === 'facebook' && <FacebookIcon />}
                {confirmation.network === 'instagram' && <InstagramIcon />}
              </div>
              <div>
                <span className="content-share-guide-kicker">Confirmación</span>
                <p>Guardar avance</p>
              </div>
            </div>

            <h3 id="share-confirm-title">¿Compartiste esta publicación?</h3>
            <span className="content-share-guide-copy">
              Confirma solo si ya la compartiste en {confirmation.label}. Al confirmar guardamos tu participación y sumamos XP únicamente la primera vez.
            </span>

            <div className="content-share-confirm-card">
              <CheckCircle2 size={18} />
              <div>
                <strong>{confirmation.title}</strong>
                <span>{confirmation.status === 'verified' ? 'Detectamos que volviste a la web.' : 'El enlace fue abierto correctamente.'}</span>
              </div>
            </div>

            <div className="content-share-guide-actions">
              <button type="button" onClick={onClose} disabled={loading}>Todavía no</button>
              <button type="button" onClick={onConfirm} disabled={loading}>
                {loading ? 'Guardando...' : 'Sí, ya compartí'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function ContentCard({ item, delay = 0, immersive = false, canEdit = false, canDelete = false, onEdit, onDelete }) {
  const { shareContent, sharedContent, currentUser } = useAppStore();
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef(null);
  const shareActionRef = useRef(null);
  const commentInputRef = useRef(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [failedImages, setFailedImages] = useState([]);
  const [remotePreview, setRemotePreview] = useState(null);
  const [social, setSocial] = useState({
    likesCount: Number(item.likes || 0),
    commentsCount: Number(item.commentsCount || 0),
    likedByMe: Boolean(item.likedByMe),
  });
  const [comments, setComments] = useState([]);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [mobileGuide, setMobileGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [shareConfirm, setShareConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const alreadyShared = sharedContent.includes(String(item.id));
  const accent = formatTone[item.format] || '#1A237E';
  const socialPlatform = getSocialPlatform(item.sourcePlatform || item.sourceUrl);
  const networkNames = { whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram' };
  const fallbackUrl = `${window.location.origin}/noticias?contenido=${encodeURIComponent(item.id)}`;
  const sourceLooksFacebook = /facebook\.com|fb\.com|fb\.watch/i.test(item.sourceUrl || '');
  const hasInstagramLink = Boolean(item.instagramUrl);
  const hasFacebookLink = Boolean(item.facebookUrl || sourceLooksFacebook);
  const originalLinks = [
    hasFacebookLink ? { network: 'facebook', label: 'Facebook', url: item.facebookUrl || item.sourceUrl } : null,
    item.instagramUrl ? { network: 'instagram', label: 'Instagram', url: item.instagramUrl } : null,
  ].filter(Boolean);

  const imageCandidates = [item.imageUrl, remotePreview?.imageUrl].filter((candidate) => !isPlaceholderImage(candidate) && !isDirectVideoUrl(candidate));
  const image = imageCandidates.find((candidate) => !failedImages.includes(candidate)) || '';
  const videoCandidates = [
    item.videoUrl,
    item.video_url,
    item.mediaUrl,
    item.media_url,
    String(item.format || '').toLowerCase() === 'video' ? item.imageUrl : '',
    remotePreview?.videoUrl,
  ].filter(isDirectVideoUrl);
  const video = videoCandidates.find((candidate) => !failedImages.includes(candidate)) || '';

  useEffect(() => {
    let active = true;
    setSocial({
      likesCount: Number(item.likes || 0),
      commentsCount: Number(item.commentsCount || 0),
      likedByMe: Boolean(item.likedByMe),
    });
    Promise.resolve(api.social?.resumen?.({ publicationIds: [item.id] }) || {}).then((summary) => {
      if (!active || !summary?.[String(item.id)]) return;
      setSocial((current) => ({ ...current, ...summary[String(item.id)] }));
    }).catch(() => {});
    return () => { active = false; };
  }, [item.id, item.likes, item.commentsCount, item.likedByMe]);

  useEffect(() => {
    setFailedImages([]);
  }, [item.id, item.imageUrl, item.sourceUrl]);

  useEffect(() => {
    if (!item.sourceUrl || (!isPlaceholderImage(item.imageUrl) && String(item.format || '').toLowerCase() !== 'video')) return undefined;
    let active = true;
    fetchSocialPreview(item.sourceUrl)
      .then((preview) => {
        if (active && preview) setRemotePreview(preview);
      });
    return () => { active = false; };
  }, [item.imageUrl, item.sourceUrl, item.format]);

  useEffect(() => {
    const media = videoRef.current;
    if (!media || !video || typeof IntersectionObserver === 'undefined') return undefined;
    media.muted = !audioEnabled;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        media.muted = !audioEnabled;
        media.play().catch(() => {});
      } else {
        media.pause();
      }
    }, { threshold: 0.58 });
    observer.observe(media);
    return () => observer.disconnect();
  }, [audioEnabled, video]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.pause();
    }
    setVideoTime(0);
    setVideoDuration(0);
    setAudioEnabled(false);
  }, [video]);

  useEffect(() => {
    if (!shareMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!shareActionRef.current?.contains(event.target)) setShareMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShareMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shareMenuOpen]);

  const loadComments = async () => {
    if (commentsOpen) {
      setCommentsOpen(false);
      return;
    }
    setCommentsOpen(true);
    setCommentsLoading(true);
    try {
      const rows = await api.social?.comentarios?.({ publication_id: item.id, limit: 24 });
      setComments(rows || []);
    } catch (error) {
      toast.error(error.message || 'No se pudieron cargar los comentarios');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleReaction = async () => {
    if (!currentUser) {
      toast.error('Inicia sesión para reaccionar');
      return;
    }
    setSocialLoading(true);
    try {
      const result = await api.social.toggleReaction(item.id, 'like');
      setSocial((current) => ({
        ...current,
        likedByMe: Boolean(result.active),
        likesCount: Number(result.likesCount ?? current.likesCount + (result.active ? 1 : -1)),
      }));
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar la reacción');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCommentReaction = async (comment) => {
    if (!currentUser) {
      toast.error('Inicia sesión para reaccionar');
      return;
    }
    setSocialLoading(true);
    try {
      const result = await api.social.toggleCommentReaction(comment.id, 'like');
      setComments((current) => current.map((row) => (
        String(row.id) === String(comment.id)
          ? {
            ...row,
            likedByMe: Boolean(result.active),
            likesCount: Number(result.likesCount ?? Number(row.likesCount || 0) + (result.active ? 1 : -1)),
          }
          : row
      )));
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el me gusta');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleReplyToComment = (comment) => {
    setReplyingTo(comment);
    window.requestAnimationFrame(() => commentInputRef.current?.focus());
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    const cleanText = commentText.trim();
    if (!cleanText) return;
    setSocialLoading(true);
    try {
      const created = await api.social.agregarComentario(item.id, cleanText, replyingTo?.id || null);
      const createdLevel = Number(created?.level || created?.authorLevel || currentUser?.level || 1);
      const currentUserBadge = typeof currentUser?.badgeName === 'string' ? currentUser.badgeName : '';
      setComments((current) => [{
        ...created,
        content: created?.content || cleanText,
        authorName: created?.authorName && created.authorName !== 'Miembro de la red' ? created.authorName : currentUser?.name || 'Miembro de la red',
        authorAvatar: created?.authorAvatar || currentUser?.avatar,
        authorColor: created?.authorColor || currentUser?.avatarColor,
        level: Number.isFinite(createdLevel) && createdLevel > 0 ? createdLevel : 1,
        authorLevel: Number.isFinite(createdLevel) && createdLevel > 0 ? createdLevel : 1,
        districtName: created?.districtName || created?.authorDistrict || currentUser?.districtName || currentUser?.district || 'Sin distrito',
        authorDistrict: created?.authorDistrict || created?.districtName || currentUser?.districtName || currentUser?.district || 'Sin distrito',
        badgeName: created?.badgeName || created?.authorBadge || currentUserBadge,
        authorBadge: created?.authorBadge || created?.badgeName || currentUserBadge,
        parentCommentId: created?.parentCommentId || replyingTo?.id || null,
        likesCount: Number(created?.likesCount || 0),
        likedByMe: Boolean(created?.likedByMe),
      }, ...current]);
      setCommentText('');
      setReplyingTo(null);
      setSocial((current) => ({ ...current, commentsCount: current.commentsCount + 1 }));
    } catch (error) {
      toast.error(error.message || 'No se pudo publicar el comentario');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCommentDelete = async (comment) => {
    const userId = currentUser?.schemaId || currentUser?.id;
    const canDelete = String(comment.userId) === String(userId) || currentUser?.role === 'admin' || currentUser?.canPublish;
    if (!canDelete) return;
    if (!window.confirm('¿Eliminar este comentario?')) return;
    try {
      await api.social.eliminarComentario(comment.id);
      const removedIds = new Set([String(comment.id)]);
      comments.forEach((row) => {
        if (String(row.parentCommentId || row.parent_comment_id || '') === String(comment.id)) removedIds.add(String(row.id));
      });
      setComments((current) => {
        return current.filter((row) => !removedIds.has(String(row.id)));
      });
      setSocial((current) => ({ ...current, commentsCount: Math.max(current.commentsCount - removedIds.size, 0) }));
      if (String(replyingTo?.id) === String(comment.id)) setReplyingTo(null);
      toast.success('Comentario eliminado');
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el comentario');
    }
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(item.copyText)
      .then(() => toast.success('Texto copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar'));
  };

  const handleImageError = (event) => {
    const brokenImage = event.currentTarget.currentSrc || event.currentTarget.src;
    if (brokenImage) {
      setFailedImages((current) => current.includes(brokenImage) ? current : [...current, brokenImage]);
    }
    if (!item.sourceUrl || remotePreview?.imageUrl) return;
    fetchSocialPreview(item.sourceUrl).then((preview) => {
      if (preview?.imageUrl) setRemotePreview(preview);
    });
  };

  const getNetworkUrl = (network) => {
    if (network === 'facebook') return item.facebookUrl || (sourceLooksFacebook ? item.sourceUrl : '') || fallbackUrl;
    if (network === 'instagram') return item.instagramUrl || fallbackUrl;
    return item.facebookUrl || item.instagramUrl || item.sourceUrl || fallbackUrl;
  };

  const getNetworkTarget = (network) => {
    if (network === 'instagram') return item.instagramUrl || 'https://www.instagram.com/';
    return getNetworkUrl(network);
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
    const targetUrl = getNetworkTarget(network);
    const message = getShareMessage();
    const shareText = message.includes(shareUrl) ? message : `${message}\n${shareUrl}`;
    if (network === 'instagram') {
      await navigator.clipboard?.writeText(shareText).catch(() => {});
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return shareUrl;
    }

    const url = network === 'facebook'
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return shareUrl;
  };

  const askForShareConfirmation = async (network, shareUrl) => {
    if (!shareUrl) return;
    const shareSignal = await waitForShareSignal();
    setShareConfirm({
      network,
      shareUrl,
      label: networkNames[network],
      title: item.title,
      status: shareSignal.status,
      elapsedMs: shareSignal.elapsedMs,
    });
  };

  const handleShare = async (network) => {
    setShareMenuOpen(false);

    if (isMobileShareDevice() && ['facebook', 'instagram'].includes(network)) {
      setMobileGuide({
        network,
        label: networkNames[network],
        shareUrl: getNetworkUrl(network),
        targetUrl: getNetworkTarget(network),
      });
      return;
    }

    const shareUrl = await openNetworkShare(network);
    await askForShareConfirmation(network, shareUrl);
  };

  const handleUnifiedShare = () => {
    setShareMenuOpen((current) => !current);
  };

  const toggleAudio = () => {
    const media = videoRef.current;
    if (!media) return;
    const nextAudioState = !audioEnabled;
    media.muted = !nextAudioState;
    setAudioEnabled(nextAudioState);
    media.play().catch(() => {});
  };

  const seekVideo = (event) => {
    const media = videoRef.current;
    const nextTime = Number(event.currentTarget.value);
    if (!media || !Number.isFinite(nextTime)) return;
    media.currentTime = nextTime;
    setVideoTime(nextTime);
  };

  const registerShare = async (network, shareUrl, shareSignal = {}) => {
    try {
      const payload = await shareContent(item.id, item.xpReward, network, {
        share_url: shareUrl,
        verification_status: shareSignal.status || 'confirmed',
        share_latency_ms: shareSignal.elapsedMs ?? null,
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
    window.open(mobileGuide.targetUrl || mobileGuide.shareUrl, '_blank', 'noopener,noreferrer');
    try {
      await askForShareConfirmation(mobileGuide.network, mobileGuide.shareUrl);
      setMobileGuide(null);
    } finally {
      setGuideLoading(false);
    }
  };

  const confirmShareRegistration = async () => {
    if (!shareConfirm) return;
    setConfirmLoading(true);
    try {
      await registerShare(shareConfirm.network, shareConfirm.shareUrl, {
        status: shareConfirm.status,
        elapsedMs: shareConfirm.elapsedMs,
      });
      setShareConfirm(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      whileHover={immersive ? undefined : { y: -5, scale: 1.01 }}
      className={`content-card-pro ${immersive ? 'is-immersive' : ''} ${alreadyShared ? 'is-shared' : ''}`}
      style={{ '--content-tone': accent }}
    >
      <div className="content-media-pro">
        {video ? (
          <>
            <video
              ref={videoRef}
              className="content-media-video"
              src={video}
              poster={image || undefined}
              muted={!audioEnabled}
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-label={`Vista previa de video: ${item.title}`}
              onLoadedMetadata={(event) => setVideoDuration(Number(event.currentTarget.duration) || 0)}
              onDurationChange={(event) => setVideoDuration(Number(event.currentTarget.duration) || 0)}
              onTimeUpdate={(event) => setVideoTime(event.currentTarget.currentTime)}
              onError={(event) => {
                const brokenVideo = event.currentTarget.currentSrc || event.currentTarget.src;
                setFailedImages((current) => current.includes(brokenVideo) ? current : [...current, brokenVideo]);
              }}
            />
            <div className="content-media-overlay" />
            <button
              type="button"
              className="content-video-sound-toggle"
              onClick={toggleAudio}
              aria-label={audioEnabled ? 'Silenciar video' : 'Activar sonido del video'}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{audioEnabled ? 'Sonido' : 'Activar sonido'}</span>
            </button>
          </>
        ) : image ? (
          <>
            <img src={image} alt={item.title} onError={handleImageError} loading="lazy" />
            <div className="content-media-overlay" />
          </>
        ) : (
          <SocialCoverFallback item={item} platform={socialPlatform} />
        )}

        <div className="content-chip-row">
          <span className="content-format-chip">{item.format}</span>
          {item.sourceUrl && (
            <span className="content-preview-source-chip">{socialPlatform.label} · Vista previa</span>
          )}
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

        {video && (
          <div className="content-video-progress" aria-label="Controles de reproducción del video">
            <div className="content-video-progress-row">
              <input
                type="range"
                min="0"
                max={videoDuration || 0}
                step="0.1"
                value={Math.min(videoTime, videoDuration || 0)}
                onChange={seekVideo}
                disabled={!videoDuration}
                aria-label="Avanzar o retroceder el video"
                style={{ '--video-progress': `${videoDuration ? (videoTime / videoDuration) * 100 : 0}%` }}
              />
              <span>{formatVideoTime(videoTime)} / {formatVideoTime(videoDuration)}</span>
            </div>
          </div>
        )}

        <div className="content-engagement-pro">
          <span className="content-engagement-stat"><Send size={12} /><b>{formatCount(item.shares)}</b></span>
          <button type="button" className={`content-like-button ${social.likedByMe ? 'is-liked' : ''}`} onClick={handleReaction} disabled={socialLoading} aria-label={`${social.likesCount} Me gusta`} aria-pressed={social.likedByMe}>
            <Heart size={13} fill={social.likedByMe ? 'currentColor' : 'none'} /><span className="content-engagement-label"><b>{formatCount(social.likesCount)}</b><em> Me gusta</em></span>
          </button>
          <button type="button" className="content-comments-button" onClick={loadComments} aria-label={`${social.commentsCount} Comentarios`} aria-expanded={commentsOpen}>
            <MessageCircle size={13} /><span className="content-engagement-label"><b>{formatCount(social.commentsCount)}</b><em> Comentarios</em></span>
          </button>
          <span className="content-engagement-official"><CheckCircle2 size={12} /><em>Oficial</em></span>
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

        {(canEdit || canDelete) && (
          <div className="content-inline-actions">
            {canEdit && (
              <button type="button" className="content-inline-edit-button" onClick={() => onEdit?.(item)}>
                <PencilLine size={14} />
                Editar publicación
              </button>
            )}
            {canDelete && (
              <button type="button" className="content-inline-edit-button is-delete" onClick={() => onDelete?.(item)}>
                <Trash2 size={14} />
                Eliminar
              </button>
            )}
          </div>
        )}

        {commentsOpen && (
          <>
            {immersive && (
              <button
                type="button"
                className="content-comments-backdrop"
                onClick={() => setCommentsOpen(false)}
                aria-label="Cerrar comentarios"
              />
            )}
            <motion.div
              role={immersive ? 'dialog' : undefined}
              aria-modal={immersive ? 'true' : undefined}
              aria-label={immersive ? 'Comentarios de la publicación' : undefined}
              className="content-comments-panel"
              initial={immersive && !prefersReducedMotion ? { opacity: 0, y: '100%' } : false}
              animate={immersive ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
            <div className="content-comments-head">
              <div>
                <strong>Comentarios</strong>
                <span>{social.commentsCount} comentarios</span>
              </div>
              <button type="button" className="content-comments-close" onClick={() => setCommentsOpen(false)} aria-label="Cerrar comentarios">
                <X size={18} />
              </button>
            </div>
            {commentsLoading ? (
              <p className="content-comments-empty">Cargando comentarios...</p>
            ) : comments.length ? (
              <div className="content-comments-list">
                {comments.map((comment) => {
                  const userId = currentUser?.schemaId || currentUser?.id;
                  const canDeleteComment = String(comment.userId) === String(userId) || currentUser?.role === 'admin' || currentUser?.canPublish;
                  const levelValue = Number(comment.level ?? comment.authorLevel);
                  const commentLevel = Number.isFinite(levelValue) && levelValue > 0 ? levelValue : 1;
                  const districtValue = comment.districtName || comment.authorDistrict || comment.district;
                  const commentDistrict = typeof districtValue === 'string' && districtValue.trim() ? districtValue : 'Sin distrito';
                  const badgeValue = comment.badgeName || comment.authorBadge || comment.badge;
                  const commentBadge = typeof badgeValue === 'string' ? badgeValue : badgeValue?.name || '';
                  const avatarValue = typeof comment.authorAvatar === 'string' ? comment.authorAvatar : '';
                  const avatarIsImage = /^(https?:\/\/|data:image\/|\/)/i.test(avatarValue);
                  const commentLikeCount = Number(comment.likesCount || 0);
                  return (
                    <article key={comment.id} className={`content-comment-item ${comment.parentCommentId || comment.parent_comment_id ? 'is-reply' : ''}`}>
                      <div className="content-comment-avatar" style={{ background: comment.authorColor || '#1A237E' }}>
                        {avatarIsImage ? <img src={avatarValue} alt="" loading="lazy" /> : avatarValue || comment.authorName?.slice(0, 2).toUpperCase() || 'MR'}
                      </div>
                      <div className="content-comment-copy">
                        <strong>{comment.authorName || 'Miembro de la red'}</strong>
                        <div className="content-comment-author-meta">
                          {commentBadge && <span className="content-comment-badge"><Award size={11} />{commentBadge}</span>}
                          <span className="content-comment-level">Nivel {commentLevel}</span>
                        <span className="content-comment-district"><MapPin size={11} />{commentDistrict}</span>
                        </div>
                        <p>{comment.content}</p>
                        <div className="content-comment-actions">
                          <button
                            type="button"
                            className={`content-comment-like ${comment.likedByMe ? 'is-liked' : ''}`}
                            onClick={() => handleCommentReaction(comment)}
                            disabled={socialLoading}
                            aria-label={comment.likedByMe ? 'Quitar me gusta del comentario' : 'Dar me gusta al comentario'}
                            aria-pressed={Boolean(comment.likedByMe)}
                          >
                            <Heart size={13} fill={comment.likedByMe ? 'currentColor' : 'none'} />
                            <span>{commentLikeCount}</span>
                          </button>
                          <button type="button" className="content-comment-reply" onClick={() => handleReplyToComment(comment)}>
                            Responder
                          </button>
                        </div>
                      </div>
                      {canDeleteComment && (
                        <button type="button" className="content-comment-delete" onClick={() => handleCommentDelete(comment)} aria-label="Eliminar comentario">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="content-comments-empty">Sé la primera persona en comentar esta noticia.</p>
            )}
            {replyingTo && (
              <div className="content-comment-replying">
                <span>Respondiendo a <strong>{replyingTo.authorName || 'este miembro'}</strong></span>
                <button type="button" onClick={() => setReplyingTo(null)} aria-label="Cancelar respuesta">
                  <X size={13} />
                </button>
              </div>
            )}
            <form className="content-comment-form" onSubmit={handleCommentSubmit}>
              <input
                ref={commentInputRef}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={replyingTo ? `Responde a ${replyingTo.authorName || 'este comentario'}...` : 'Escribe un comentario...'}
                maxLength={500}
              />
              <button type="submit" disabled={socialLoading || !commentText.trim()} aria-label="Publicar comentario"><Send size={15} /></button>
            </form>
            <a className="content-comments-vip" href={VIP_WHATSAPP_URL} target="_blank" rel="noreferrer">
              <span className="content-comments-vip-icon"><WhatsAppIcon /></span>
              <span>
                <strong>Comunidad VIP</strong>
                <small>Reuniones y capacitaciones de la red</small>
              </span>
              <ExternalLink size={13} />
            </a>
            </motion.div>
          </>
        )}

        <div className="content-actions-pro">
          {immersive ? (
            <>
              <button type="button" onClick={handleReaction} className={`content-action-ghost content-action-like ${social.likedByMe ? 'is-liked' : ''}`} disabled={socialLoading} aria-label={social.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'} aria-pressed={social.likedByMe}>
                <Heart size={21} fill={social.likedByMe ? 'currentColor' : 'none'} />
              </button>
              <button type="button" onClick={loadComments} className="content-action-ghost content-action-comments" aria-label="Abrir comentarios" aria-expanded={commentsOpen}>
                <MessageCircle size={21} />
              </button>
              <div ref={shareActionRef} className={`content-share-action ${shareMenuOpen ? 'is-open' : ''}`}>
                <div className="content-share-menu" aria-hidden={!shareMenuOpen}>
                  <button type="button" className="content-share-bubble is-facebook" onClick={() => handleShare('facebook')} aria-label="Compartir en Facebook">
                    <FacebookIcon />
                  </button>
                  <button type="button" className="content-share-bubble is-whatsapp" onClick={() => handleShare('whatsapp')} aria-label="Compartir en WhatsApp">
                    <WhatsAppIcon />
                  </button>
                  <button type="button" className="content-share-bubble is-instagram" onClick={() => handleShare('instagram')} aria-label="Compartir en Instagram">
                    <InstagramIcon />
                  </button>
                </div>
                <button type="button" onClick={handleUnifiedShare} className="content-action-ghost content-action-share" aria-label="Compartir publicación" aria-expanded={shareMenuOpen}>
                  <Share2 size={21} />
                </button>
              </div>
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="content-action-ghost content-action-original" aria-label="Abrir publicación original">
                  <ExternalLink size={21} />
                </a>
              )}
            </>
          ) : (
            <>
              <button type="button" onClick={handleCopy} className="content-action-ghost" aria-label="Copiar texto de la publicación">
                <Copy size={14} /> Copiar
              </button>
              <button type="button" onClick={loadComments} className="content-action-ghost content-action-comments" aria-label="Abrir comentarios" aria-expanded={commentsOpen}>
                <MessageCircle size={15} /> Comentarios
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
            </>
          )}
        </div>
      </div>

      <MobileShareGuidePortal
        mobileGuide={mobileGuide}
        guideLoading={guideLoading}
        onClose={() => setMobileGuide(null)}
        onConfirm={confirmMobileShareGuide}
      />

      <ShareConfirmationPortal
        confirmation={shareConfirm}
        loading={confirmLoading}
        onClose={() => setShareConfirm(null)}
        onConfirm={confirmShareRegistration}
      />

    </motion.div>
  );
}
