import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Pause, Play, Users, Volume2, VolumeX } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { api } from '../../api';
import BrandLogo from '../common/BrandLogo';
import missionLogo from '../../assets/logos/logosinfondo.png';
import amigosLogo from '../../assets/logos/optimized/amigos-home.png';
import './home-hero.css';

// The official logos and connected Colombia map lead; the invitation remains uncropped.
// The live count is data, while "5.000 Amigos" is the supplied campaign mark.
export default function HomeHero({ onRegister, onLogin, onLearnMore }) {
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [community, setCommunity] = useState(null);
  const [countError, setCountError] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (document.hidden || pending) return;
      pending = true;
      try {
        const value = await api.community.getStats();
        if (active) { setCommunity(value); setCountError(false); }
      } catch { if (active) setCountError(true); }
      finally { pending = false; }
    };
    const subscription = api.community.subscribe?.((value) => {
      if (active) { setCommunity(value); setCountError(false); }
    }, (connected) => {
      if (active) { setLive(connected); if (connected) refresh(); }
    });
    refresh();
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      clearInterval(timer);
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let visible = true;
    const sync = () => {
      if (!visible || document.hidden) video.pause();
      else if (!userPaused.current && !reducedMotion) video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.25 });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause(); };
  }, [reducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    userPaused.current = !video.paused;
    if (video.paused) video.play().catch(() => setVideoError(true));
    else video.pause();
  };
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) { userPaused.current = false; video.play().catch(() => {}); }
  };
  const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

  return (
    <section className="mission-home-hero" id="hero" aria-labelledby="home-title">
      <div className="mission-home-layout">
        <div className="mission-home-copy">
          <img className="mission-home-wordmark" src={missionLogo} alt="Somos Misión Colombia" width="925" height="270" fetchPriority="high" />
          <h1 id="home-title">La misión<br /> nos une<span>.</span></h1>
          <p>Tu voz puede llevar el mensaje más lejos. Sé parte de la red de Misiones Nacionales Colombia.</p>
          <div className="mission-home-actions">
            <button type="button" onClick={onRegister} className="mission-join">Unirme a la red <ArrowRight size={19} /></button>
            <button type="button" onClick={onLogin} className="mission-login">Ya soy parte · Iniciar sesión</button>
          </div>
          <button type="button" onClick={onLearnMore} className="mission-more">Conoce la misión <span>Ver más <ArrowRight size={17} /></span></button>
        </div>
        <div className="mission-map-world">
          <div className="mission-map-art">
            <img className="mission-map-image" src="/media/colombia-red-dorada.jpg"
              srcSet="/media/colombia-red-dorada-mobile.jpg 768w, /media/colombia-red-dorada.jpg 1280w"
              sizes="(max-width: 760px) calc(100vw - 24px), (max-width: 1100px) 48vw, 650px"
              width="1280" height="1280" alt="Mapa de Colombia iluminado en dorado, conectado por caminos de luz" fetchPriority="high" />
            <div className="mission-map-brand" aria-hidden="true"><span><BrandLogo decorative /></span><strong>Misiones<br />Nacionales</strong></div>
            <img className="mission-map-amigos" src={amigosLogo} alt="5.000 Amigos · Red Nacional" width="800" height="565" />
          </div>
          <div className="mission-community-count" aria-live="polite" aria-atomic="true">
            <Users size={27} strokeWidth={1.5} aria-hidden="true" />
            <strong>{community ? community.activeMultipliers.toLocaleString('es-CO') : '—'}</strong>
            <div><span>multiplicadores activos</span><small><i className={live && !countError ? 'is-live' : ''} />{countError ? (community ? 'Reconectando…' : 'Cifra no disponible') : community ? (live ? 'Actualización en vivo' : 'Se actualiza automáticamente') : 'Conectando con la red…'}</small></div>
          </div>
        </div>
      </div>
      <div className="mission-invitation">
        <div className="mission-invitation-copy">
          <h2 id="mission-invitation-title">Una invitación<br /> para ti<span>.</span></h2>
          <p>Ps. Jairo Graffe<span>Director de Misiones Nacionales</span></p>
        </div>
        <figure className="mission-film" aria-labelledby="mission-invitation-title">
          <div className="mission-film-screen">
            <video ref={videoRef} src="/media/somos-mision-bienvenida.mp4" poster="/media/somos-mision-bienvenida.jpg"
              muted={muted} playsInline loop preload="metadata" aria-label="Invitación del pastor Jairo Graffe a la red de Misiones Nacionales"
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setVideoError(true)}
              onTimeUpdate={(event) => { setTime(event.currentTarget.currentTime); if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
              onDurationChange={(event) => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
              onLoadedMetadata={(event) => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }} />
            {!playing && !videoError && <button type="button" className="mission-film-play" onClick={togglePlay} aria-label="Reproducir invitación"><Play size={28} fill="currentColor" /></button>}
          </div>
          <div className="mission-film-controls">
            <button type="button" onClick={togglePlay} disabled={videoError} aria-label={playing ? 'Pausar video' : 'Reproducir video'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
            <input type="range" min="0" max={duration || 1} step="0.1" value={time} disabled={!duration || videoError}
              style={{ '--film-progress': `${duration ? time / duration * 100 : 0}%` }}
              aria-label="Progreso del video de bienvenida" aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
              onChange={(event) => { const next = Number(event.target.value); videoRef.current.currentTime = next; setTime(next); }} />
            <span className="mission-film-time">{formatTime(time)} / {duration ? formatTime(duration) : '—:—'}</span>
            <button type="button" onClick={toggleSound} disabled={videoError} aria-label={muted ? 'Activar sonido' : 'Silenciar video'} aria-pressed={!muted}>
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}<span>{muted ? 'Escuchar' : 'Sonido'}</span>
            </button>
          </div>
          {videoError && <figcaption><a href="/media/somos-mision-bienvenida.mp4">No se pudo reproducir. Abrir el video</a></figcaption>}
        </figure>
      </div>
      <a className="mission-discover" href="#vista-previa">Lo que está pasando en la red <ArrowDown size={16} /></a>
    </section>
  );
}
