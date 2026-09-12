import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ExternalLink, FilePlus2, List, Loader2, PencilLine, Search, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { useAppStore } from '../store/useAppStore';
import PublicationComposer from '../components/content/PublicationComposer';
import { canPublish } from '../utils/permissions';
import toast from 'react-hot-toast';
import './publishing.css';

export default function Publish() {
  const currentUser = useAppStore(state => state.currentUser);
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState('create');
  const [data, setData] = useState({ items: [], coordinations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reload, setReload] = useState(0);
  const editId = params.get('editar');
  const editingItem = data.items.find(item => String(item.id) === editId) || null;

  useEffect(() => {
    let active = true;
    api.hub.list({ sort: 'Recientes' }).then(payload => {
      if (active) { setData(payload); setError(''); }
    }).catch(err => { if (active) setError(err.message || 'No pudimos cargar las publicaciones.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const clearEdit = () => setParams({}, { replace: true });
  const saved = item => {
    setData(current => ({ ...current, items: [item, ...current.items.filter(p => String(p.id) !== String(item.id))] }));
    clearEdit(); setView('list');
  };
  const removePublication = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.publicaciones.delete(deleteTarget.id);
      setData(current => ({ ...current, items: current.items.filter(item => item.id !== deleteTarget.id) }));
      if (editId === String(deleteTarget.id)) clearEdit();
      setDeleteTarget(null);
      toast.success('Publicación eliminada');
    } catch (err) { toast.error(err.message || 'No se pudo eliminar. Intenta de nuevo.'); }
    finally { setDeleting(false); }
  };
  const visibleItems = data.items.filter(item => `${item.title} ${item.coordinationName || ''}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));

  if (!canPublish(currentUser)) return <p>No tienes permiso editorial.</p>;
  return <div className="publishing-page">
    <header className="publishing-header">
      <div><h2>Publicar en la red</h2><p>Crea y administra las noticias de tu coordinación.</p></div>
      <Link to="/noticias" className="publishing-back"><ArrowLeft size={16} /> Volver a Noticias</Link>
    </header>
    <div className="publishing-tabs" role="tablist" aria-label="Gestión editorial">
      <button id="publication-create-tab" role="tab" aria-controls="publication-panel" tabIndex={view === 'create' ? 0 : -1} aria-selected={view === 'create'} onKeyDown={event => { if (['ArrowLeft','ArrowRight','End'].includes(event.key)) { event.preventDefault(); setView('list'); event.currentTarget.nextElementSibling?.focus(); } }} onClick={() => setView('create')}><FilePlus2 size={17} />{editId ? 'Editar publicación' : 'Nueva publicación'}</button>
      <button id="publication-list-tab" role="tab" aria-controls="publication-panel" tabIndex={view === 'list' ? 0 : -1} aria-selected={view === 'list'} onKeyDown={event => { if (['ArrowLeft','ArrowRight','Home'].includes(event.key)) { event.preventDefault(); setView('create'); event.currentTarget.previousElementSibling?.focus(); } }} onClick={() => setView('list')}><List size={17} />Publicadas{!loading && <span>{data.items.length}</span>}</button>
    </div>
    <div id="publication-panel" role="tabpanel" aria-labelledby={view === 'create' ? 'publication-create-tab' : 'publication-list-tab'}>
    {loading ? <div className="publishing-status" role="status"><Loader2 className="spin" size={22} /> Cargando publicaciones…</div> : error ?
      <div className="publishing-status" role="alert"><p>{error}</p><button onClick={() => { setLoading(true); setReload(value => value + 1); }}>Reintentar</button></div> : <>
      {view === 'create' && <>
        {editId && !editingItem ? <div className="publishing-status"><p>Esta publicación ya no está disponible.</p><button onClick={clearEdit}>Crear una nueva</button></div> : <>
          {editingItem && <div className="publishing-edit-note"><PencilLine size={16} /><span>Editando: {editingItem.title}</span><button onClick={clearEdit}><X size={16} /> Cancelar</button></div>}
          <PublicationComposer key={editId || 'new'} currentUser={currentUser} coordinations={data.coordinations} editingItem={editingItem} onCreated={saved} onUpdated={saved} onCancelEdit={clearEdit} />
        </>}
      </>}
      {view === 'list' && <section aria-label="Publicaciones disponibles">
        <label className="publishing-search"><Search size={18} /><input aria-label="Buscar publicaciones" placeholder="Buscar por título o coordinación" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <div className="publishing-list">
          {visibleItems.map(item => <article key={item.id} className="publishing-row">
            <div className="publishing-row-copy"><span>{item.coordinationName || 'Misiones Nacionales'}</span><h3>{item.title}</h3><p>{new Date(item.createdAt).toLocaleDateString('es-CO')} · {item.format === 'video' ? 'Video' : item.format === 'texto' ? 'Texto' : 'Imagen'}</p></div>
            {deleteTarget?.id === item.id ? <div className="publishing-delete-confirm" role="alert"><p>¿Eliminar esta publicación? No se puede deshacer.</p><div><button disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancelar</button><button className="is-danger" disabled={deleting} onClick={removePublication}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button></div></div> : <div className="publishing-row-actions">
              <button onClick={() => { setParams({ editar: String(item.id) }); setView('create'); document.querySelector('.app-main-scroll')?.scrollTo({ top: 0 }); }}><PencilLine size={17} />Editar</button>
              <button className="is-danger" onClick={() => setDeleteTarget(item)}><Trash2 size={17} />Eliminar</button>
              {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Abrir original: ${item.title}`}><ExternalLink size={17} /></a>}
            </div>}
          </article>)}
          {!visibleItems.length && <div className="publishing-status"><CheckCircle2 size={26} /><p>{query ? 'No hay coincidencias con esa búsqueda.' : 'Tu próxima noticia empieza aquí.'}</p>{!query && <button onClick={() => setView('create')}>Crear la primera publicación</button>}</div>}
        </div>
      </section>}
    </>}
    </div>
  </div>;
}
