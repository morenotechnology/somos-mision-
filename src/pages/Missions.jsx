import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Award, CheckCircle, Lock } from 'lucide-react';
import MissionCard from '../components/missions/MissionCard';
import { useAppStore } from '../store/useAppStore';
import { api } from '../api';
import { LucideIcon } from '../components/common/LucideIcon';

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

  const userBadges = badges.filter((badge) => currentUser?.badges.includes(badge.id));
  const filtered = missions.filter((mission) => mission.type === typeMap[tab]);
  const totalDoneToday = completedMissions.length + missions.filter((mission) => mission.status === 'completed').length;
  const totalXPEarned = currentUser?.xp || 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1"><Target size={20} className="text-[#1A237E]" /><h2 className="text-2xl font-black text-[#0F172A]">Misiones & Recompensas</h2></div>
        <p className="text-[#475569] text-sm">Completa misiones, gana XP y desbloquea insignias.</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Completadas', value: totalDoneToday, color: '#22c55e', Icon: CheckCircle },
          { label: 'XP actual', value: `${totalXPEarned}`, color: '#D4AF37', Icon: Zap },
          { label: 'Insignias', value: userBadges.length, color: '#1A237E', Icon: Award },
        ].map((item, index) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="card p-4 text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}15` }}><item.Icon size={16} style={{ color: item.color }} /></div>
            <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
            <p className="text-[#475569] text-xs mt-0.5">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === item ? 'bg-[#1A237E] text-white' : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F5F7FA]'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">{filtered.map((mission, index) => <MissionCard key={mission.id} mission={mission} delay={index * 0.07} />)}</div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-1"><Award size={18} className="text-[#D4AF37]" /><h3 className="font-bold text-[#0F172A]">Insignias disponibles</h3></div>
        <p className="text-[#475569] text-xs mb-5">Desbloquea insignias completando misiones y subiendo de nivel.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {badges.map((badge, index) => {
            const unlocked = currentUser?.badges.includes(badge.id);
            return (
              <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.06 }} whileHover={unlocked ? { scale: 1.04, y: -2 } : {}} className={`p-4 rounded-2xl border text-center transition ${unlocked ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-[#E2E8F0] bg-[#F5F7FA] opacity-50'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${badge.color}20`, opacity: unlocked ? 1 : 0.5 }}>
                  {unlocked ? <LucideIcon name={badge.icon} size={18} style={{ color: badge.color }} /> : <Lock size={16} className="text-[#94A3B8]" />}
                </div>
                <p className="text-xs font-bold text-[#0F172A] leading-tight">{badge.name}</p>
                <p className="text-[10px] text-[#94A3B8] mt-0.5">{badge.description}</p>
                <div className="mt-2 flex items-center justify-center gap-1"><Zap size={10} className="text-[#D4AF37]" /><span className="text-[10px] font-bold text-[#D4AF37]">+{badge.xp}</span></div>
                {unlocked && <div className="mt-1.5 flex items-center justify-center gap-1 text-green-600"><CheckCircle size={10} /><span className="text-[9px] font-bold">Desbloqueada</span></div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
