import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2 } from 'lucide-react';
import MissionCard from '../components/missions/MissionCard';
import BadgeEmblem from '../components/common/BadgeEmblem';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api';
import { weekLabel } from '../utils/missionWeek';
import './weekly-missions.css';

export default function Missions() {
  const { currentUser, loginFromApi } = useAppStore();
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [missionRows, boot] = await Promise.all([api.missions.list({ type: 'weekly' }), api.bootstrap()]);
      // The mission sync can award XP, so read the session after it finishes.
      const session = await api.auth.getSession();
      if (!active) return;
      setError('');
      setMissions(missionRows.filter(row => row.type === 'weekly'));
      setBadges(boot.badges || []);
      if (session?.user) loginFromApi(session);
    })().catch(() => { if (active) setError('No pudimos cargar tu progreso. Intenta de nuevo.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loginFromApi, retry]);

  useEffect(() => {
    const refresh = () => { if (!document.hidden) setRetry(value => value + 1); };
    document.addEventListener('visibilitychange', refresh);
    // Refresh across Monday midnight without needing to leave the page.
    const timer = window.setInterval(refresh, 60000);
    return () => { document.removeEventListener('visibilitychange', refresh); clearInterval(timer); };
  }, []);

  const earnedBadges = currentUser?.badges || [];
  const done = missions.filter(mission => mission.status === 'completed').length;
  return <div className="weekly-page">
    <header className="weekly-heading"><h2>Pequeñas acciones.<br /><span>Una gran misión.</span></h2><p>Elige una coordinación y comparte una publicación. Así de fácil.</p></header>
    <section aria-labelledby="weekly-title" className="weekly-section">
      <div className="weekly-section-heading"><div><h3 id="weekly-title">Misiones semanales</h3><p><CalendarDays size={15} />{weekLabel()} · Hora de Colombia</p></div>{!loading && !error && <span>{done} de {missions.length} completadas</span>}</div>
      <p className="weekly-note">Se renuevan cada lunes. Usa el botón de compartir de la publicación y tu avance se registra automáticamente.</p>
      {loading ? <p className="weekly-status" role="status"><Loader2 size={20} className="spin" /> Cargando tus misiones…</p> : error ? <div className="weekly-status" role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : missions.length ? <div>{missions.map(mission => <MissionCard key={mission.id} mission={mission} />)}</div> : <p className="weekly-status">Pronto habrá nuevas publicaciones para compartir. Vuelve en unos días.</p>}
    </section>
    {!loading && !error && <section className="weekly-badges" aria-labelledby="weekly-badges-title">
      <div className="weekly-section-heading"><div><h3 id="weekly-badges-title">Tu colección de insignias</h3><p>Cada emblema cuenta una parte de tu camino.</p></div><span>{badges.filter(badge => earnedBadges.includes(badge.id)).length} / {badges.length}</span></div>
      <div className="weekly-badge-grid">{badges.map(badge => {
        const unlocked = earnedBadges.includes(badge.id);
        return <article key={badge.id}><BadgeEmblem icon={badge.icon} name={badge.name} locked={!unlocked} /><h4>{badge.name}</h4><p>{badge.description}</p><small>{unlocked ? <><CheckCircle2 size={12} /> Desbloqueada</> : 'Por desbloquear'}</small></article>;
      })}</div>
    </section>}
  </div>;
}
