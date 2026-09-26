import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const communityUrl = 'https://chat.whatsapp.com/G2Al7tjnAao6k1I4swB5mv?s=hd&p=i&mlu=4';

export default function CampaignHeader({ onLogin, onRegister, onLearnMore }) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const headerRef = useRef(null);
  const buttonRef = useRef(null);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 960px)');
    const update = () => { setDesktop(query.matches); setOpen(false); };
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => { if (!headerRef.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  const choose = (callback) => { setOpen(false); callback?.(); };
  return (
    <header className="campaign-header" ref={headerRef}>
      <a href="/" className="campaign-brand" aria-label="Misiones Colombia · Inicio">
        <img src="/media/campaign-5000/brand-mark-small.png" width="96" height="96" alt="" />
        <span><strong>Misiones</strong><span>Colombia</span></span>
      </a>
      <button className="campaign-menu-toggle" ref={buttonRef} type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="campaign-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>{open ? <X /> : <Menu />}</button>
      <nav id="campaign-menu" className="campaign-menu" aria-label="Navegación principal" hidden={!open && !desktop}>
        <button type="button" onClick={() => choose(onLogin)}>Iniciar sesión</button>
        <button type="button" onClick={() => choose(onLearnMore)}>Ver más</button>
        <a href={communityUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Comunidad WhatsApp ↗</a>
        <button type="button" className="campaign-menu-join" onClick={() => choose(onRegister)}>Unirme ahora <ArrowRight size={18} /></button>
      </nav>
    </header>
  );
}
