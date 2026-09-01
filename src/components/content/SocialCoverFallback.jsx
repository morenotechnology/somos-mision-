import { Share2 } from 'lucide-react';
import { getSocialPlatform } from '../../utils/socialPreview';

export default function SocialCoverFallback({ item, platform: providedPlatform }) {
  const platform = providedPlatform || getSocialPlatform(item?.sourcePlatform || item?.sourceUrl);

  return (
    <div
      className="social-cover-fallback"
      data-platform={platform.id}
      role="img"
      aria-label={`Vista previa visual de ${item?.title || 'una publicación oficial'}`}
    >
      <div className="social-cover-fallback-topline">
        <span className="social-cover-fallback-platform"><Share2 size={15} />{platform.label}</span>
        <span>Contenido oficial</span>
      </div>
      <div className="social-cover-fallback-mark" aria-hidden="true">MN</div>
      <div className="social-cover-fallback-bottomline">
        <strong>Misiones Nacionales</strong>
        <span>Vista previa disponible desde el enlace original</span>
      </div>
    </div>
  );
}
