import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink, ImagePlus, Link2, Loader2, Send, WandSparkles } from 'lucide-react';
import { api } from '../../api';
import { fetchSocialPreview } from '../../utils/socialPreview';
import { getCanonicalCoordinations } from '../../utils/coordinations';
import toast from 'react-hot-toast';
const FALLBACK_IMAGE = '/hero-map.png';

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

function isFacebookUrl(url = '') {
  return belongsTo(url, ['facebook.com', 'fb.watch', 'fb.com']);
}

function isInstagramUrl(url = '') {
  return belongsTo(url, ['instagram.com']);
}

function belongsTo(value, domains) {
  try {
    const parsed = new URL(normalizePostUrl(value));
    return ['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password && domains.some(domain => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`));
  } catch { return false; }
}

export default function PublicationComposer({ currentUser, coordinations, editingItem = null, onCreated, onUpdated, onCancelEdit }) {
  const [form, setForm] = useState(() => editingItem ? {
    facebookUrl: editingItem.facebookUrl || (isFacebookUrl(editingItem.sourceUrl) ? editingItem.sourceUrl : ''),
    instagramUrl: editingItem.instagramUrl || (isInstagramUrl(editingItem.sourceUrl) ? editingItem.sourceUrl : ''),
    title: editingItem.title || '', description: editingItem.description || '', imageUrl: editingItem.imageUrl || '',
    coordinationId: editingItem.coordination || '', format: editingItem.format || 'imagen', featured: Boolean(editingItem.featured),
  } : publisherInitialState);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(editingItem);
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
      if (!nextPreview) throw new Error('No se pudo leer la vista previa del enlace');
      setPreview(nextPreview);
      setForm((current) => ({
        ...current,
        title: current.title || nextPreview.title || '',
        description: current.description || nextPreview.description || '',
        imageUrl: current.imageUrl || nextPreview.imageUrl || '',
        format: current.format === publisherInitialState.format && nextPreview.videoUrl ? 'video' : current.format,
      }));
      toast.success(nextPreview.imageUrl ? 'Vista previa obtenida' : 'Vista previa lista; agrega una imagen si quieres mejorar la portada');
    } catch {
      toast('La red social bloqueó la vista previa. Puedes guardar igual agregando título e imagen manual.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const resetForm = () => {
    setForm(publisherInitialState);
    setPreview(null);
    onCancelEdit?.();
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
      const publicationPayload = {
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
      };
      if (isEditing) {
        const updated = await api.publicaciones.update(editingItem.id, publicationPayload);
        onUpdated?.(updated);
        toast.success('Publicación actualizada');
      } else {
        const created = await api.publicaciones.create(publicationPayload);
        onCreated(created);
        toast.success('Publicación creada en Noticias');
      }
      resetForm();
    } catch (error) {
      toast.error(error.message || (isEditing ? 'No se pudo actualizar la publicación' : 'No se pudo crear la publicación'));
    } finally {
      setSaving(false);
    }
  };

  if (!(currentUser?.canPublish || currentUser?.role === 'admin')) return null;

  return (
    <motion.section
      className="publisher-composer is-open"
    >
        <motion.form
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
              <span>La vista previa se toma del primer enlace disponible. Si la red bloquea la imagen, puedes cargar una portada manual.</span>
              <button type="button" onClick={loadPreview} disabled={previewLoading || (!form.facebookUrl && !form.instagramUrl)}>
                {previewLoading ? <Loader2 size={16} className="spin" /> : <WandSparkles size={16} />}
                Obtener vista previa
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
              {saving ? (isEditing ? 'Guardando...' : 'Publicando...') : (isEditing ? 'Guardar cambios' : 'Publicar en Noticias')}
            </button>
          </div>
        </motion.form>
    </motion.section>
  );
}
