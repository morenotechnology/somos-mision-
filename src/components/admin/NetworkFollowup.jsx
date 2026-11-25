import { useState } from 'react';
import { CheckCheck, MessageCircle } from 'lucide-react';

const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle:'medium', timeStyle:'short', timeZone:'America/Bogota' });
function date(value) { return value ? dateFormat.format(new Date(value)) : ''; }

export function ReferralReport({ data, directory }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const rows = (data.rows || []).filter(row => {
    const names = [directory.get(row.inviter_id), directory.get(row.invitee_id)].filter(Boolean).map(u => u.name + ' ' + u.email).join(' ');
    return names.toLocaleLowerCase('es').includes(query.trim().toLocaleLowerCase('es')) &&
      (!filter || (filter === 'unshared' ? !row.first_shared_at : filter === 'credited' ? Boolean(row.credited_at) : row.first_shared_at && !row.credited_at));
  });
  return <section className="card p-5 followup-report" aria-labelledby="followup-title">
    <header className="followup-toolbar"><div><h3 id="followup-title">Uno trae uno</h3><p>Quién invitó, quién compartió y quién recibió los 400 XP.</p></div>
      <button type="button" className="followup-link" onClick={data.refresh}>Actualizar</button></header>
    <div className="followup-toolbar"><input aria-label="Buscar invitador o invitado" className="input-base" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar invitador o invitado" />
      <select aria-label="Estado de invitación" className="directory-select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Todas las invitaciones</option><option value="unshared">Sin primer compartido</option><option value="unpaid">Compartió, sin abono</option><option value="credited">Con 400 XP acreditados</option></select></div>
    {data.error ? <p role="alert">{data.error}</p> : !data.rows ? <p role="status">Cargando invitaciones…</p> : !rows.length ? <p>{data.rows.length ? 'No hay invitaciones con esos filtros.' : 'Aún no hay registros con un enlace de Uno trae uno.'}</p> :
      <ul>{rows.map(row=><li className="followup-record" key={row.invitee_id}>
        <div><small>Invitó</small><strong>{directory.get(row.inviter_id)?.name || 'Perfil no disponible'}</strong></div>
        <div><small>Se registró</small><strong>{directory.get(row.invitee_id)?.name || 'Perfil no disponible'}</strong><small>{date(row.registered_at)}</small></div>
        <div><small>Primer compartido</small><strong>{row.first_shared_at ? 'Registrado' : 'Sin registro'}</strong><small>{date(row.first_shared_at)}</small></div>
        <div><small>Premio al invitador</small><strong className={row.credited_at ? 'followup-paid' : ''}>{row.credited_at ? '400 XP acreditados' : 'Pendiente'}</strong><small>{date(row.credited_at)}</small></div>
      </li>)}</ul>}
  </section>;
}

export function OutreachControl({ user, row, directory, actor, ready, busy, onAction, detail }) {
  const owner = directory.get(row?.opened_by);
  const own = row && actor === row.opened_by;
  const recoverable = row && !row.sent_at && (!owner?.active || owner.role !== 'admin');
  if (!ready) return <small>Seguimiento no disponible</small>;
  return <div className="outreach-control">
    {row && <span className="outreach-stamp">{row.sent_at ? 'Enviado' : 'Chat abierto'} · {own ? 'Tú' : owner?.name || 'Perfil no disponible'} · {date(row.sent_at || row.opened_at)}</span>}
    {!row?.sent_at && (!row || own || recoverable) && (user.invitation ?
      <button type="button" className="directory-invite" disabled={busy} onClick={() => onAction(user,own ? 'resume' : 'open')}><MessageCircle size={16} />{own ? 'Continuar chat' : detail ? 'Invitar por WhatsApp' : 'WhatsApp'}</button>
      : <small>{user.phone ? 'Revisar número de WhatsApp' : 'Sin WhatsApp registrado'}</small>)}
    {own && !row.sent_at && <>
      <button type="button" className="followup-link" disabled={busy} onClick={()=>onAction(user,'sent')}><CheckCheck size={15}/> Marcar enviado</button>
      {detail && <button type="button" className="followup-link" disabled={busy} onClick={()=>onAction(user,'release')}>Liberar sin enviar</button>}
    </>}
  </div>;
}
