import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ExternalLink, Play, RotateCcw } from 'lucide-react';
import MediaSkeleton from './MediaSkeleton';

export default function SocialVideoFallback({ embed, sourceUrl, image, title, onImageError, onRetry, autoPlay = false }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loadedKey, setLoadedKey] = useState('');
  const [failedKey, setFailedKey] = useState('');
  const container = useRef(null);
  const wasVisible = useRef(false);
  const active = visible && (requested || (autoPlay && !reducedMotion));
  const playerKey = `${embed?.url}-${attempt}`;
  const loaded = loadedKey === playerKey;
  const failed = failedKey === playerKey;

  useEffect(() => {
    let inView = false;
    const sync = () => {
      const nextVisible = inView && !document.hidden;
      if (nextVisible && !wasVisible.current) setAttempt(value => value + 1);
      wasVisible.current = nextVisible;
      setVisible(nextVisible);
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0 });
    if (container.current) observer?.observe(container.current);
    if (!observer) { inView = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  useEffect(() => {
    if (!active || loaded) return undefined;
    const timeout = setTimeout(() => setFailedKey(playerKey), 12000);
    return () => clearTimeout(timeout);
  }, [active, loaded, playerKey]);

  const openPlayer = () => { setRequested(true); setFailedKey(''); };
  const showPlayer = embed && !failed && active;
  return <div className="social-video-recovery" ref={container}>
    <div className="social-video-stage">
      {image && <img className="social-video-poster" src={image} alt="" onError={onImageError} loading="lazy" />}
      {showPlayer && <div className={`social-video-embedded ${loaded ? 'is-loaded' : ''}`}>
        <iframe key={playerKey} src={embed.url} title={`Reproductor de ${embed.platform}: ${title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoadedKey(playerKey)} onError={() => setFailedKey(playerKey)} />
      </div>}
      {!showPlayer && !failed && (!autoPlay || reducedMotion) && embed && <button type="button" className="social-video-open" onClick={openPlayer} aria-label={`Reproducir video: ${title}`}><Play size={26} fill="currentColor" /></button>}
      {active && !loaded && !failed && <MediaSkeleton label="Cargando video…" />}
      {(failed || !embed) && <div className="social-video-error" role="status">
        <span>No se pudo cargar el video.</span>
        <button type="button" onClick={() => { onRetry?.(); setAttempt(value => value + 1); openPlayer(); }}><RotateCcw size={16} />Reintentar</button>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Abrir original<ExternalLink size={16} /></a>}
      </div>}
    </div>
  </div>;
}
