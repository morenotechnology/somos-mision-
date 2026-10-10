export default function MediaSkeleton({ label = 'Cargando publicación…' }) {
  return <div className="publication-media-skeleton" role="status" aria-label={label}>
    <div className="publication-skeleton-surface" aria-hidden="true" />
    <span>{label}</span>
  </div>;
}

export function FeedSkeleton() {
  return <div className="social-feed-skeleton" role="status" aria-label="Cargando noticias…">
    {[0, 1].map(index => <div className="social-post" key={index} aria-hidden="true">
      <div className="social-post-header"><i className="feed-skeleton-avatar" /><div className="feed-skeleton-identity"><i /><i /></div></div>
      <div className="publication-skeleton-surface" />
      <div className="feed-skeleton-caption"><i /><i /></div>
    </div>)}
  </div>;
}
