import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Menu,
  X,
  Send,
  Share2,
  Star,
  Users,
  Zap,
  ChevronDown,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { api } from '../api';
import { formatNumber } from '../utils/helpers';
import BrandLogo from '../components/common/BrandLogo';
import { LucideIcon } from '../components/common/LucideIcon';
import regionAmazonica from '../assets/regiones/AMAZONICA_1.png';
import regionAndina from '../assets/regiones/ANDINA_1.png';
import regionCaribe from '../assets/regiones/CARIBE_1.png';
import regionOrinoquia from '../assets/regiones/ORINOQUIA_1.png';
import regionPacifica from '../assets/regiones/PACIFICA_1.png';
import heroBrandLogo from '../assets/logos/logosinfondo.png';
import amigosLogo from '../assets/logos/5.000 Amigos.png';
import amigosOldLogo from '../assets/logos/LOGO 5000 AMIGOS.svg';
import unanimesLogo from '../assets/logos/1.png';

/* ─── Animation variants ─────────────────────────────────────────────── */
const fadeUp = (delay = 0, distance = 28) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-72px' },
  transition: { delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
});

const steps = [
  {
    Icon: BookOpen,
    title: 'Recibe contenido oficial',
    desc: 'Publicaciones, comunicados y piezas listas para usar desde un solo hub centralizado.',
    number: '01',
  },
  {
    Icon: Send,
    title: 'Comparte en tus canales',
    desc: 'Activa WhatsApp y redes sociales sin perder consistencia en el mensaje.',
    number: '02',
  },
  {
    Icon: Zap,
    title: 'Suma XP y evidencia',
    desc: 'Cada acción alimenta actividad, ranking y trazabilidad para toda la red.',
    number: '03',
  },
  {
    Icon: Globe,
    title: 'Conecta el territorio',
    desc: 'Congregaciones, distritos y coordinaciones trabajando con una misma señal.',
    number: '04',
  },
];

const territoryStories = [
  {
    region: 'Amazonía',
    title: 'Comunidades ribereñas y nuevos puntos de misión',
    image: regionAmazonica,
    tone: '#1F7A4D',
  },
  {
    region: 'Caribe',
    title: 'Costa, islas y ciudades conectadas por una misma señal',
    image: regionCaribe,
    tone: '#00838F',
  },
  {
    region: 'Andina',
    title: 'Distritos de montaña con embajadores digitales activos',
    image: regionAndina,
    tone: '#C5931A',
  },
  {
    region: 'Pacífica',
    title: 'Selva, costa y comunidades avanzando con contenido oficial',
    image: regionPacifica,
    tone: '#0F766E',
  },
  {
    region: 'Orinoquía',
    title: 'Llanos abiertos, rutas y equipos listos para avanzar',
    image: regionOrinoquia,
    tone: '#B45309',
  },
];

const mobileMenuItems = [
  { label: 'Inicio', target: 'hero' },
  { label: 'Impacto', target: 'metricas' },
  { label: 'Territorio', target: 'territorio' },
  { label: 'Cómo funciona', target: 'como-funciona' },
  { label: 'Coordinaciones', target: 'coordinaciones' },
  { label: 'Ranking', target: 'ranking' },
];

