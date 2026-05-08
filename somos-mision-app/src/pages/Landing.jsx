import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Zap, Users, Share2, MapPin, ArrowRight, ChevronDown,
  BookOpen, Send, Award, Star
} from 'lucide-react';
import { globalMetrics, coordinations, users } from '../data/mockData';
import { formatNumber } from '../utils/helpers';
import { LucideIcon } from '../components/common/LucideIcon';

const inView = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

// ── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ onLogin, onRegister }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg,#D4AF37,#E8C547)' }}>
            <Globe size={18} className="text-[#0D1257]" />
          </div>
          <div>
            <span className="font-black text-[#0F172A] text-sm tracking-tight">Somos Misión</span>
            <span className="font-black text-[#1A237E] text-sm tracking-tight"> Colombia</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogin}
            className="text-sm text-[#475569] font-semibold hover:text-[#0F172A] transition px-3 py-2 rounded-xl hover:bg-white/80">
            Iniciar sesión
          </button>
          <button onClick={onRegister}
            className="btn-primary text-sm py-2 px-5 !rounded-xl">
            Unirme
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ Icon, value, label, color, delay }) {
  return (
    <motion.div {...inView(delay)}
      className="card card-hover p-5 flex flex-col gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1.5px solid ${color}25` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-3xl font-black text-[#0F172A] leading-none tracking-tight">{value}</p>
        <p className="text-sm text-[#64748B] mt-1.5 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

// ── STEP CARD ────────────────────────────────────────────────────────────────
function StepCard({ step, Icon, title, desc, delay }) {
  return (
    <motion.div {...inView(delay)}
      className="card p-6 flex flex-col gap-4 card-hover"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#EEF0FF,#E0E4FF)', border: '1.5px solid rgba(26,35,126,0.15)' }}>
          <Icon size={22} className="text-[#1A237E]" />
        </div>
        <span className="text-4xl font-black text-[#E2E8F0]">{step}</span>
      </div>
      <div>
        <h3 className="font-bold text-[#0F172A] text-base mb-1">{title}</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const top3     = [...users].sort((a, b) => b.xp - a.xp).slice(0, 3);
  const medalColors = ['#D4AF37', '#9EB3BF', '#B87333'];

  return (
    <div className="min-h-screen bg-white font-inter overflow-x-hidden">
      <Nav onLogin={() => navigate('/login')} onRegister={() => navigate('/register')} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="grad-hero min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(212,175,55,0.15) 0%,transparent 70%)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(26,35,126,0.3) 0%,transparent 70%)' }} />
        </div>

        {/* Generated Colombia map image — centered or right side */}
        <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center md:justify-end overflow-hidden opacity-40 md:opacity-50">
          <img
            src="/hero-map.png"
            alt=""
            aria-hidden="true"
            className="object-contain w-full h-full md:max-w-3xl transform md:translate-x-1/4 mix-blend-screen"
          />
        </div>

        <div className="max-w-6xl mx-auto px-5 py-28 md:py-32 relative z-10 w-full flex flex-col md:flex-row items-center">
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22,1,0.36,1] }} className="max-w-2xl text-center md:text-left">

            {/* Pill badge */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 mb-8"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold-500)', boxShadow: '0 0 8px var(--gold-500)' }} />
              <span className="text-white/80 text-[0.8125rem] font-medium tracking-wide">
                Red Nacional · IPUC · {globalMetrics.totalEmbajadores.toLocaleString()} Embajadores
              </span>
            </motion.div>

            <h1 className="t-display text-white mb-6" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
              Somos <span className="shimmer-gold">Misión</span>
              <br />Colombia
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto md:mx-0 font-medium">
              La red de embajadores digitales de Misiones Nacionales de la IPUC.
              Centraliza, comparte y mide el impacto en cada rincón de nuestra nación.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')}
                className="btn-gold w-full sm:w-auto text-[0.9375rem] px-8 py-3.5">
                Unirme ahora <ArrowRight size={17} />
              </motion.button>
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto text-[0.9375rem] px-8 py-3.5 rounded-full font-semibold transition flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff', backdropFilter: 'blur(12px)'
                }}>
                Iniciar sesión
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <ChevronDown size={24} />
          </motion.div>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F0F2F8] py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="section-label">Impacto Real</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A]">Colombia está siendo alcanzada</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard Icon={Users}  value={formatNumber(globalMetrics.totalEmbajadores)}      label="Embajadores activos"      color="#1A237E" delay={0}    />
            <MetricCard Icon={Share2} value={formatNumber(globalMetrics.contenidosCompartidos)}  label="Contenidos compartidos"   color="#D4AF37" delay={0.08} />
            <MetricCard Icon={MapPin} value={globalMetrics.regionesConectadas}                   label="Regiones conectadas"      color="#5C1800" delay={0.16} />
            <MetricCard Icon={Zap}    value={formatNumber(globalMetrics.xpGenerado)}             label="XP generado en la red"   color="#2E7D32" delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="section-label">Proceso Simple</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A]">¿Cómo funciona?</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StepCard step="01" Icon={BookOpen} title="Accede al contenido" desc="Encuentra publicaciones oficiales en el Hub de Contenido." delay={0}    />
            <StepCard step="02" Icon={Send}     title="Compártelo"          desc="Distribuye por WhatsApp, redes sociales y más canales."   delay={0.08} />
            <StepCard step="03" Icon={Zap}      title="Gana XP"             desc="Cada acción suma puntos, sube tu nivel y desbloquea insignias." delay={0.16} />
            <StepCard step="04" Icon={Globe}    title="Impacta vidas"       desc="Tu alcance digital multiplica el evangelio en Colombia." delay={0.24} />
          </div>
        </div>
      </section>

      {/* ── COORDINACIONES ───────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-[#F0F2F8]">
        <div className="max-w-6xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="section-label">Áreas Misionales</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A]">Coordinaciones</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {coordinations.map((c, i) => (
              <motion.div key={c.id} {...inView(i * 0.07)}
                className="card card-hover p-5 flex flex-col items-center text-center gap-3 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${c.color}15`, border: `1.5px solid ${c.color}30` }}>
                  <LucideIcon name={c.icon} size={22} style={{ color: c.color }} />
                </div>
                <div>
                  <h4 className="text-[#0F172A] font-semibold text-sm leading-tight mb-1">{c.name}</h4>
                  <p className="text-[#94A3B8] text-xs">{c.members.toLocaleString()} miembros</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RANKING TEASER ───────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...inView()} className="text-center mb-12">
            <p className="section-label">Hall de Honor</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A]">Top Embajadores</h2>
          </motion.div>
          <div className="max-w-md mx-auto space-y-3">
            {top3.map((u, i) => (
              <motion.div key={u.id} {...inView(i * 0.1)}
                className="card card-hover p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${medalColors[i]}20`, border: `2px solid ${medalColors[i]}` }}>
                  <Award size={16} style={{ color: medalColors[i] }} />
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white"
                  style={{ background: u.avatarColor }}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A] text-sm">{u.name.split(' ').slice(0,2).join(' ')}</p>
                  <p className="text-xs text-[#94A3B8]">Nivel {u.level}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#FBF6E2] px-2.5 py-1 rounded-lg flex-shrink-0">
                  <Zap size={12} className="text-[#D4AF37]" fill="#D4AF37" />
                  <span className="font-black text-sm text-[#0F172A]">{u.xp.toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...inView(0.3)} className="text-center mt-8">
            <button onClick={() => navigate('/login')}
              className="btn-primary inline-flex items-center gap-2">
              Ver ranking completo <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── QUOTE ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-[#F0F2F8]">
        <div className="max-w-3xl mx-auto">
          <motion.div {...inView()}
            className="card p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(212,175,55,0.12) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle,rgba(26,35,126,0.06) 0%,transparent 70%)', transform: 'translate(-30%,30%)' }} />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-7 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#EEF0FF,#E0E4FF)', border: '1.5px solid rgba(26,35,126,0.15)' }}>
                <Star size={24} className="text-[#1A237E]" />
              </div>
              <blockquote className="text-2xl md:text-3xl font-black text-[#0F172A] leading-snug mb-5">
                "Una nación conectada en la misión,<br className="hidden md:block" /> unida en la visión."
              </blockquote>
              <p className="text-[#94A3B8] text-sm font-medium">— Misiones Nacionales IPUC</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="hero-gradient py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...inView()}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-7 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Globe size={28} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
              Sé un multiplicador<br />de la visión
            </h2>
            <p className="text-white/65 text-lg mb-10 max-w-md mx-auto">
              Únete a la red de embajadores más grande de la IPUC. Tu voz digital puede llevar esperanza a toda Colombia.
            </p>
            <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="btn-gold text-base inline-flex items-center gap-2">
              Hacer parte de la red <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0D1257] py-10 px-5">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
              <Globe size={14} className="text-[#D4AF37]" />
            </div>
            <span className="text-white font-bold text-sm">Somos Misión Colombia · IPUC</span>
          </div>
          <p className="text-white/30 text-xs">© 2024 Misiones Nacionales IPUC. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
