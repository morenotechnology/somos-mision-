import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Crown, Filter, Medal, Sparkles, Trophy, Zap } from 'lucide-react';
import RankingCard from '../components/ranking/RankingCard';
import { api } from '../api';
import { useAppStore } from '../store/useAppStore';
import { formatNumber } from '../utils/helpers';

const tabs = ['Nacional', 'Por Región'];
const medalConfig = [
  { bg: 'linear-gradient(135deg,#F6CF4B,#D4AF37)', shadow: '0 4px 14px rgba(212,175,55,0.45)', Icon: Trophy, color: '#D4AF37', label: '1' },
  { bg: 'linear-gradient(135deg,#C8D6DF,#9EB3BF)', shadow: '0 4px 14px rgba(158,179,191,0.4)', Icon: Award, color: '#9EB3BF', label: '2' },
  { bg: 'linear-gradient(135deg,#D4956A,#B87333)', shadow: '0 4px 14px rgba(184,115,51,0.35)', Icon: Medal, color: '#B87333', label: '3' },
];

function Podium({ top3, currentUserKeys }) {
  const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const medals = top3.length >= 3 ? [medalConfig[1], medalConfig[0], medalConfig[2]] : medalConfig;

  return (
    <div className="rank-podium-pro">
      {order.map((user, index) => {
        const medal = medals[index];
        const MedalIcon = medal.Icon;
        const actualPosition = top3.indexOf(user) + 1;
        const isCurrentUser = currentUserKeys.has(String(user.id)) || currentUserKeys.has(String(user.schemaId));
        return (
          <motion.article
            key={user.id}
            initial={{ opacity: 0, y: 32, rotate: actualPosition === 1 ? 0 : -2 }}
            animate={{ opacity: 1, y: 0, rotate: actualPosition === 1 ? 0 : -2 }}
            transition={{ delay: index * 0.11 + 0.15, type: 'spring', bounce: 0.36 }}
            className={`rank-podium-card position-${actualPosition} ${isCurrentUser ? 'is-current-user' : ''}`}
          >
            <div className="rank-podium-orb" style={{ background: medal.bg, boxShadow: medal.shadow }}>
              <MedalIcon size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="rank-podium-avatar" style={{ background: user.avatarColor, boxShadow: `0 0 0 3px ${medal.color}44` }}>
              {user.avatar}
            </div>
            <strong>{user.name.split(' ')[0]}</strong>
            <span><Zap size={12} fill="currentColor" strokeWidth={0} />{formatNumber(user.xp)} XP</span>
            <small>#{actualPosition}{isCurrentUser ? ' · Tú' : ''}</small>
          </motion.article>
        );
      })}
    </div>
  );
}

export default function Ranking() {
  const currentUser = useAppStore((state) => state.currentUser);
  const [tab, setTab] = useState('Nacional');
  const [regionFilter, setRegionFilter] = useState('');
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;
    api.bootstrap().then((data) => active && setRegions(data.regions || []));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    api.ranking.list({ role: 'multiplicador', region: tab === 'Por Región' ? regionFilter : undefined }).then((rows) => {
      if (!active) return;
      setUsers(rows);
    });
    return () => { active = false; };
  }, [tab, regionFilter]);

  const top3 = users.slice(0, 3);
  const remainingUsers = users.slice(3);
  const leader = users[0];
  const currentUserKeys = new Set([currentUser?.id, currentUser?.schemaId].filter(Boolean).map(String));
  const currentUserPosition = users.findIndex((user) => currentUserKeys.has(String(user.id)) || currentUserKeys.has(String(user.schemaId))) + 1;
  const currentUserRanking = currentUserPosition > 0 ? users[currentUserPosition - 1] : null;

  return (
    <div className="rank-pro-page">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="rank-hero-pro"
      >
        <div className="rank-hero-copy">
          <p className="rank-kicker"><Trophy size={15} /> Muro de honor nacional</p>
          <h2>Podio de multiplicadores</h2>
          <span>Reconoce a quienes están moviendo contenido, misiones y avance en toda Colombia.</span>
        </div>

        <div className="rank-hero-leader">
          <div className="rank-leader-crown"><Crown size={18} fill="currentColor" strokeWidth={0} /></div>
          <div className="rank-leader-avatar" style={{ background: leader?.avatarColor || '#1A237E' }}>
            {leader?.avatar || 'SM'}
          </div>
          <div>
            <small>Líder actual</small>
            <strong>{leader?.name || 'Aún sin ranking'}</strong>
            <span><Zap size={14} fill="currentColor" strokeWidth={0} />{formatNumber(leader?.xp || 0)} XP</span>
          </div>
        </div>

        <div className="rank-hero-self">
          <span>Tu puesto nacional</span>
          <strong>{currentUserPosition > 0 ? `#${currentUserPosition}` : '—'}</strong>
          <small>{currentUserRanking ? `${formatNumber(currentUserRanking.xp)} XP · ${users.length} participantes` : 'Participa para entrar al ranking'}</small>
        </div>
      </motion.section>

      <div className="rank-controls-pro">
        <div className="rank-tab-group">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={tab === item ? 'is-active' : ''}>
              {item}
            </button>
          ))}
        </div>

        {tab === 'Por Región' && (
          <label className="rank-filter-pro">
            <Filter size={15} />
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
              <option value="">Todas las regiones</option>
              {regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
            </select>
          </label>
        )}
      </div>

      {top3.length > 0 && (
        <section className="rank-podium-shell">
          <div className="rank-section-head">
            <div>
              <p><Sparkles size={13} /> Top de impacto</p>
              <h3>Podio en movimiento</h3>
            </div>
            <span>{top3.length} destacados</span>
          </div>
          <Podium top3={top3} currentUserKeys={currentUserKeys} />
        </section>
      )}

      {(remainingUsers.length > 0 || !top3.length) && <section className="rank-list-panel">
        <div className="rank-section-head">
          <div>
            <p><Medal size={13} /> Después del podio</p>
            <h3>{tab === 'Por Región' && regionFilter ? 'Multiplicadores de la región' : 'Más multiplicadores'}</h3>
          </div>
          <span>{users.length} perfiles</span>
        </div>

        <div className="rank-list-pro">
          {remainingUsers.length ? (
            remainingUsers.map((user, index) => <RankingCard key={user.id} user={user} position={index + 4} delay={index * 0.045} isCurrentUser={currentUserKeys.has(String(user.id)) || currentUserKeys.has(String(user.schemaId))} />)
          ) : (
            <div className="rank-empty-state">
              <Trophy size={22} />
              <strong>Aún no hay registros para este filtro</strong>
              <span>Cuando empiece la actividad, el ranking se llenará automáticamente.</span>
            </div>
          )}
        </div>
      </section>}
    </div>
  );
}