const canonicalCoordinations = [
  {
    id: 'c1',
    name: 'Evangelismo Estudiantil',
    icon: 'GraduationCap',
    color: '#1A237E',
    members_count: 842,
    brief: 'Alcanza estudiantes de colegios, institutos y universidades con presencia espiritual en campus.',
    action: 'Grupos de oración, estudios bíblicos, actividades académicas y evangelismo en campus.',
    metric: 'Campus en misión',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
  },
  {
    id: 'c2',
    name: 'Hospitalaria',
    icon: 'HeartPulse',
    color: '#5C1800',
    members_count: 315,
    brief: 'Evangeliza y acompaña espiritualmente en hospitales, clínicas y centros de atención médica.',
    action: 'Oración por pacientes, visitas, apoyo a familiares, literatura bíblica y consejería.',
    metric: 'Fe que sana',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&q=80',
  },
  {
    id: 'c3',
    name: 'Evangelismo Carcelario',
    icon: 'Scale',
    color: '#283593',
    members_count: 228,
    brief: 'Lleva esperanza y restauración espiritual a personas privadas de la libertad.',
    action: 'Cultos, estudios bíblicos, consejería, restauración familiar y discipulado.',
    metric: 'Sin muros',
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=900&q=80',
  },
  {
    id: 'c4',
    name: 'Asuntos Étnicos',
    icon: 'Leaf',
    color: '#2E7D32',
    members_count: 520,
    brief: 'Lleva el evangelio a comunidades indígenas, afrocolombianas, raizales, palenqueras y pueblo Rom.',
    action: 'Trabajo culturalmente respetuoso entre Wayúu, Arhuacos, Nasa, Misak, Embera, Tikunas y más.',
    metric: 'Pueblos alcanzados',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80',
  },
  {
    id: 'c5',
    name: 'Grupos Especiales',
    icon: 'Heart',
    color: '#6A1B9A',
    members_count: 267,
    brief: 'Alcanza poblaciones que requieren estrategias específicas de evangelización y cuidado.',
    action: 'Acompañamiento a habitantes de calle, personas vulnerables y comunidades de difícil acceso.',
    metric: 'Cuidado integral',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=80',
  },
  {
    id: 'c6',
    name: 'Evangelismo en Medios de Comunicación',
    icon: 'Radio',
    color: '#E65100',
    members_count: 531,
    brief: 'Usa medios digitales y tradicionales para difundir el evangelio con unidad y alcance nacional.',
    action: 'Redes sociales, radio, televisión, streaming, producción audiovisual y publicidad evangelística.',
    metric: 'Señal nacional',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=80',
  },
  {
    id: 'c7',
    name: 'Estadísticas',
    icon: 'BarChart3',
    color: '#00838F',
    members_count: 184,
    brief: 'Recolecta y analiza información de la obra misionera nacional para tomar mejores decisiones.',
    action: 'Seguimiento de iglesias, crecimiento, conversos, bautismos, presencia regional e informes.',
    metric: 'Datos para avanzar',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
  },
  {
    id: 'c8',
    name: 'Capacitación Misionera',
    icon: 'BookOpenCheck',
    color: '#AD1457',
    members_count: 412,
    brief: 'Forma obreros y líderes para el trabajo misionero urbano, rural y transcultural.',
    action: 'Evangelismo, plantación de iglesias, interculturalidad, liderazgo, discipulado y estrategia.',
    metric: 'Obreros formados',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80',
  },
  {
    id: 'c9',
    name: 'Evangelismo Nacional',
    icon: 'Map',
    color: '#0B5D91',
    members_count: 760,
    brief: 'Coordina la expansión del evangelio en zonas urbanas y rurales de Colombia.',
    action: 'Apertura de nuevas obras, campañas evangelísticas, plantación de iglesias y apoyo misionero.',
    metric: 'Nuevas obras',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80',
  },
  {
    id: 'c10',
    name: 'Instituciones Públicas',
    icon: 'Landmark',
    color: '#8B5CF6',
    members_count: 236,
    brief: 'Lleva el evangelio a entidades gubernamentales, estatales y fuerza pública.',
    action: 'Estudios bíblicos, consejería, capellanías y eventos institucionales.',
    metric: 'Puertas abiertas',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80',
  },
  {
    id: 'c11',
    name: 'Restauración Espiritual',
    icon: 'RefreshCw',
    color: '#16A34A',
    members_count: 305,
    brief: 'Busca y restaura personas alejadas de Dios o de la congregación.',
    action: 'Seguimiento, visitas, consejería, reintegración y discipulado para recuperar vidas.',
    metric: 'Vidas restauradas',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=900&q=80',
  },
  {
    id: 'c12',
    name: 'Población Sorda, Ciega y Sordociega',
    icon: 'HandHeart',
    color: '#C2410C',
    members_count: 148,
    brief: 'Garantiza que personas con discapacidad auditiva o visual reciban el evangelio sin barreras.',
    action: 'Interpretación en lengua de señas, formación de intérpretes, material adaptado y cultos inclusivos.',
    metric: 'Misión inclusiva',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80',
  },
];

