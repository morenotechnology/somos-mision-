import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import { contentItems, coordinations } from '../data/mockData';

const formats = ['Todos', 'imagen', 'video', 'texto', 'carrusel'];
const sorts = ['Recientes', 'Populares', 'Destacados'];

export default function Hub() {
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('Todos');
  const [coord, setCoord] = useState('');
  const [sort, setSort] = useState('Recientes');

  const filtered = contentItems
    .filter((c) => {
      const q = query.toLowerCase();
      return (
        (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
        (format === 'Todos' || c.format === format) &&
        (!coord || c.coordination === coord)
      );
    })
    .sort((a, b) => {
      if (sort === 'Populares') return b.shares - a.shares;
      if (sort === 'Destacados') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-black text-[#0F172A]">Hub de Contenido 📚</h2>
        <p className="text-[#475569] text-sm mt-1">Encuentra, copia y comparte contenido oficial.</p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-4 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            className="input-base pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título o descripción..."
          />
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 flex-wrap">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  format === f
                    ? 'bg-[#1A237E] text-white'
                    : 'bg-[#F5F7FA] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {f === 'Todos' ? f : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <select
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#F5F7FA] text-[#475569] border-0 outline-none"
            value={coord}
            onChange={(e) => setCoord(e.target.value)}
          >
            <option value="">Todas las coordinaciones</option>
            {coordinations.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="ml-auto flex gap-1">
            {sorts.map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  sort === s
                    ? 'bg-[#D4AF37]/20 text-[#8B6914]'
                    : 'bg-[#F5F7FA] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <p className="text-xs text-[#94A3B8] font-medium">
        {filtered.length} contenido{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item, i) => (
            <ContentCard key={item.id} item={item} delay={i * 0.06} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-[#0F172A] font-bold mb-2">Sin resultados</h3>
          <p className="text-[#475569] text-sm">Prueba con otros filtros o palabras clave.</p>
        </motion.div>
      )}
    </div>
  );
}
