import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, PencilLine } from 'lucide-react';
import { coordinationLogos } from './coordinationLogos';

const dateFormat = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SocialPost({ item, media, controls, actions, alreadyShared, canEdit, onComments, commentsCount, originalLinks }) {
  const [expanded, setExpanded] = useState(false);
  const coordination = item.coordinationName || 'Misiones Nacionales';
  const date = new Date(item.createdAt);
  const description = item.description || '';
  const longCaption = description.length > 160;
  return <article className="social-post" aria-label={item.title} id={`publicacion-${item.id}`}>
    <header className="social-post-header">
      <img className="social-post-avatar" src={coordinationLogos[item.coordination] || '/isologo-somos-mision.svg'} alt="" />
      <div className="social-post-identity">
        <div><strong>{coordination}</strong>{item.isOfficial !== false && <CheckCircle2 size={16} aria-label="Coordinación oficial" />}</div>
        <p>Misiones Nacionales{!Number.isNaN(date.getTime()) && <> · <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time></>}</p>
      </div>
      {canEdit && <Link className="social-post-edit" to={`/publicar?editar=${encodeURIComponent(item.id)}`} aria-label={`Editar publicación: ${item.title}`}><PencilLine size={19} /></Link>}
    </header>
    <div className="social-post-media">{media}</div>
    {controls}
    <div className="social-post-details">
      <div className="social-post-actions">{actions}</div>
      {alreadyShared && <p className="social-post-shared"><CheckCircle2 size={13} />Ya la compartiste</p>}
      <div className="social-post-caption">
        <h3>{item.title}</h3>
        {description && <p>{longCaption && !expanded ? `${description.slice(0, 160).trim()}…` : description}{longCaption && <button aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'menos' : 'más'}</button>}</p>}
      </div>
      <button className="social-post-comment-link" onClick={onComments}>{commentsCount === 1 ? 'Ver 1 comentario' : commentsCount > 1 ? `Ver los ${commentsCount} comentarios` : 'Sé la primera persona en comentar'}</button>
      {originalLinks.length > 0 && <div className="social-post-originals">{originalLinks.map(link => <a key={link.network} href={link.url} target="_blank" rel="noreferrer">Ver en {link.label}<ExternalLink size={12} /></a>)}</div>}
    </div>
  </article>;
}