const coordinationDetails = Object.fromEntries(canonicalCoordinations.map((item) => [item.id, item]));

/* ─── Nav ─────────────────────────────────────────────────────────────── */
function Nav({ onLogin, onRegister }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`ln-nav ${scrolled ? 'is-scrolled' : ''}`}
    >
      <div className="ln-container ln-nav-inner">
        <button className="ln-brand" onClick={onRegister} aria-label="Misiones Nacionales">
          <span className="ln-brand-mark">
            <BrandLogo decorative />
          </span>
          <span className="ln-brand-name">
            <strong>Misiones</strong>
            <span>Colombia</span>
          </span>
        </button>
        <nav className="ln-nav-actions" aria-label="Navegación principal">
          <button type="button" id="nav-login" onClick={onLogin} className="ln-btn-ghost">
            Iniciar sesión
          </button>
          <button type="button" id="nav-register" onClick={onRegister} className="ln-btn-primary ln-btn-sm">
            Unirme <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </nav>
      </div>
    </motion.header>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────── */
function Hero({ metrics, schema, onRegister, onLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const goToSection = (target) => {
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <section className="ln-hero" id="hero">
      <motion.div className="ln-hero-bg" aria-hidden="true">
        <img src="/bg-pueblo.png" alt="" />
        <div className="ln-hero-bg-overlay" />
      </motion.div>

      <div className="ln-hero-grain" aria-hidden="true" />
      <div className="ln-hero-fade-bottom" aria-hidden="true" />

      <motion.div
        className="ln-mobile-hero-card"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ln-mobile-hero-top">
          <div className="ln-mobile-hero-brand">
            <span className="ln-mobile-hero-logo"><BrandLogo decorative /></span>
            <span>Misiones<br />Nacionales</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
            aria-controls="landing-mobile-menu"
            aria-expanded={mobileMenuOpen}
            className="ln-mobile-hero-menu"
          >
            <Menu size={22} strokeWidth={2.7} />
          </button>
        </div>
        <img src="/hero-map.png" alt="" className="ln-mobile-hero-map" />
        <img src={amigosLogo} alt="" className="ln-mobile-hero-photo ln-mobile-hero-amigos" />
        <div className="ln-mobile-hero-status">
          <div>
            <span>Misiones Nacionales</span>
            <strong>{metrics.totalEmbajadores.toLocaleString()} embajadores activos</strong>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              className="ln-mobile-menu-backdrop"
              aria-label="Cerrar menú"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              id="landing-mobile-menu"
              className="ln-mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menú principal"
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ln-mobile-menu-head">
                <div className="ln-mobile-menu-brand">
                  <span><BrandLogo decorative /></span>
                  <strong>Misiones Nacionales</strong>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
                  <X size={20} strokeWidth={2.6} />
                </button>
              </div>

              <nav className="ln-mobile-menu-links" aria-label="Secciones de la landing">
                {mobileMenuItems.map((item, index) => (
                  <motion.button
                    key={item.target}
                    type="button"
                    onClick={() => goToSection(item.target)}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + index * 0.035, duration: 0.26 }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {item.label}
                  </motion.button>
                ))}
              </nav>

              <div className="ln-mobile-menu-actions">
                <button type="button" className="ln-btn-outline ln-btn-lg" onClick={() => { setMobileMenuOpen(false); onLogin(); }}>
                  Iniciar sesión
                </button>
                <button type="button" className="ln-btn-primary ln-btn-lg" onClick={() => { setMobileMenuOpen(false); onRegister(); }}>
                  Unirme <ArrowRight size={17} strokeWidth={2.4} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.div
        className="ln-hero-collage"
        initial={{ opacity: 0, scale: 0.94, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      >
        <img src="/hero-map.png" alt="" className="ln-hero-map" />
        <img src={amigosLogo} alt="" className="ln-hero-polaroid is-one is-amigos-logo" />
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80" alt="" className="ln-hero-polaroid is-two" />
      </motion.div>

      <motion.div className="ln-container ln-hero-inner">
        <motion.div {...fadeUp(0.1)} className="ln-hero-pill">
          <span className="ln-hero-pill-dot" />
          <BrandLogo decorative className="ln-pill-logo" />
          <span>Misiones Nacionales</span>
          <span className="ln-hero-pill-sep" />
          <strong>{metrics.totalEmbajadores.toLocaleString()} embajadores activos</strong>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="ln-hero-headline">
          <h1 className="ln-hero-hidden-title">Somos Misión Colombia</h1>
          <div className="ln-hero-logo-headline" aria-hidden="true">
            <img src={heroBrandLogo} alt="" />
          </div>
        </motion.div>

        <motion.p {...fadeUp(0.32)} className="ln-hero-sub">
          Somos Misión Colombia es una iniciativa de Misiones Nacionales de las Iglesias Pentecostales Unidas de Colombia para anunciar el evangelio en todo el territorio nacional. Por medio de Biblias y testimonios, articula iglesias, distritos, misioneros nacionales y creyentes para que el mensaje de Jesucristo llegue a cada región del país. No es solo una campaña: es un compromiso espiritual.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.42)} className="ln-hero-actions">
          <button id="hero-register" type="button" onClick={onRegister} className="ln-btn-primary ln-btn-lg">
            Unirme ahora <ArrowRight size={19} strokeWidth={2.3} />
          </button>
          <button id="hero-login" type="button" onClick={onLogin} className="ln-btn-outline ln-btn-lg">
            Iniciar sesión
          </button>
        </motion.div>

        <motion.div {...fadeUp(0.52)} className="ln-hero-proof">
          <span><CheckCircle2 size={14} strokeWidth={2.2} />{schema.publicaciones} publicaciones</span>
          <span><Building2 size={14} strokeWidth={2.2} />{schema.congregaciones} congregaciones</span>
          <span><Star size={14} strokeWidth={2.2} />{schema.comunicadosActivos} comunicados activos</span>
          <span><Users size={14} strokeWidth={2.2} />{metrics.totalEmbajadores.toLocaleString()} embajadores</span>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="ln-scroll-hint"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <ChevronDown size={22} strokeWidth={1.8} />
      </motion.div>
    </section>
  );
}

