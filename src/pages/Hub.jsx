import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BookOpen,
  Building2,
  ExternalLink,
  Filter,
  ImagePlus,
  Link2,
  Loader2,
  Megaphone,
  PlusCircle,
  Search,
  SearchX,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  WandSparkles,
  XCircle,
  Zap,
} from 'lucide-react';
import ContentCard from '../components/content/ContentCard';
import EmptyState from '../components/common/EmptyState';
import { api } from '../api';
import { formatNumber } from '../utils/helpers';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

const sorts = ['Recientes', 'Populares', 'Destacados'];
const filterModes = [
  { id: 'all', label: 'Todos' },
  { id: 'coordination', label: 'Por coordinaciones' },
  { id: 'region', label: 'Por regiones' },
];
const contentRegions = [
  { id: 'r1', name: 'Andina' },
  { id: 'r2', name: 'Caribe' },
  { id: 'r3', name: 'Pacífica' },
  { id: 'r4', name: 'Orinoquía' },
  { id: 'r5', name: 'Amazónica' },
];
const FALLBACK_IMAGE = '/hero-map.png';
const CANONICAL_COORDINATIONS = [
  { id: 'c1', name: 'Evangelismo', icon: 'Megaphone', color: '#1A237E', members_count: 842 },
  { id: 'c2', name: 'Hospitalaria', icon: 'HeartPulse', color: '#5C1800', members_count: 315 },
  { id: 'c3', name: 'Evangelismo Carcelario', icon: 'Scale', color: '#283593', members_count: 228 },
  { id: 'c4', name: 'Asuntos Étnicos', icon: 'Leaf', color: '#2E7D32', members_count: 520 },
  { id: 'c5', name: 'Población Vulnerable y Especiales', icon: 'Heart', color: '#6A1B9A', members_count: 267 },
  { id: 'c6', name: 'Evangelismo en Medios de Comunicación', icon: 'Radio', color: '#E65100', members_count: 531 },
  { id: 'c7', name: 'Estadísticas', icon: 'BarChart3', color: '#00838F', members_count: 184 },
  { id: 'c8', name: 'Capacitación Misionera', icon: 'BookOpenCheck', color: '#AD1457', members_count: 412 },
  { id: 'c9', name: 'Misión Juvenil', icon: 'Flame', color: '#0B5D91', members_count: 760 },
  { id: 'c10', name: 'Instituciones Públicas', icon: 'Landmark', color: '#8B5CF6', members_count: 236 },
  { id: 'c11', name: 'Restauración Espiritual', icon: 'RefreshCw', color: '#16A34A', members_count: 305 },
  { id: 'c12', name: 'Población Sorda, Ciega y Sordociega', icon: 'HandHeart', color: '#C2410C', members_count: 148 },
];

const publisherInitialState = {
  facebookUrl: '',
  instagramUrl: '',
  title: '',
  description: '',
  imageUrl: '',
  coordinationId: '',
  format: 'imagen',
  featured: false,
};

function normalizePostUrl(value = '') {
  const clean = value.trim();
  if (!clean) return '';
  return /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
}

