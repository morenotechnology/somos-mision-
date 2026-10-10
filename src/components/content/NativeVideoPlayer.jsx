import { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { observeVideoAutoplay } from '../../utils/videoAutoplay';

const timeLabel = value => `${Math.floor((value || 0) / 60)}:${String(Math.floor((value || 0) % 60)).padStart(2, '0')}`;

export default function NativeVideoPlayer({ src, poster, title, near, locked, aspectRatio, positionRef, onReady, onError, onBuffering }) {
  const video = useRef(null);
  const stage = useRef(null);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ratio, setRatio] = useState(aspectRatio || 16 / 9);
  const [metadata, setMetadata] = useState(false);
  const [playError, setPlayError] = useState(false);

  useEffect(() => {
    if (!near || locked || !video.current) return undefined;
    return observeVideoAutoplay(video.current, { reducedMotion: Boolean(reducedMotion) });
  }, [near, locked, reducedMotion]);

  const togglePlay = async () => {
    if (!video.current) return;
    if (!video.current.paused) { video.current.pause(); return; }
    try { await video.current.play(); setPlayError(false); } catch { setPlayError(true); }
  };
  const seek = value => {
    if (!duration || !video.current) return;
    const next = Math.min(duration, Math.max(0, value));
    video.current.currentTime = next;
    positionRef.current = next;
    setTime(next);
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.current?.requestFullscreen) await stage.current.requestFullscreen();
      else video.current?.webkitEnterFullscreen?.();
    } catch { /* The inline controls stay usable when fullscreen is unavailable. */ }
  };
  const progress = duration ? Math.min(100, time / duration * 100) : 0;

  return <div ref={stage} className={`publication-player${playing ? ' is-playing' : ''}`} style={{ '--media-aspect': ratio }}
    onKeyDown={event => {
      if (event.target.closest('input, button')) return;
      if (event.key === ' ' || event.key === 'k') { event.preventDefault(); togglePlay(); }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); seek(time + (event.key === 'ArrowRight' ? 5 : -5)); }
    }}>
    <video ref={video} src={near ? src : undefined} poster={poster || undefined} className="publication-native-video"
      controls={!locked && !metadata} muted={muted} loop playsInline preload={near ? 'metadata' : 'none'} aria-label={`Video: ${title}`}
      onClick={locked ? undefined : togglePlay}
      onLoadedMetadata={event => {
        const media = event.currentTarget;
        if (media.videoWidth && media.videoHeight) setRatio(media.videoWidth / media.videoHeight);
        if (Number.isFinite(media.duration)) setDuration(media.duration);
        if (positionRef.current > 0 && positionRef.current < media.duration) media.currentTime = positionRef.current;
        setMetadata(true);
      }}
      onDurationChange={event => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
      onTimeUpdate={event => {
        const media = event.currentTarget;
        setTime(media.currentTime);
        if (media.readyState >= 2) positionRef.current = media.currentTime;
      }}
      onLoadedData={onReady} onPlaying={() => { setPlaying(true); setPlayError(false); onBuffering(false); onReady(); }}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={event => setMuted(event.currentTarget.muted)}
      onWaiting={() => onBuffering(true)} onCanPlay={() => onBuffering(false)} onError={onError} />
    {!locked && metadata && <>
      {!playing && <button className="publication-player-play" type="button" aria-label="Reproducir video" onClick={togglePlay}><Play size={28} fill="currentColor" /></button>}
      <div className="publication-player-controls" aria-label="Controles del video">
        <input className="publication-player-seek" type="range" min="0" max={duration || 1} step="0.1" value={time} disabled={!duration}
          style={{ '--video-progress': `${progress}%` }} aria-label="Progreso del video" aria-valuetext={`${timeLabel(time)} de ${timeLabel(duration)}`}
          onChange={event => seek(Number(event.target.value))} />
        <div className="publication-player-buttons">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pausar video' : 'Reproducir video'}>{playing ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}</button>
          <span className="publication-player-time">{timeLabel(time)} <span>/ {duration ? timeLabel(duration) : '—:—'}</span></span>
          <button type="button" onClick={() => { video.current.muted = !video.current.muted; }} aria-label={muted ? 'Activar sonido' : 'Silenciar video'} aria-pressed={!muted}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
          <button type="button" onClick={fullscreen} aria-label="Ver video en pantalla completa"><Maximize size={20} /></button>
        </div>
      </div>
    </>}
    {playError && <span className="publication-player-notice" role="status">Pulsa reproducir para continuar.</span>}
  </div>;
}
