import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, Users, Volume2, VolumeX } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { api } from '../../api';
import './home-hero.css';

const heroMessage = <>Ser parte de la red de los 5000 es convertirse en un <span>multiplicador virtual</span> de misiones nacionales</>;

export default function HomeHero({ onRegister, onLogin }) {
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const touchStart = useRef(null);
  const reducedMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
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
      if (slide !== 0 || !visible || document.hidden) video.pause();
      else if (!userPaused.current && !reducedMotion) video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && entry.intersectionRatio >= 0.25; sync(); }, { threshold: 0.25 });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); video.pause(); };
  }, [reducedMotion, slide]);

  const selectSlide = (next) => {
    const video = videoRef.current;
    if (next === 0 && video) {
      if (video.ended) video.currentTime = 0;
      userPaused.current = false;
      if (slide === 0) video.play().catch(() => {});
    } else video?.pause();
    setSlide(next);
  };

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
        <div className="mission-welcome-world">
          <div className="mission-slider" role="region" aria-roledescription="carrusel" aria-label="Bienvenida a la red"
            onKeyDown={(event) => {
              if (event.target.tagName === 'INPUT') return;
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); selectSlide(slide === 0 ? 1 : 0); }
            }}>
            <div className={`mission-slider-viewport ${slide === 0 ? 'is-video' : 'is-welcome'}`}
              onTouchStart={(event) => { touchStart.current = event.target.closest('button, input, a') ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
              onTouchEnd={(event) => {
                if (!touchStart.current) return;
                const dx = event.changedTouches[0].clientX - touchStart.current.x;
                const dy = event.changedTouches[0].clientY - touchStart.current.y;
                touchStart.current = null;
                if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) selectSlide(dx < 0 ? 1 : 0);
              }}>
              <div className="mission-slider-track" style={{ transform: `translateX(-${slide * 50}%)` }}>
                <div className="mission-slider-panel" role="group" aria-roledescription="diapositiva" aria-label="1 de 2: video de bienvenida" aria-hidden={slide !== 0} inert={slide !== 0}>
                  <div className="mission-film">
                  <div className="mission-film-screen">
                    <video ref={videoRef} src="/media/somos-mision-bienvenida.mp4" poster="/media/somos-mision-bienvenida.jpg"
                      muted={muted} playsInline preload="metadata" aria-label="Invitación del pastor Jairo Graffe a la red de Misiones Nacionales"
                      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setVideoError(true)}
                      onEnded={() => { userPaused.current = true; setPlaying(false); setSlide(1); }}
                      onTimeUpdate={(event) => { setTime(event.currentTarget.currentTime); if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
                      onDurationChange={(event) => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
                      onLoadedMetadata={(event) => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }} />
                    {!playing && !videoError && <button type="button" className="mission-film-play" onClick={togglePlay} aria-label="Reproducir invitación"><Play size={28} fill="currentColor" /></button>}
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
                  </div>
                  </div>
                </div>
                <div className="mission-slider-panel mission-welcome-panel" role="group" aria-roledescription="diapositiva" aria-label="2 de 2: bienvenida a los 5.000 Amigos" aria-hidden={slide !== 1} inert={slide !== 1}>
                  <div className="mission-welcome-art">
                    <img src="/media/welcome/red-amigos.jpg" srcSet="/media/welcome/red-amigos-mobile.jpg 800w, /media/welcome/red-amigos.jpg 1600w"
                      sizes="(max-width: 760px) calc(100vw - 24px), 65vw" width="1600" height="900" alt="" />
                    <div><h1 id="home-title">{heroMessage}</h1>
                      <div className="mission-home-actions">
                        <button type="button" onClick={onRegister} className="mission-join">Unirme a la red <ArrowRight size={19} /></button>
                        <button type="button" onClick={onLogin} className="mission-login">Iniciar sesión</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-slider-navigation">
              <div className="mission-community-count" aria-live="polite" aria-atomic="true">
                <Users size={22} strokeWidth={1.5} aria-hidden="true" />
                <div><span><strong>{community ? community.activeMultipliers.toLocaleString('es-CO') : '—'}</strong> multiplicadores activos</span><small><i className={live && !countError ? 'is-live' : ''} />{countError ? (community ? 'Reconectando…' : 'Cifra no disponible') : community ? (live ? 'Actualización en vivo' : 'Se actualiza automáticamente') : 'Conectando con la red…'}</small></div>
              </div>
              <div className="mission-slider-buttons">
                <button type="button" aria-label="Diapositiva anterior" onClick={() => selectSlide(slide === 0 ? 1 : 0)}><ChevronLeft size={19} /></button>
                {[0, 1].map(index => <button key={index} type="button" className="mission-slider-dot" aria-label={index === 0 ? 'Ver video de bienvenida' : 'Ver imagen de bienvenida'} aria-pressed={slide === index} onClick={() => selectSlide(index)}><span /></button>)}
                <button type="button" aria-label="Diapositiva siguiente" onClick={() => selectSlide(slide === 0 ? 1 : 0)}><ChevronRight size={19} /></button>
              </div>
            </div>
            {videoError && <p className="mission-film-error" role="status">No se pudo cargar la invitación. <a href="/media/somos-mision-bienvenida.mp4">Abrir el video</a> o <button type="button" onClick={() => selectSlide(1)}>ver la bienvenida</button>.</p>}
          </div>
        </div>
    </section>
  );
}
