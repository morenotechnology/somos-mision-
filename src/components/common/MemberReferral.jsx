import { useEffect, useState } from 'react';
import { Copy, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../api';
import { referralLink, referralXP } from '../../utils/referral';

export default function MemberReferral() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => api.perfiles.referral()).then(result => {
      if (!referralLink(window.location.origin, result?.code)) throw new Error();
      if (live) setData(result);
    }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [attempt]);
  const url = data ? referralLink(window.location.origin, data.code) : '';
  return <section className="profile-panel-pro member-referral" aria-labelledby="referral-title">
    <h2 id="referral-title">Uno trae uno</h2>
    <p>Invita a alguien a la red. Ganas <strong>{referralXP} XP</strong> cuando se registra con tu enlace y confirma su correo.</p>
    {error ? <p role="status">No pudimos cargar tu enlace. <button type="button" onClick={() => { setError(false); setAttempt(v => v + 1); }}>Reintentar</button></p>
      : !url ? <p role="status">Preparando tu enlace…</p> : <>
        <label>Tu enlace de invitación<input readOnly value={url} onFocus={e => e.target.select()} /></label>
        <div className="member-referral-actions">
          <a href={`https://wa.me/?text=${encodeURIComponent('Uno trae uno: te invito a la Red de los 5000 Amigos. Regístrate aquí: ' + url)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Invitar por WhatsApp</a>
          <button type="button" onClick={async () => {
            try { await navigator.clipboard.writeText(url); toast.success('Enlace copiado'); }
            catch { toast.error('Selecciona y copia el enlace de invitación.'); }
          }}><Copy size={16} /> Copiar enlace</button>
        </div>
        <p>{data.confirmed} {Number(data.confirmed) === 1 ? 'registro confirmado' : 'registros confirmados'} · {(Number(data.confirmed) * referralXP).toLocaleString('es-CO')} XP por invitaciones</p>
      </>}
  </section>;
}
