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

const formats = ['Todos', 'imagen', 'video', 'texto', 'carrusel'];
const sorts = ['Recientes', 'Populares', 'Destacados'];
const FALLBACK_IMAGE = '/hero-map.png';

const publisherInitialState = {
  sourceUrl: '',
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
  const normalizedUrl = normalizePostUrl(form.sourceUrl);
  const platform = detectSocialPlatform(normalizedUrl);
  const imagePreview = form.imageUrl.trim() || preview?.imageUrl || FALLBACK_IMAGE;
  const previewTitle = form.title.trim() || preview?.title || 'Nueva publicación oficial';
  const previewDescription = form.description.trim() || preview?.description || 'Pega un enlace de Facebook o Instagram para crear una pieza lista para compartir.';

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const loadPreview = async () => {
    if (!isValidHttpUrl(form.sourceUrl)) {
      toast.error('Pega un enlace válido de Facebook o Instagram');
      return;
    }
    if (platform.id === 'manual') {
      toast.error('Por ahora usa enlaces de Facebook o Instagram');
      return;
    }
    setPreviewLoading(true);
    try {
      const nextPreview = await fetchSocialPreview(normalizedUrl);
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
    if (!isValidHttpUrl(form.sourceUrl)) {
      toast.error('El enlace de la publicación es obligatorio');
      return;
    }
    if (platform.id === 'manual') {
      toast.error('Solo se permiten enlaces de Facebook o Instagram');
      return;
    }
    if (!form.title.trim() && !preview?.title) {
      toast.error('Agrega un título para identificar la publicación');
      return;
    }

    setSaving(true);
    try {
      const created = await api.publicaciones.create({
        title: previewTitle,
        description: previewDescription,
        category: platform.label,
        format: form.format,
        coordination_id: form.coordinationId || null,
        featured: form.featured,
        xp_reward: 50,
        copy_text: `${previewTitle}\n\n${normalizedUrl}`,
        media_url: imagePreview,
        source_url: normalizedUrl,
        source_platform: platform.id,
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

  if (!['admin', 'pastor'].includes(currentUser?.role)) return null;

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
            <label className="publisher-field is-wide">
              <span><Link2 size={14} /> Link del post</span>
              <div className="publisher-link-row">
                <input
                  value={form.sourceUrl}
                  onChange={(event) => {
                    setField('sourceUrl', event.target.value);
                    setPreview(null);
                  }}
                  onBlur={() => {
                    if (form.sourceUrl && !preview && !form.title) loadPreview();
                  }}
                  placeholder="https://www.instagram.com/p/... o https://www.facebook.com/..."
                  inputMode="url"
                />
                <button type="button" onClick={loadPreview} disabled={previewLoading || !form.sourceUrl}>
                  {previewLoading ? <Loader2 size={16} className="spin" /> : <WandSparkles size={16} />}
                  Preview
                </button>
              </div>
            </label>

            <label className="publisher-field">
              <span>Título</span>
              <input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Ej. Testimonio desde la Región Caribe" />
            </label>

            <label className="publisher-field">
              <span>Coordinación</span>
              <select value={form.coordinationId} onChange={(event) => setField('coordinationId', event.target.value)}>
                <option value="">Sin coordinación específica</option>
                {coordinations.map((coordination) => (
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
              <a href={normalizedUrl || '#'} target="_blank" rel="noreferrer" onClick={(event) => !normalizedUrl && event.preventDefault()}>
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
