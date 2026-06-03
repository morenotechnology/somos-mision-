import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Building2, Filter, Megaphone, Search, SearchX, Send, SlidersHorizontal } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import EmptyState from '../components/common/EmptyState';
import { api } from '../api';

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

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <div className="flex items-start gap-4">
          <div className="icon-box icon-box-lg bg-[#EEF0FF] text-[#1A237E]"><BookOpen size={22} /></div>
          <div className="min-w-0"><p className="eyebrow">Contenido nacional</p><h2 className="page-title">Hub de Contenido</h2><p className="page-subtitle">Publicaciones oficiales listas para copiar, filtrar y compartir.</p></div>
        </div>

        <div className="hub-stat-grid">
          {hubStats.map(({ label, value, Icon, color }, index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.04 }} className="schema-stat">
              <span className="schema-stat-icon" style={{ background: `${color}16`, color }}><Icon size={15} /></span>
              <span><strong>{value.toLocaleString()}</strong><small>{label}</small></span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="toolbar-panel">
        <div className="toolbar-row">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-4)' }} />
            <input className="input-base pl-10" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título o descripción..." />
          </div>

          <div className="filter-select-wrap">
            <Filter size={14} />
            <select className="filter-select" value={coord} onChange={(e) => setCoord(e.target.value)}>
              <option value="">Todas las coordinaciones</option>
              {data.coordinations.map((coordination) => <option key={coordination.id} value={coordination.id}>{coordination.name}</option>)}
            </select>
          </div>
        </div>

        <div className="toolbar-row toolbar-row-compact">
          <div className="segmented-control">
            {formats.map((option) => <button key={option} onClick={() => setFormat(option)} className={format === option ? 'active' : ''}>{option === 'Todos' ? option : option.charAt(0).toUpperCase() + option.slice(1)}</button>)}
          </div>

          <div className="segmented-control segmented-control-gold ml-auto">
            {sorts.map((option) => <button key={option} onClick={() => setSort(option)} className={sort === option ? 'active' : ''}>{option}</button>)}
          </div>
        </div>
      </motion.div>

      <div className="result-strip">
        <span className="flex items-center gap-2"><SlidersHorizontal size={14} />{data.items.length} contenido{data.items.length !== 1 ? 's' : ''} encontrado{data.items.length !== 1 ? 's' : ''}</span>
        <span>{sort}</span>
      </div>

      {loading ? (
        <div className="card p-8 text-sm text-[#475569]">Cargando contenidos...</div>
      ) : data.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{data.items.map((item, i) => <ContentCard key={item.id} item={item} delay={i * 0.06} />)}</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16">
          <EmptyState icon={SearchX} title="Sin resultados" description="Prueba con otros filtros o palabras clave." />
        </motion.div>
      )}
    </div>
  );
}
