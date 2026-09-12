import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Loader2, Search, SquarePen, X } from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import { api } from '../api';
import { useAppStore } from '../store/useAppStore';
import { canPublish } from '../utils/permissions';
import { contentRegions, getCanonicalCoordinations } from '../utils/coordinations';
import './social-feed.css';

export default function Hub() {
  const currentUser = useAppStore(state => state.currentUser);
  const [query, setQuery] = useState('');
  const [coordination, setCoordination] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState('Recientes');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [data, setData] = useState({ items: [], coordinations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);
  const moreRef = useRef(null);
  const hasFilters = Boolean(query || coordination || region || sort !== 'Recientes');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      api.hub.list({ q: query, coordination, region, sort }).then(payload => {
        if (active) { setData(payload); setVisibleCount(10); }
      }).catch(err => { if (active) setError(err.message || 'No pudimos cargar las noticias.'); })
        .finally(() => { if (active) setLoading(false); });
    }, query ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, coordination, region, sort, retry]);

  useEffect(() => {
    if (!moreRef.current || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount(count => count + 10);
    }, { root: document.querySelector('.app-main-scroll'), rootMargin: '300px' });
    observer.observe(moreRef.current);
    return () => observer.disconnect();
  }, [loading, visibleCount, data.items.length]);

  const reset = () => { setQuery(''); setCoordination(''); setRegion(''); setSort('Recientes'); };
  return <div className="social-feed">
    <header className="social-feed-toolbar">
      <h2>Para ti</h2>
      <div>
        {canPublish(currentUser) && <Link to="/publicar" className="social-publish-link"><SquarePen size={18} />Publicar</Link>}
        <button className={hasFilters ? 'has-filters' : ''} aria-label={filtersOpen ? 'Cerrar filtros' : 'Filtrar noticias'} aria-expanded={filtersOpen} aria-controls="news-filters" onClick={() => setFiltersOpen(open => !open)}>{filtersOpen ? <X size={20} /> : <Filter size={20} />}</button>
      </div>
    </header>
    {filtersOpen && <section id="news-filters" className="social-feed-filters" aria-label="Filtros de noticias">
      <label className="social-feed-search"><Search size={18} /><input aria-label="Buscar noticias" placeholder="Buscar noticias" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label>Coordinación<select value={coordination} onChange={event => setCoordination(event.target.value)}><option value="">Todas las coordinaciones</option>{getCanonicalCoordinations(data.coordinations).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Región<select value={region} onChange={event => setRegion(event.target.value)}><option value="">Todo el país</option>{contentRegions.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Orden<select value={sort} onChange={event => setSort(event.target.value)}>{['Recientes', 'Populares', 'Destacados'].map(value => <option key={value}>{value}</option>)}</select></label>
      {hasFilters && <button className="social-text-button" onClick={reset}>Limpiar filtros</button>}
    </section>}
    <section aria-label="Publicaciones de la red" aria-busy={loading}>
      {loading ? <div className="social-feed-status" role="status"><Loader2 className="spin" size={24} /><p>Cargando noticias…</p></div> : error ? <div className="social-feed-status" role="alert"><p>{error}</p><button onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : data.items.length ? <>
        {data.items.slice(0, visibleCount).map(item => <ContentCard key={item.id} item={item} socialFeed canEdit={canPublish(currentUser)} />)}
        {visibleCount < data.items.length ? <div ref={moreRef} className="social-feed-more"><button onClick={() => setVisibleCount(count => count + 10)}>Ver más publicaciones</button></div> : <p className="social-feed-end">Ya estás al día con la red.</p>}
      </> : <div className="social-feed-status"><Search size={26} /><h3>{hasFilters ? 'No encontramos coincidencias' : 'Pronto habrá noticias aquí'}</h3><p>{hasFilters ? 'Prueba con otra palabra o coordinación.' : 'Las publicaciones de la red aparecerán aquí.'}</p>{hasFilters && <button onClick={reset}>Ver todas las noticias</button>}</div>}
    </section>
  </div>;
}
