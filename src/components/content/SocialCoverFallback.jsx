import { Facebook, Instagram, Share2 } from 'lucide-react';
import { getSocialPlatform } from '../../utils/socialPreview';

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  social: Share2,
};

export default function SocialCoverFallback({ item, platform: providedPlatform }) {
  const platform = providedPlatform || getSocialPlatform(item?.sourcePlatform || item?.sourceUrl);
  const PlatformIcon = platformIcons[platform.id] || Share2;

  return (
    <div
      className="social-cover-fallback"
      data-platform={platform.id}
      role="img"
      aria-label={`Vista previa visual de ${item?.title || 'una publicación oficial'}`}
    >
      <div className="social-cover-fallback-topline">
        <span className="social-cover-fallback-platform"><PlatformIcon size={15} />{platform.label}</span>
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
