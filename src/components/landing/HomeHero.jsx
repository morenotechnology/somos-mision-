import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Maximize, MessageCircle, Pause, Play, Radio, Users, Volume2, VolumeX } from 'lucide-react';
import { api } from '../../api';
import './home-hero.css';

const communityUrl = 'https://chat.whatsapp.com/G2Al7tjnAao6k1I4swB5mv?s=hd&p=i&mlu=4';
const slideNames = ['Video de bienvenida', 'Nuestra red', 'Comunidad WhatsApp'];
const formatTime = (value) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;

export default function HomeHero({ onRegister, onLogin }) {
  const videoRef = useRef(null);
  const filmRef = useRef(null);
  const carouselRef = useRef(null);
  const indicatorRefs = useRef([]);
  const touchStart = useRef(null);
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [playError, setPlayError] = useState(false);
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
    const pauseHidden = () => { if (document.hidden) video.pause(); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.2) video.pause();
    }, { threshold: 0.2 });
    // Observe the stationary viewport; moving slides can deliver stale intersection events.
    observer.observe(carouselRef.current?.querySelector('.campaign-slides') || video);
    document.addEventListener('visibilitychange', pauseHidden);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', pauseHidden); video.pause(); };
  }, []);

  const selectSlide = (next) => {
    const target = (next + slideNames.length) % slideNames.length;
    const focusWasInSlide = carouselRef.current?.querySelectorAll('.campaign-slide')[slide]?.contains(document.activeElement);
    videoRef.current?.pause();
    setSlide(target);
    if (target !== slide && focusWasInSlide) indicatorRefs.current[target]?.focus({ preventScroll: true });
  };
  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    setPlayError(false);
    if (!video.paused) { video.pause(); return; }
    if (video.ended) video.currentTime = 0;
    try { await video.play(); } catch { setPlayError(true); }
  };
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };
  const fullscreen = async () => {
    try {
      if (filmRef.current?.requestFullscreen) await filmRef.current.requestFullscreen();
      else if (videoRef.current?.webkitEnterFullscreen) videoRef.current.webkitEnterFullscreen();
    } catch { /* Playback stays available if fullscreen is refused. */ }
  };
  const recordDuration = (event) => {
    if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration);
  };
  const count = community?.activeMultipliers;
  const connected = live && !countError;

  return (
    <section className="mission-home-hero" id="hero" aria-labelledby="home-title">
      <div className="campaign-body" ref={carouselRef} role="region" aria-roledescription="carrusel" aria-label="Bienvenida a la red"
        onKeyDown={(event) => {
          if (event.target.tagName === 'INPUT') return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); selectSlide(slide + (event.key === 'ArrowRight' ? 1 : -1)); }
        }}>
        <div className="campaign-prelude">
          <p>Unidos por el evangelio<br />en las naciones</p>
          <div className="campaign-signature"><img src="/media/campaign-5000/signature.jpg" width="512" height="384" alt="Somos Misión Colombia" /></div>
        </div>
        <div className="campaign-heading">
          <p className="campaign-eyebrow">Unánimes en la misión</p>
          <h1 id="home-title">5000 AMIGOS</h1>
          <p className="campaign-invitation">Súmate a la obra. Juntos podemos llevar<br className="campaign-desktop-break" /> el evangelio más lejos.</p>
        </div>
        <div className="campaign-carousel">
          <div className="campaign-slides"
            onTouchStart={(event) => { touchStart.current = event.target.closest('button, input, a') ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
            onTouchEnd={(event) => {
              if (!touchStart.current) return;
              const dx = event.changedTouches[0].clientX - touchStart.current.x;
              const dy = event.changedTouches[0].clientY - touchStart.current.y;
              touchStart.current = null;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 2) selectSlide(slide + (dx < 0 ? 1 : -1));
            }}>
            <div className="campaign-slide-track" style={{ transform: `translateX(-${slide * 100 / 3}%)` }}>
              <div className="campaign-slide" role="group" aria-roledescription="diapositiva" aria-label="1 de 3: video de bienvenida" aria-hidden={slide !== 0} inert={slide !== 0}>
                <div className="mission-film-screen" ref={filmRef}>
                  <video ref={videoRef} src="/media/somos-mision-bienvenida.mp4" poster="/media/campaign-5000/welcome-film.jpg"
                    muted={muted} playsInline preload="metadata" aria-label="Invitación del pastor Jairo Graffe a la red de Misiones Nacionales"
                    onPlay={() => { setPlaying(true); setPlayError(false); }} onPause={() => setPlaying(false)} onError={() => setVideoError(true)}
                    onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
                    onEnded={() => { setPlaying(false); selectSlide(1); }}
                    onTimeUpdate={(event) => { setTime(event.currentTarget.currentTime); recordDuration(event); }}
                    onDurationChange={recordDuration} onLoadedMetadata={recordDuration} />
                  {!playing && !videoError && <button type="button" className="mission-film-play" onClick={togglePlay} aria-label={muted ? 'Reproducir invitación sin sonido' : 'Reproducir invitación con sonido'}><Play fill="currentColor" /></button>}
                  <div className="mission-film-controls">
                    <button type="button" onClick={togglePlay} disabled={videoError} aria-label={playing ? 'Pausar video' : 'Reproducir video'}>{playing ? <Pause /> : <Play fill="currentColor" />}</button>
                    <input type="range" min="0" max={duration || 1} step="0.1" value={time} disabled={!duration || videoError}
                      style={{ '--film-progress': `${duration ? time / duration * 100 : 0}%` }}
                      aria-label="Progreso del video de bienvenida" aria-valuetext={`${formatTime(time)} de ${formatTime(duration)}`}
                      onChange={(event) => { const next = Number(event.target.value); videoRef.current.currentTime = next; setTime(next); }} />
                    <span className="mission-film-time">{formatTime(time)} / {duration ? formatTime(duration) : '—:—'}</span>
                    <button type="button" onClick={toggleSound} disabled={videoError} aria-label={muted ? 'Activar sonido' : 'Silenciar video'} aria-pressed={!muted}>{muted ? <VolumeX /> : <Volume2 />}</button>
                    <button type="button" onClick={fullscreen} aria-label="Ver video en pantalla completa"><Maximize /></button>
                  </div>
                </div>
              </div>
              <div className="campaign-slide campaign-story" role="group" aria-roledescription="diapositiva" aria-label="2 de 3: nuestra red" aria-hidden={slide !== 1} inert={slide !== 1}>
                <p className="campaign-story-label">Tu lugar en la misión</p>
                <h2>Ser parte de la red de los 5000 es convertirse en un <em>multiplicador virtual</em> de misiones nacionales</h2>
              </div>
              <div className="campaign-slide campaign-story campaign-whatsapp" role="group" aria-roledescription="diapositiva" aria-label="3 de 3: comunidad WhatsApp" aria-hidden={slide !== 2} inert={slide !== 2}>
                <MessageCircle aria-hidden="true" />
                <h2>La misión también<br />se comparte.</h2>
                <a href={communityUrl} target="_blank" rel="noreferrer">Entrar a la comunidad WhatsApp <ArrowRight size={20} /></a>
              </div>
            </div>
          </div>
          {(videoError || playError) && slide === 0 && <p className="mission-film-error" role="status">{videoError ? 'No se pudo cargar el video.' : 'Toca reproducir para volver a intentarlo.'} <a href="/media/somos-mision-bienvenida.mp4" target="_blank" rel="noreferrer">Abrir video</a></p>}
        </div>
          <div className="campaign-community" aria-live="polite" aria-atomic="true">
            <div className="campaign-count"><Users aria-hidden="true" /><div><strong>{Number.isFinite(count) ? count.toLocaleString('es-CO') : '—'}</strong><span>multiplicadores<br />activos</span></div></div>
            <div className="campaign-live"><Radio aria-hidden="true" /><span>{countError ? 'Cifra' : 'Actualización'}<br /><small><i className={connected ? 'is-live' : ''} />{countError ? 'no disponible' : !community ? 'conectando…' : connected ? 'en vivo' : 'automática'}</small></span></div>
          </div>
          <div className="campaign-actions">
            <button type="button" className="campaign-join" onClick={onRegister}>Unirme ahora <ArrowRight /></button>
            <button type="button" className="campaign-learn" onClick={onLogin}>Iniciar sesión</button>
          </div>
          <div className="campaign-slider-footer">
            <div className="campaign-slide-dots">{slideNames.map((name, index) => <button key={name} ref={element => { indicatorRefs.current[index] = element; }} type="button" aria-label={name} aria-pressed={slide === index} onClick={() => selectSlide(index)}><span /></button>)}</div>
            <p>Noticias<br />Testimonios<br />Avances <span aria-hidden="true">—</span></p>
          </div>
          <p className="campaign-status" role="status" aria-live="polite">Diapositiva {slide + 1} de 3: {slideNames[slide]}</p>
        <p className="campaign-outreach">Más iglesias<br />Más misioneros<br />Más naciones</p>
      </div>
    </section>
  );
}
