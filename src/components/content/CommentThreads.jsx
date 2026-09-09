import { useState } from 'react';
import { Award, ChevronDown, ChevronUp, Heart, Trash2 } from 'lucide-react';
import { buildCommentThreads, parentCommentId } from '../../utils/commentThreads';
import './comment-threads.css';

const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
const countFormatter = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });

export default function CommentThreads({ comments, currentUser, busy, onLike, onReply, onDelete }) {
  const [collapsed, setCollapsed] = useState({});
  const threads = buildCommentThreads(comments);
  const authors = new Map(comments.map((comment) => [String(comment.id), comment.authorName]));
  const renderComment = (comment, isReply = false) => {
    const avatar = typeof comment.authorAvatar === 'string' ? comment.authorAvatar : '';
    const name = comment.authorName || 'Miembro de la red';
    const district = comment.districtName || comment.authorDistrict || comment.district;
    const badgeValue = comment.badgeName || comment.authorBadge || comment.badge;
    const badge = typeof badgeValue === 'string' ? badgeValue : badgeValue?.name;
    const level = Number(comment.level || comment.authorLevel || 1);
    const own = String(comment.userId) === String(currentUser?.schemaId || currentUser?.id);
    const canDelete = own || currentUser?.role === 'admin' || currentUser?.canPublish;
    const date = new Date(comment.createdAt);
    const validDate = !Number.isNaN(date.getTime());
    const replyingName = isReply ? authors.get(parentCommentId(comment)) : null;
    return (
      <article key={comment.id} className={`social-comment ${isReply ? 'social-comment--reply' : ''}`}>
        <div className="social-comment-avatar" style={{ backgroundColor: comment.authorColor || '#294a79' }}>
          {/^(https?:\/\/|data:image\/|\/)/i.test(avatar) ? <img src={avatar} alt="" loading="lazy" /> : avatar || name.slice(0, 2).toUpperCase()}
        </div>
        <div className="social-comment-body">
          <div className="social-comment-author"><strong>{name}</strong>{own && <span>Tú</span>}</div>
          <div className="social-comment-meta"><span><Award size={11} />{badge || `Nivel ${Number.isFinite(level) && level > 0 ? level : 1}`}</span>{typeof district === 'string' && district.trim() && <span>{district}</span>}</div>
          <p>{isReply && replyingName && <span className="social-comment-mention">@{replyingName} </span>}{comment.content}</p>
          <div className="social-comment-tools">
            {validDate && <time dateTime={date.toISOString()} title={date.toLocaleString('es-CO')}>{dateFormatter.format(date)}</time>}
            <button type="button" onClick={() => onReply(comment)}>Responder</button>
            <button type="button" className={`social-comment-heart ${comment.likedByMe ? 'is-liked' : ''}`} disabled={busy}
              onClick={() => onLike(comment)} aria-pressed={Boolean(comment.likedByMe)}
              aria-label={`${comment.likedByMe ? 'Quitar me gusta' : 'Dar me gusta'} al comentario de ${name}`}>
              <Heart size={20} fill={comment.likedByMe ? 'currentColor' : 'none'} /><span>{countFormatter.format(Number(comment.likesCount || 0))}</span>
            </button>
            {canDelete && <button type="button" className="social-comment-remove" disabled={busy} onClick={() => onDelete(comment)} aria-label={`Eliminar comentario de ${name}`}><Trash2 size={14} /></button>}
          </div>
        </div>
      </article>
    );
  };
  return threads.map(({ root, replies }) => (
    <section className="social-thread" key={root.id} aria-label={`Hilo de ${root.authorName || 'Miembro de la red'}`}>
      {renderComment(root)}
      {replies.length > 0 && <>
        {!collapsed[root.id] && <div className="social-thread-replies">{replies.map((reply) => renderComment(reply, true))}</div>}
        <button type="button" className="social-thread-toggle" aria-expanded={!collapsed[root.id]} onClick={() => setCollapsed((current) => ({ ...current, [root.id]: !current[root.id] }))}>
          <span />{collapsed[root.id] ? `Ver ${replies.length} ${replies.length === 1 ? 'respuesta' : 'respuestas'}` : 'Ocultar respuestas'}{collapsed[root.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </>}
    </section>
  ));
}
