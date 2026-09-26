import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ExternalLink, Play, RotateCcw } from 'lucide-react';

export default function SocialVideoFallback({ embed, sourceUrl, image, title, onImageError, onRetry, autoPlay = false }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [requested, setRequested] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const container = useRef(null);
  const active = visible && (requested || (autoPlay && !reducedMotion));

  useEffect(() => {
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      sync();
    }, { threshold: [0, 0.5] });
    if (container.current) observer?.observe(container.current);
    if (!observer) { inView = true; sync(); }
    document.addEventListener('visibilitychange', sync);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  useEffect(() => { setLoaded(false); setFailed(false); }, [embed?.url, attempt, active]);
  useEffect(() => {
    if (!active || loaded) return undefined;
    const timeout = setTimeout(() => setFailed(true), 25000);
    return () => clearTimeout(timeout);
  }, [active, loaded, attempt]);

  const openPlayer = () => { setRequested(true); setFailed(false); };
  const showPlayer = embed && !failed && active;
  return <div className="social-video-recovery" ref={container}>
    <div className="social-video-stage">
      {image && <img className="social-video-poster" src={image} alt="" onError={onImageError} loading="lazy" />}
      {showPlayer && <div className={`social-video-embedded ${loaded ? 'is-loaded' : ''}`}>
        <iframe key={`${embed.url}-${attempt}`} src={embed.url} title={`Reproductor de ${embed.platform}: ${title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
      </div>}
      {!showPlayer && !failed && (!autoPlay || reducedMotion) && embed && <button type="button" className="social-video-open" onClick={openPlayer} aria-label={`Reproducir video: ${title}`}><Play size={26} fill="currentColor" /></button>}
      {active && !loaded && !failed && <span className="social-video-loading" role="status">Cargando video…</span>}
      {(failed || !embed) && <div className="social-video-error" role="status">
        <span>No se pudo cargar el video.</span>
        <button type="button" onClick={() => { onRetry?.(); setAttempt(value => value + 1); openPlayer(); }}><RotateCcw size={16} />Reintentar</button>
        {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Abrir original<ExternalLink size={16} /></a>}
      </div>}
    </div>
  </div>;
}
