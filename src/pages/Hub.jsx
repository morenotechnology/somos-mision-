import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Building2, Filter, Megaphone, Search, SearchX, Send, SlidersHorizontal, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import EmptyState from '../components/common/EmptyState';
import { api } from '../api';
import { formatNumber } from '../utils/helpers';

const formats = ['Todos', 'imagen', 'video', 'texto', 'carrusel'];
const sorts = ['Recientes', 'Populares', 'Destacados'];

export default function Hub() {
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('Todos');
  const [coord, setCoord] = useState('');
  const [sort, setSort] = useState('Recientes');
  const [data, setData] = useState({ items: [], coordinations: [], schemaMetrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHub() {
      setLoading(true);
      try {
        const payload = await api.hub.list({ q: query, format, coordination: coord, sort });
        if (!active) return;
        setData(payload);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHub();
    return () => { active = false; };
  }, [query, format, coord, sort]);

  const hubStats = [
    { label: 'Publicaciones', value: data.schemaMetrics.publicaciones || 0, Icon: BookOpen, color: '#1A237E' },
    { label: 'Compartidos', value: data.schemaMetrics.compartidos || 0, Icon: Send, color: '#D4AF37' },
    { label: 'Comunicados', value: data.schemaMetrics.comunicadosActivos || 0, Icon: Megaphone, color: '#5C1800' },
    { label: 'Congregaciones', value: data.schemaMetrics.congregaciones || 0, Icon: Building2, color: '#2E7D32' },
  ];
  const featuredCount = data.items.filter((item) => item.featured).length;
  const xpAvailable = data.items.reduce((sum, item) => sum + Number(item.xpReward || 0), 0);

  return (
    <div className="content-hub-page">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="content-hub-hero"
      >
        <div className="content-hub-hero-copy">
          <div className="content-hub-orb"><BookOpen size={26} /></div>
          <p className="content-hub-kicker"><Sparkles size={14} /> Contenido nacional</p>
          <h2>Hub de Contenido</h2>
          <span>Piezas oficiales listas para copiar, adaptar y compartir desde una sola biblioteca misionera.</span>
        </div>

        <div className="content-hub-stat-grid">
          {hubStats.map(({ label, value, Icon, color }, index) => (
            <motion.article
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.045 }}
              className="content-hub-stat"
              style={{ '--content-stat-color': color }}
            >
              <div><Icon size={17} /></div>
              <strong>{formatNumber(value)}</strong>
              <span>{label}</span>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="content-toolbar-pro"
      >
        <div className="content-search-row">
          <label className="content-search-pro">
            <Search size={17} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar campaña, testimonio o comunicado..." />
          </label>

          <label className="content-filter-pro">
            <Filter size={16} />
            <select value={coord} onChange={(e) => setCoord(e.target.value)}>
              <option value="">Todas las coordinaciones</option>
              {data.coordinations.map((coordination) => <option key={coordination.id} value={coordination.id}>{coordination.name}</option>)}
            </select>
          </label>
        </div>

        <div className="content-segments-stack">
          <div className="content-segment-pro" role="tablist" aria-label="Formato de contenido">
            {formats.map((option) => (
              <button key={option} type="button" onClick={() => setFormat(option)} className={format === option ? 'is-active' : ''}>
                {option === 'Todos' ? option : option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>

          <div className="content-segment-pro is-gold" role="tablist" aria-label="Orden de contenido">
            {sorts.map((option) => (
              <button key={option} type="button" onClick={() => setSort(option)} className={sort === option ? 'is-active' : ''}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="content-signal-strip">
        <span><SlidersHorizontal size={14} />{data.items.length} contenido{data.items.length !== 1 ? 's' : ''} encontrado{data.items.length !== 1 ? 's' : ''}</span>
        <span><Star size={14} />{featuredCount} destacados</span>
        <span><Zap size={14} />{formatNumber(xpAvailable)} XP disponibles</span>
        <span><TrendingUp size={14} />{sort}</span>
      </div>

      <section className="content-feed-section">
        <div className="content-feed-head">
          <div>
            <p><Megaphone size={13} /> Biblioteca oficial</p>
            <h3>{sort}</h3>
          </div>
          <span>{format === 'Todos' ? 'Todos los formatos' : format}</span>
        </div>

        {loading ? (
          <div className="content-loading-grid">
            {[0, 1, 2].map((item) => <div key={item} className="content-card-skeleton" />)}
          </div>
        ) : data.items.length > 0 ? (
          <div className="content-feed-grid">{data.items.map((item, i) => <ContentCard key={item.id} item={item} delay={i * 0.055} />)}</div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="content-empty-wrap">
            <EmptyState icon={SearchX} title="Sin resultados" description="Prueba con otros filtros o palabras clave." />
          </motion.div>
        )}
      </section>
    </div>
  );
}