function isValidHttpUrl(value = '') {
  try {
    const parsed = new URL(normalizePostUrl(value));
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function detectSocialPlatform(url = '') {
  const clean = url.toLowerCase();
  if (clean.includes('instagram.com')) return { id: 'instagram', label: 'Instagram', tone: '#E1306C' };
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com')) {
    return { id: 'facebook', label: 'Facebook', tone: '#1877F2' };
  }
  return { id: 'manual', label: 'Link social', tone: '#1A237E' };
}

function getCanonicalCoordinations(coordinations = []) {
  const incomingById = new Map((coordinations || []).map((item) => [item.id, item]));
  return CANONICAL_COORDINATIONS.map((base) => ({
    ...base,
    ...(incomingById.get(base.id) || {}),
    name: base.name,
    icon: base.icon,
    color: base.color,
    members_count: incomingById.get(base.id)?.members_count || incomingById.get(base.id)?.members || base.members_count,
  }));
}

function isFacebookUrl(url = '') {
  const clean = normalizePostUrl(url).toLowerCase();
  return clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com');
}

function isInstagramUrl(url = '') {
  return normalizePostUrl(url).toLowerCase().includes('instagram.com');
}

async function fetchSocialPreview(sourceUrl) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(sourceUrl)}&screenshot=false&video=false&audio=false`;
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error('No se pudo leer el preview del enlace');
  const payload = await response.json();
  const data = payload?.data || {};
  return {
    title: data.title || '',
    description: data.description || '',
    imageUrl: data.image?.url || data.logo?.url || '',
  };
}

function PastorPublicationComposer({ currentUser, coordinations, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(publisherInitialState);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const facebookUrl = normalizePostUrl(form.facebookUrl);
  const instagramUrl = normalizePostUrl(form.instagramUrl);
  const primaryUrl = facebookUrl || instagramUrl;
  const platform = detectSocialPlatform(primaryUrl);
  const imagePreview = form.imageUrl.trim() || preview?.imageUrl || FALLBACK_IMAGE;
  const previewTitle = form.title.trim() || preview?.title || 'Nueva publicación oficial';
  const previewDescription = form.description.trim() || preview?.description || 'Pega enlaces de Facebook e Instagram para crear una pieza lista para compartir.';
  const composerCoordinations = getCanonicalCoordinations(coordinations);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validateSocialLinks = () => {
    const hasFacebook = Boolean(form.facebookUrl.trim());
    const hasInstagram = Boolean(form.instagramUrl.trim());
    if (!hasFacebook && !hasInstagram) return 'Agrega al menos un enlace de Facebook o Instagram';
    if (hasFacebook && (!isValidHttpUrl(form.facebookUrl) || !isFacebookUrl(form.facebookUrl))) {
      return 'El enlace de Facebook debe ser válido y pertenecer a Facebook';
    }
    if (hasInstagram && (!isValidHttpUrl(form.instagramUrl) || !isInstagramUrl(form.instagramUrl))) {
      return 'El enlace de Instagram debe ser válido y pertenecer a Instagram';
    }
    return '';
  };

  const loadPreview = async () => {
    const validationError = validateSocialLinks();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setPreviewLoading(true);
    try {
      const nextPreview = await fetchSocialPreview(primaryUrl);
      setPreview(nextPreview);
      setForm((current) => ({
        ...current,
        title: current.title || nextPreview.title || '',
        description: current.description || nextPreview.description || '',
        imageUrl: current.imageUrl || nextPreview.imageUrl || '',
      }));
      toast.success(nextPreview.imageUrl ? 'Preview obtenido' : 'Preview listo, agrega una imagen si quieres mejorar la portada');
    } catch {
      toast('La red social bloqueó el preview. Puedes guardar igual agregando título e imagen manual.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const resetForm = () => {
    setForm(publisherInitialState);
    setPreview(null);
    setOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateSocialLinks();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!form.title.trim() && !preview?.title) {
      toast.error('Agrega un título para identificar la publicación');
      return;
    }

    setSaving(true);
    try {
      const socialLinks = [
        facebookUrl ? `Facebook: ${facebookUrl}` : '',
        instagramUrl ? `Instagram: ${instagramUrl}` : '',
      ].filter(Boolean).join('\n');
      const created = await api.publicaciones.create({
        title: previewTitle,
        description: previewDescription,
        category: facebookUrl && instagramUrl ? 'Facebook + Instagram' : platform.label,
        format: form.format,
        coordination_id: form.coordinationId || null,
        featured: form.featured,
        xp_reward: 50,
        copy_text: `${previewTitle}\n\n${socialLinks}`,
        media_url: imagePreview,
        source_url: primaryUrl,
        source_platform: facebookUrl ? 'facebook' : 'instagram',
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
      });
      onCreated(created);
      toast.success('Publicación creada en el Hub');
      resetForm();
    } catch (error) {
      toast.error(error.message || 'No se pudo crear la publicación');
    } finally {
      setSaving(false);
    }
  };

  if (!(currentUser?.canPublish || currentUser?.role === 'admin')) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className={`publisher-composer ${open ? 'is-open' : ''}`}
    >
      <div className="publisher-composer-hero">
        <div>
          <p><ShieldCheck size={14} /> Panel Pastor/Directivo</p>
          <h3>Crear publicación desde redes sociales</h3>
          <span>Pega un post de Facebook o Instagram. Guardamos el enlace, el título y una portada para que todos puedan compartirlo sin duplicar contenido.</span>
        </div>
        <button type="button" className="publisher-toggle" onClick={() => setOpen((value) => !value)}>
          {open ? <XCircle size={18} /> : <PlusCircle size={18} />}
          {open ? 'Cerrar' : 'Nueva publicación'}
        </button>
      </div>

      {open && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="publisher-form"
          onSubmit={handleSubmit}
        >
          <div className="publisher-fields">
            <label className="publisher-field">
              <span><Link2 size={14} /> Link de Facebook</span>
              <input
                value={form.facebookUrl}
                onChange={(event) => {
                  setField('facebookUrl', event.target.value);
                  setPreview(null);
                }}
                onBlur={() => {
                  if (form.facebookUrl && !preview && !form.title) loadPreview();
                }}
                placeholder="https://www.facebook.com/..."
                inputMode="url"
              />
            </label>

            <label className="publisher-field">
              <span><Link2 size={14} /> Link de Instagram</span>
              <input
                value={form.instagramUrl}
                onChange={(event) => {
                  setField('instagramUrl', event.target.value);
                  setPreview(null);
                }}
                onBlur={() => {
                  if (!form.facebookUrl && form.instagramUrl && !preview && !form.title) loadPreview();
                }}
                placeholder="https://www.instagram.com/p/..."
                inputMode="url"
              />
            </label>

            <div className="publisher-fetch-row is-wide">
              <span>El preview se toma del primer enlace disponible. Si la red bloquea la imagen, puedes cargar una portada manual.</span>
              <button type="button" onClick={loadPreview} disabled={previewLoading || (!form.facebookUrl && !form.instagramUrl)}>
                {previewLoading ? <Loader2 size={16} className="spin" /> : <WandSparkles size={16} />}
                Obtener preview
              </button>
            </div>

            <label className="publisher-field">
              <span>Título</span>
              <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Ej. Testimonio desde la Región Caribe" />
            </label>

            <label className="publisher-field">
              <span>Coordinación</span>
              <select value={form.coordinationId} onChange={(event) => setField('coordinationId', event.target.value)}>
                <option value="">Sin coordinación específica</option>
                {composerCoordinations.map((coordination) => (
                  <option key={coordination.id} value={coordination.id}>{coordination.name}</option>
                ))}
              </select>
            </label>

            <label className="publisher-field is-wide">
              <span>Descripción breve</span>
              <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Una frase corta para explicar por qué se comparte este contenido." />
            </label>

            <label className="publisher-field">
              <span><ImagePlus size={14} /> Imagen opcional</span>
              <input value={form.imageUrl} onChange={(event) => setField('imageUrl', event.target.value)} placeholder="URL de imagen, si el post no entrega portada" inputMode="url" />
            </label>

            <label className="publisher-field">
              <span>Formato</span>
              <select value={form.format} onChange={(event) => setField('format', event.target.value)}>
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
                <option value="carrusel">Carrusel</option>
                <option value="texto">Texto</option>
              </select>
            </label>
          </div>

          <aside className="publisher-preview" style={{ '--publisher-platform': platform.tone }}>
            <div className="publisher-preview-media">
              <img src={imagePreview} alt="" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
              <span>{platform.label}</span>
            </div>
            <div className="publisher-preview-body">
              <strong>{previewTitle}</strong>
              <p>{previewDescription}</p>
              <a href={primaryUrl || '#'} target="_blank" rel="noreferrer" onClick={(event) => !primaryUrl && event.preventDefault()}>
                Ver publicación original <ExternalLink size={13} />
              </a>
            </div>
            <div className="publisher-preview-note">
              <AlertCircle size={14} />
              Si Facebook o Instagram bloquean su imagen, usa una URL de imagen manual.
            </div>
          </aside>

          <div className="publisher-actions">
            <label className="publisher-check">
              <input type="checkbox" checked={form.featured} onChange={(event) => setField('featured', event.target.checked)} />
              Marcar como destacado
            </label>
            <button type="submit" disabled={saving}>
              {saving ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
              {saving ? 'Publicando...' : 'Publicar en el Hub'}
            </button>
          </div>
        </motion.form>
      )}
    </motion.section>
  );
}

export default function Hub() {
  const { currentUser } = useAppStore();
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [coord, setCoord] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState('Recientes');
  const [data, setData] = useState({ items: [], coordinations: [], schemaMetrics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHub() {
      setLoading(true);
      try {
        const payload = await api.hub.list({
          q: query,
          coordination: filterMode === 'coordination' ? coord : '',
          region: filterMode === 'region' ? region : '',
          sort,
        });
        if (!active) return;
        setData(payload);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHub();
    return () => { active = false; };
  }, [query, filterMode, coord, region, sort]);

  const hubStats = [
    { label: 'Publicaciones', value: data.schemaMetrics.publicaciones || 0, Icon: BookOpen, color: '#1A237E' },
    { label: 'Compartidos', value: data.schemaMetrics.compartidos || 0, Icon: Send, color: '#D4AF37' },
    { label: 'Comunicados', value: data.schemaMetrics.comunicadosActivos || 0, Icon: Megaphone, color: '#5C1800' },
    { label: 'Congregaciones', value: data.schemaMetrics.congregaciones || 0, Icon: Building2, color: '#2E7D32' },
  ];
  const featuredCount = data.items.filter((item) => item.featured).length;
  const xpAvailable = data.items.reduce((sum, item) => sum + Number(item.xpReward || 0), 0);
  const filterCoordinations = getCanonicalCoordinations(data.coordinations);
  const selectedCoord = filterCoordinations.find((item) => item.id === coord);
  const selectedRegion = contentRegions.find((item) => item.id === region);
  const activeFilterLabel = filterMode === 'coordination'
    ? (selectedCoord?.name || 'Todas las coordinaciones')
    : filterMode === 'region'
      ? (selectedRegion?.name || 'Todas las regiones')
      : 'Toda la red';

  const handlePublicationCreated = (item) => {
    setSort('Recientes');
    setData((current) => ({
      ...current,
      items: [item, ...current.items],
      schemaMetrics: {
        ...current.schemaMetrics,
        publicaciones: Number(current.schemaMetrics.publicaciones || 0) + 1,
        comunicadosActivos: Number(current.schemaMetrics.comunicadosActivos || 0) + 1,
      },
    }));
  };

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
          <h2>Biblioteca digital</h2>
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

      <PastorPublicationComposer
        currentUser={currentUser}
        coordinations={data.coordinations}
        onCreated={handlePublicationCreated}
      />

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
            {filterMode === 'coordination' && (
              <select value={coord} onChange={(e) => setCoord(e.target.value)}>
                <option value="">Todas las coordinaciones</option>
                {filterCoordinations.map((coordination) => <option key={coordination.id} value={coordination.id}>{coordination.name}</option>)}
              </select>
            )}
            {filterMode === 'region' && (
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Todas las regiones</option>
                {contentRegions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}
            {filterMode === 'all' && (
              <select value="" onChange={() => {}} aria-label="Toda la biblioteca">
                <option value="">Toda la biblioteca nacional</option>
              </select>
            )}
          </label>
        </div>

        <div className="content-segments-stack">
          <div className="content-segment-pro is-intentional" role="tablist" aria-label="Filtro de contenido">
            {filterModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setFilterMode(option.id);
                  if (option.id !== 'coordination') setCoord('');
                  if (option.id !== 'region') setRegion('');
                }}
                className={filterMode === option.id ? 'is-active' : ''}
              >
                {option.label}
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
        <span><Filter size={14} />{activeFilterLabel}</span>
      </div>

      <section className="content-feed-section">
        <div className="content-feed-head">
          <div>
            <p><Megaphone size={13} /> Biblioteca oficial</p>
            <h3>{sort}</h3>
          </div>
          <span>{activeFilterLabel}</span>
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