/* ─── Metrics band ────────────────────────────────────────────────────── */
function MetricsBand({ metrics }) {
  const items = [
    { Icon: Users, value: formatNumber(metrics.totalEmbajadores), label: 'Embajadores activos', note: 'Perfiles beta', color: '#1A237E' },
    { Icon: Share2, value: formatNumber(metrics.contenidosCompartidos), label: 'Contenidos compartidos', note: 'Impacto social', color: '#C5931A' },
    { Icon: MapPin, value: metrics.regionesConectadas, label: 'Regiones conectadas', note: 'Cobertura nacional', color: '#00838F' },
    { Icon: Zap, value: formatNumber(metrics.xpGenerado), label: 'XP generado', note: 'Actividad trazable', color: '#2E7D32' },
  ];

  return (
    <section className="ln-metrics-band" id="metricas">
      <div className="ln-container">
        <motion.div {...fadeUp(0)} className="ln-band-header">
          <p className="ln-eyebrow"><TrendingUp size={13} strokeWidth={2.5} /> Impacto nacional</p>
          <h2>Indicadores limpios para una red que se mueve rápido</h2>
          <p className="ln-band-desc">Una lectura nacional del avance misionero, conectada a regiones, contenidos y embajadores.</p>
        </motion.div>
        <div className="ln-metrics-shell">
          <div className="ln-metrics-image is-logo" aria-hidden="true">
            <img src={amigosOldLogo} alt="" />
            <span>5000 amigos</span>
          </div>
          <div className="ln-metrics-grid">
            {items.map((item, i) => (
              <motion.div key={item.label} {...fadeUp(i * 0.08)} className="ln-metric-card" style={{ '--metric-color': item.color }}>
                <div className="ln-metric-top">
                  <div className="ln-metric-icon">
                    <item.Icon size={20} strokeWidth={2.15} />
                  </div>
                  <span className="ln-metric-note">{item.note}</span>
                </div>
                <strong className="ln-metric-value">{item.value}</strong>
                <span className="ln-metric-label">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TerritorySection() {
  return (
    <section className="ln-territory-section" id="territorio">
      <div className="ln-container">
        <motion.div {...fadeUp(0)} className="ln-band-header">
          <p className="ln-eyebrow"><MapPin size={13} strokeWidth={2.5} /> Territorio</p>
          <h2>Colombia como escenario vivo de la misión</h2>
          <p className="ln-band-desc">La identidad visual mezcla paisajes, cultura y acción digital para que el proyecto se sienta propio desde la primera pantalla.</p>
        </motion.div>

        <div className="ln-territory-grid">
          {territoryStories.map((story, index) => (
            <motion.article
              key={story.region}
              {...fadeUp(index * 0.09)}
              className={`ln-territory-card ${index === 0 ? 'is-featured' : ''}`}
              style={{ '--story-color': story.tone }}
            >
              <span className="ln-territory-atmosphere" aria-hidden="true" />
              <img src={story.image} alt="" className="ln-territory-backdrop" loading="lazy" decoding="async" />
              <span className="ln-territory-glow" aria-hidden="true" />
              <motion.img
                src={story.image}
                alt=""
                className="ln-territory-art"
                loading="lazy"
                decoding="async"
                aria-hidden="true"
                style={{ '--art-rotate': `${index % 2 === 0 ? -3.5 : 3.5}deg` }}
                initial={{ opacity: 0, y: 20, scale: 0.92, rotate: index % 2 === 0 ? -7 : 7 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: index % 2 === 0 ? -3.5 : 3.5 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: 0.12 + index * 0.05, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="ln-territory-shade" />
              <div className="ln-territory-content">
                <span>{story.region}</span>
                <h3>{story.title}</h3>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Steps section with pueblo BG ───────────────────────────────────── */
function StepsSection() {
  return (
    <section className="ln-steps-section" id="como-funciona">
      <div className="ln-steps-bg" aria-hidden="true">
        <img src="/bg-pueblo.png" alt="" />
        <div className="ln-steps-bg-overlay" />
      </div>

      <div className="ln-container ln-steps-inner">
        <motion.div {...fadeUp(0)} className="ln-band-header">
          <p className="ln-eyebrow"><Radio size={13} strokeWidth={2.5} /> Flujo operativo</p>
          <h2>Del contenido oficial a la acción medible</h2>
          <p className="ln-band-desc">Una secuencia simple para que el equipo nacional y cada multiplicador trabajen con la misma estructura.</p>
        </motion.div>

        <div className="ln-steps-grid">
          {steps.map((step, i) => (
            <motion.article key={step.title} {...fadeUp(i * 0.1 + 0.05)} className="ln-step-card">
              <div className="ln-step-top">
                <div className="ln-step-icon">
                  <step.Icon size={20} strokeWidth={2} />
                </div>
                <span className="ln-step-num">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Coordinations ───────────────────────────────────────────────────── */
function CoordinationsSection({ coordinations }) {
  const incomingById = new Map((coordinations || []).map((item) => [item.id, item]));
  const visibleCoordinations = canonicalCoordinations.map((base) => {
    const incoming = incomingById.get(base.id) || {};
    return {
      ...base,
      ...incoming,
      name: base.name,
      icon: base.icon,
      color: base.color,
      members_count: incoming.members_count || incoming.members || base.members_count,
    };
  });
  const totalMembers = visibleCoordinations.reduce((sum, item) => sum + (item.members_count || item.members || 0), 0);

  return (
    <section className="ln-section ln-coord-section" id="coordinaciones">
      <div className="ln-coord-bg" aria-hidden="true" />
      <div className="ln-container ln-coord-wrap">
        <motion.div {...fadeUp(0)} className="ln-coord-showcase">
          <div className="ln-coord-showcase-copy">
            <p className="ln-eyebrow is-light"><Globe size={13} strokeWidth={2.5} /> Coordinaciones nacionales</p>
            <h2>Un solo movimiento, múltiples frentes de misión</h2>
            <p>
              Cada coordinación opera con identidad propia, pero conectada a la misma visión: contenido oficial,
              acción territorial y seguimiento medible para anunciar el evangelio en cada región.
            </p>
            <div className="ln-coord-proof">
              <span><strong>{visibleCoordinations.length}</strong> coordinaciones</span>
              <span><strong>{formatNumber(totalMembers || 3967)}</strong> miembros activos</span>
              <span><strong>5</strong> regiones conectadas</span>
            </div>
          </div>
          <div className="ln-coord-showcase-brand" aria-hidden="true">
            <span>aliados de visión</span>
            <img src={unanimesLogo} alt="" />
          </div>
        </motion.div>

        <div className="ln-coord-grid">
          {visibleCoordinations.map((item, i) => {
            const detail = coordinationDetails[item.id] || {
              brief: 'Equipo nacional conectado a contenido, acción y medición.',
              action: 'Campañas, recursos y seguimiento para la iglesia local.',
              metric: 'Misión activa',
            };
            const members = item.members_count || item.members || 0;

            return (
              <motion.article
                key={item.id}
                {...fadeUp(i * 0.06)}
                className="ln-coord-card"
                style={{ '--coord-color': item.color || '#0B5D91' }}
              >
                <div className="ln-coord-card-top">
                  <div className="ln-coord-icon">
                    <LucideIcon name={item.icon} size={24} />
                  </div>
                  <span className="ln-coord-number">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <div className="ln-coord-card-media" aria-hidden="true">
                  <img src={detail.image} alt="" loading="lazy" decoding="async" />
                  <span>{detail.metric}</span>
                </div>

                <div className="ln-coord-body">
                  <h3>{item.name}</h3>
                  <p>{detail.brief}</p>
                </div>

                <div className="ln-coord-action">
                  <span>Acción clave</span>
                  <strong>{detail.action}</strong>
                </div>

                <div className="ln-coord-footer">
                  <span><Users size={14} /> {(members || 0).toLocaleString()} miembros</span>
                  <span><Radio size={14} /> Nacional</span>
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div {...fadeUp(0.12)} className="ln-coord-ribbon">
          <div>
            <span>Una misión compartida</span>
            <strong>Coordinaciones, iglesias y creyentes avanzando bajo una misma señal nacional.</strong>
          </div>
          <img src={unanimesLogo} alt="Unánimes en la misión" />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Ranking section ─────────────────────────────────────────────────── */
function RankingSection({ topUsers, onLogin }) {
  const medalColors = ['#D4AF37', '#9EB3BF', '#B87333'];
  const medalLabels = ['Oro', 'Plata', 'Bronce'];

  return (
    <section className="ln-ranking-section" id="ranking">
      {/* Subtle palms bg on left */}
      <div className="ln-ranking-bg" aria-hidden="true">
        <img src={amigosLogo} alt="" />
        <div className="ln-ranking-bg-overlay" />
      </div>

      <div className="ln-container">
        <div className="ln-ranking-layout">
          {/* Left: copy */}
          <div className="ln-ranking-copy">
            <motion.div {...fadeUp(0)}>
              <p className="ln-eyebrow"><Award size={13} strokeWidth={2.5} /> Hall de Honor</p>
              <h2>Top Embajadores</h2>
              <p className="ln-band-desc is-left">El ranking convierte la participación en reconocimiento visible para toda la red nacional.</p>
            </motion.div>
            <motion.button {...fadeUp(0.18)} id="ranking-cta" type="button" onClick={onLogin} className="ln-btn-primary ln-btn-lg">
              Ver ranking completo <ArrowRight size={18} strokeWidth={2.3} />
            </motion.button>
          </div>

          {/* Right: cards */}
          <div className="ln-ranking-list">
            {topUsers.map((user, i) => (
              <motion.article key={user.id} {...fadeUp(i * 0.1 + 0.05)} className="ln-ranking-card">
                <div
                  className="ln-medal"
                  style={{ background: `${medalColors[i]}18`, color: medalColors[i], borderColor: `${medalColors[i]}44` }}
                  title={medalLabels[i]}
                >
                  <Award size={16} strokeWidth={2} />
                </div>
                <div className="ln-avatar" style={{ background: user.avatarColor }}>
                  {user.avatar}
                </div>
                <div className="ln-rank-info">
                  <strong>{user.name.split(' ').slice(0, 2).join(' ')}</strong>
                  <small>Nivel {user.level}</small>
                </div>
                <div className="ln-xp-badge">
                  <Zap size={13} fill="currentColor" strokeWidth={0} />
                  {user.xp.toLocaleString()}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ───────────────────────────────────────────────────────── */
function FinalCTA({ onRegister }) {
  return (
    <section className="ln-final-cta" id="unirme">
      <div className="ln-final-bg" aria-hidden="true">
        <img src="/bg-pueblo.png" alt="" />
        <div className="ln-final-bg-overlay" />
      </div>
      <div className="ln-container">
        <motion.div {...fadeUp(0)} className="ln-final-inner">
          <div className="ln-final-brand-row">
            <div className="ln-final-badge">
              <BrandLogo decorative />
            </div>
            <div>
              <span>Misiones Nacionales</span>
              <strong>Somos una misión</strong>
            </div>
          </div>
          <div className="ln-final-logo-lockup" aria-hidden="true">
            <img src={heroBrandLogo} alt="" />
          </div>
          <h2>Activa tu iglesia en la red nacional</h2>
          <p>Comparte contenido oficial, conecta coordinaciones y registra el avance misionero con una experiencia clara, móvil y medible.</p>
          <div className="ln-final-actions">
            <motion.button
              {...fadeUp(0.18)}
              id="final-register"
              type="button"
              onClick={onRegister}
              className="ln-btn-primary ln-btn-xl"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Unirme ahora <ArrowRight size={20} strokeWidth={2.3} />
            </motion.button>
            <div className="ln-final-amigos" aria-hidden="true">
              <img src={amigosLogo} alt="" />
              <span>Red nacional activa</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="ln-footer">
      <div className="ln-container ln-footer-inner">
        <div className="ln-footer-brand">
          <span className="ln-footer-mark"><BrandLogo decorative /></span>
          <span>Misiones Nacionales</span>
        </div>
        <p>Red Nacional — {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

/* ─── Root ────────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    globalMetrics: null,
    schemaMetrics: null,
    coordinations: [],
    topUsers: [],
  });

  useEffect(() => {
    let active = true;
    api.bootstrap()
      .then((payload) => {
        if (!active) return;
        setData({
          globalMetrics: payload.globalMetrics,
          schemaMetrics: payload.schemaMetrics,
          coordinations: payload.coordinations || [],
          topUsers: payload.topUsers || [],
        });
      })
      .catch(() => {
        if (!active) return;
        setData((c) => ({ ...c }));
      });
    return () => { active = false; };
  }, []);

  const metrics = data.globalMetrics || {
    totalEmbajadores: 0,
    contenidosCompartidos: 0,
    regionesConectadas: 0,
    xpGenerado: 0,
  };
  const schema = data.schemaMetrics || { publicaciones: 0, congregaciones: 0, comunicadosActivos: 0 };

  const toLogin = () => navigate('/login');
  const toRegister = () => navigate('/register');

  return (
    <div className="ln-page">
      <Nav onLogin={toLogin} onRegister={toRegister} />
      <main>
        <Hero metrics={metrics} schema={schema} onRegister={toRegister} onLogin={toLogin} />
        <MetricsBand metrics={metrics} />
        <TerritorySection />
        <StepsSection />
        <CoordinationsSection coordinations={data.coordinations} />
        <RankingSection topUsers={data.topUsers} onLogin={toLogin} />
        <FinalCTA onRegister={toRegister} />
      </main>
      <Footer />
    </div>
  );
}
