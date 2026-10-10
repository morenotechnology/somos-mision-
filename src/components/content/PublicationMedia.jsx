import { useEffect, useRef, useState } from 'react';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { fetchPublicationPreview, selectPublicationMedia } from '../../utils/socialPreview';
import NativeVideoPlayer from './NativeVideoPlayer';
import MediaSkeleton from './MediaSkeleton';
import '../../pages/social-feed.css';

export default function PublicationMedia({ item, eager = false, locked = false, onKindChange }) {
  const [preview, setPreview] = useState(null);
  const [failed, setFailed] = useState([]);
  const [near, setNear] = useState(eager);
  const [settledRequest, setSettledRequest] = useState('');
  const [retry, setRetry] = useState(0);
  const [readyUrl, setReadyUrl] = useState('');
  const [stalled, setStalled] = useState(false);
  const [timedOutUrl, setTimedOutUrl] = useState('');
  const container = useRef(null);
  const videoPosition = useRef(0);
  const autoRecovered = useRef(false);
  const media = selectPublicationMedia(item, preview, failed);
  const linksKey = media.links.join('|');
  const currentUrl = media.video || media.image;
  const ready = Boolean(currentUrl && readyUrl === currentUrl);
  const needsPreview = !media.image || media.kind === 'video' || failed.length > 0;
  const requestKey = `${linksKey}:${retry}`;
  const resolved = settledRequest === requestKey;
  const loading = Boolean(near && !locked && linksKey && (needsPreview || retry > 0) && !resolved);
  const timedOut = Boolean(currentUrl && timedOutUrl === currentUrl);

  useEffect(() => {
    if (!container.current || typeof IntersectionObserver === 'undefined') { setNear(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNear(true); observer.disconnect(); }
    }, { root: document.querySelector('.app-main-scroll'), rootMargin: '400px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { onKindChange?.(media.kind); }, [media.kind, onKindChange]);

  useEffect(() => {
    if (!near || locked || !linksKey || (!needsPreview && !retry)) return undefined;
    let active = true;
    fetchPublicationPreview(linksKey.split('|'), { refresh: retry > 0 }).then(result => {
      if (active) { setPreview(result); setSettledRequest(requestKey); }
    });
    return () => { active = false; };
    // Media arrivals do not start another lookup; a retry or changed original does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linksKey, near, locked, retry]);

  useEffect(() => {
    if (!near || !currentUrl || ready && !stalled) return undefined;
    const timer = setTimeout(() => setTimedOutUrl(currentUrl), 12000);
    return () => clearTimeout(timer);
  }, [currentUrl, ready, near, retry, stalled]);

  useEffect(() => {
    const reconnect = () => { if (!ready || stalled) { setTimedOutUrl(''); setFailed([]); setRetry(value => value + 1); } };
    window.addEventListener('online', reconnect);
    return () => window.removeEventListener('online', reconnect);
  }, [ready, stalled]);

  const retryMedia = () => { setTimedOutUrl(''); setStalled(false); setFailed([]); setRetry(value => value + 1); };
  const onError = event => {
    const url = event.currentTarget.currentSrc || event.currentTarget.src;
    const original = event.currentTarget.getAttribute('src');
    setFailed(current => [...new Set([...current, url, original].filter(Boolean))]);
    if (!autoRecovered.current) { autoRecovered.current = true; setRetry(value => value + 1); }
  };
  const nativeUnavailable = media.kind === 'video' && !media.video && resolved && !locked;
  const unavailable = !loading && near && (timedOut || nativeUnavailable || (resolved || !linksKey) && !media.video && !media.image);
  const skeleton = !locked && !ready && !unavailable;
  return <div ref={container} className={`publication-media is-${media.kind}${ready ? ' is-ready' : ''}${!media.image && !media.video && !media.embed ? ' is-empty' : ''}`} aria-busy={loading || skeleton || stalled}>
    {media.video ? <NativeVideoPlayer key={`${media.video}:${retry}`} src={media.video} poster={media.image} title={item.title}
      near={near} locked={locked} aspectRatio={media.aspectRatio} positionRef={videoPosition}
      onReady={() => { setReadyUrl(media.video); setTimedOutUrl(''); }} onBuffering={setStalled} onError={onError} />
      : media.image ? <img key={`${media.image}:${retry}`} src={near || locked || !media.image.startsWith('/api/social-cover') ? media.image : undefined} alt={item.title} loading={eager ? 'eager' : 'lazy'} decoding="async"
        onLoad={() => { setReadyUrl(media.image); setTimedOutUrl(''); }} onError={onError} /> : null}
    {skeleton && <MediaSkeleton label={media.kind === 'video' ? 'Cargando video…' : 'Cargando publicación…'} />}
    {stalled && ready && !unavailable && <span className="publication-player-buffering" role="status">Cargando…</span>}
    {unavailable && <div className="publication-media-error" role="status">
      <p>{nativeUnavailable ? 'Este video no está disponible para reproducirse aquí.' : `No pudimos cargar ${media.kind === 'video' ? 'el video' : 'la imagen'}.`}</p>
      <button type="button" onClick={retryMedia}><RotateCcw size={16} />Reintentar</button>
      {media.sourceUrl && <a href={media.sourceUrl} target="_blank" rel="noreferrer">Ver publicación original<ExternalLink size={14} /></a>}
    </div>}
  </div>;
}
