import { ArrowUpRight, LockKeyhole, MessageCircle } from 'lucide-react';

const vipUrl = String(import.meta.env.VITE_VIP_WHATSAPP_URL || '').trim();

export default function CommunityVipCard() {
  const hasInvite = /^https:\/\/chat\.whatsapp\.com\//i.test(vipUrl);

  return (
    <aside className="community-vip-card" aria-label="Comunidad VIP de WhatsApp">
      <div className="community-vip-icon"><MessageCircle size={22} /></div>
      <div className="community-vip-copy">
        <span><LockKeyhole size={12} /> Comunidad privada para socios</span>
        <h3>Conecta con la red VIP</h3>
        <p>Ingresa para reuniones, capacitaciones y avisos especiales de Misiones Nacionales.</p>
      </div>
      {hasInvite ? (
        <a href={vipUrl} target="_blank" rel="noreferrer" className="community-vip-link">
          Entrar a WhatsApp <ArrowUpRight size={15} />
        </a>
      ) : (
        <span className="community-vip-link is-disabled" aria-disabled="true" title="Configura VITE_VIP_WHATSAPP_URL para activar el enlace">
          Enlace privado pendiente
        </span>
      )}
    </aside>
  );
}
