import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CalendarDays, CheckCircle, Flame, Lock, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import MissionCard from '../components/missions/MissionCard';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api';
import { LucideIcon } from '../components/common/LucideIcon';
import { formatNumber } from '../utils/helpers';

const tabs = ['Diarias', 'Semanales', 'Especiales'];
const typeMap = { Diarias: 'daily', Semanales: 'weekly', Especiales: 'special' };

export default function Missions() {
  const [tab, setTab] = useState('Diarias');
  const { currentUser, completedMissions, loginFromApi } = useAppStore();
  const [missions, setMissions] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    let active = true;
    Promise.all([api.missions.list(), api.bootstrap(), api.auth.getSession()])
      .then(([missionRows, boot, session]) => {
        if (!active) return;
        setMissions(missionRows);
        setBadges(boot.badges || []);
        if (session?.user) loginFromApi(session);
      });
    return () => { active = false; };
  }, [loginFromApi]);

  const earnedBadges = currentUser?.badges || [];
  const userBadges = badges.filter((badge) => earnedBadges.includes(badge.id));
  const filtered = missions.filter((mission) => mission.type === typeMap[tab]);
  const totalDoneToday = completedMissions.length + missions.filter((mission) => mission.status === 'completed').length;
  const totalXPEarned = currentUser?.xp || 0;

  return (
    <div className="missions-pro-page">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="missions-hero-pro"
      >
        <div className="missions-hero-orbit">
          <Target size={28} />
        </div>
        <div className="missions-hero-copy">
          <p className="missions-kicker"><Sparkles size={14} /> Centro de avance</p>
          <h2>Misiones & Recompensas</h2>
          <span>Completa acciones reales, suma XP y desbloquea insignias visibles en tu perfil.</span>
        </div>
        <div className="missions-hero-pulse">
          <Flame size={18} />
          <strong>{formatNumber(totalDoneToday)}</strong>
          <span>completadas</span>
        </div>
      </motion.section>

      <section className="missions-stat-grid">
        {[
          { label: 'Completadas', value: formatNumber(totalDoneToday), note: 'Acciones listas', color: '#22c55e', Icon: CheckCircle },
          { label: 'XP actual', value: formatNumber(totalXPEarned), note: 'Progreso vivo', color: '#D4AF37', Icon: Zap },
          { label: 'Insignias', value: userBadges.length, note: 'Desbloqueadas', color: '#1A237E', Icon: Award },
        ].map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.08 }}
            className="mission-stat-pro"
            style={{ '--mission-stat-color': item.color }}
          >
            <div><item.Icon size={18} /></div>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <small>{item.note}</small>
          </motion.article>
        ))}
      </section>

      <div className="missions-tabs-pro" role="tablist" aria-label="Tipos de misiones">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={tab === item ? 'is-active' : ''}
          >
            {item === 'Diarias' && <CalendarDays size={14} />}
            {item === 'Semanales' && <Flame size={14} />}
            {item === 'Especiales' && <Trophy size={14} />}
            {item}
          </button>
        ))}
      </div>

      <section className="missions-list-pro">
        <div className="missions-section-head">
          <div>
            <p><Target size={13} /> Ruta seleccionada</p>
            <h3>{tab}</h3>
          </div>
          <span>{filtered.length} disponibles</span>
        </div>
        {filtered.length ? (
          filtered.map((mission, index) => <MissionCard key={mission.id} mission={mission} delay={index * 0.07} />)
        ) : (
          <div className="missions-empty-pro">
            <Target size={22} />
            <strong>No hay misiones en esta categoría</strong>
            <span>Cuando el equipo nacional active nuevas acciones, aparecerán aquí.</span>
          </div>
        )}
      </section>

      <section className="mission-badges-pro">
        <div className="missions-section-head">
          <div>
            <p><Award size={13} /> Galería de logros</p>
            <h3>Insignias disponibles</h3>
          </div>
          <span>{userBadges.length}/{badges.length}</span>
        </div>
        <p className="mission-badges-intro">Desbloquea insignias completando misiones, compartiendo contenido y elevando tu nivel de impacto.</p>
        <div className="mission-badge-grid">
          {badges.map((badge, index) => {
            const unlocked = earnedBadges.includes(badge.id);
            return (
              <motion.article
                key={badge.id}
                initial={{ opacity: 0, scale: 0.88, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.045 }}
                whileHover={unlocked ? { scale: 1.04, y: -3 } : { y: -2 }}
                className={`mission-badge-pro ${unlocked ? 'is-unlocked' : 'is-locked'}`}
                style={{ '--badge-tone': badge.color }}
              >
                <div>
                  {unlocked ? <LucideIcon name={badge.icon} size={19} /> : <Lock size={17} />}
                </div>
                <strong>{badge.name}</strong>
                <span>{badge.description}</span>
                <small><Zap size={10} fill="currentColor" strokeWidth={0} />+{badge.xp} XP</small>
                {unlocked && <em><CheckCircle size={10} />Desbloqueada</em>}
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
