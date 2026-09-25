import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LucideIcon } from '../common/LucideIcon';

export default function MissionCard({ mission }) {
  const done = mission.status === 'completed';
  return <article className={`weekly-mission ${done ? 'is-done' : ''}`}>
    <div className="weekly-mission-symbol"><LucideIcon name={mission.icon} size={22} /></div>
    <div className="weekly-mission-body"><h3>{mission.title}</h3><p>{mission.description}</p>
      <div className="weekly-mission-meta"><span>+{mission.xpReward} XP</span><span>{done ? <><CheckCircle2 size={14} /> Completada esta semana</> : '1 publicación · A tu ritmo'}</span></div>
    </div>
    {!done && <Link to={`/noticias${mission.coordinationId ? `?coordinacion=${encodeURIComponent(mission.coordinationId)}` : ''}`} className="weekly-mission-link" aria-label={`Ver publicaciones: ${mission.title}`}>Ver publicaciones <ArrowUpRight size={17} /></Link>}
  </article>;
}
