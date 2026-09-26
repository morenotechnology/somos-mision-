import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Play, RotateCcw } from 'lucide-react';

export default function SocialVideoFallback({ embed, sourceUrl, image, title, onImageError, onRetry }) {
  const [opened, setOpened] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const container = useRef(null);
  useEffect(() => {
    if (!opened) return undefined;
    const stop = () => { if (document.hidden) setOpened(false); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setOpened(false);
    });
    if (container.current) observer?.observe(container.current);
    document.addEventListener('visibilitychange', stop);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', stop); };
  }, [opened]);
  useEffect(() => {
    if (!opened || loaded) return undefined;
    const timeout = setTimeout(() => setSlow(true), 10000);
    return () => clearTimeout(timeout);
  }, [opened, loaded, attempt]);
  const openPlayer = () => { setLoaded(false); setSlow(false); setOpened(true); };
  return <div className="social-video-recovery" ref={container}>
    {opened && embed ? <div className="social-video-embedded">
      <iframe key={`${embed.url}-${attempt}`} src={embed.url} title={`Reproductor de ${embed.platform}: ${title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onLoad={() => setLoaded(true)} />
      {!loaded && <div className="social-video-connecting" role="status">{slow ? <><span>El reproductor no responde.</span><a href={sourceUrl} target="_blank" rel="noreferrer">Abrir en {embed.platform}<ExternalLink size={16} /></a></> : <span>Conectando con {embed.platform}…</span>}</div>}
    </div> : <div className="social-video-recovery-cover">
      {image && <img src={image} alt="" onError={onImageError} loading="lazy" />}
      {embed ? <button className="social-video-open" onClick={openPlayer} aria-label={`Reproducir video: ${title}`}><Play size={28} fill="currentColor" /><span>Reproducir video</span></button> : <p>No se pudo cargar este video.</p>}
    </div>}
    <div className="social-video-recovery-actions">
      {opened && <button type="button" onClick={() => setOpened(false)}>Cerrar reproductor</button>}
      <button type="button" onClick={() => { onRetry(); setAttempt(value => value + 1); if (embed) openPlayer(); }}><RotateCcw size={14} />Actualizar video</button>
      {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer">Ver en {embed?.platform || 'el sitio original'}<ExternalLink size={14} /></a>}
    </div>
  </div>;
}
