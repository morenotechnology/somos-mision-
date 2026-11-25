import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Target, BarChart2, Search, Shield, TrendingUp, Star, CalendarDays, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../api';
import { formatNumber, getLevelTitle } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Network } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useFollowup } from '../components/admin/useFollowup';
import { OutreachControl, ReferralReport } from '../components/admin/NetworkFollowup';
import { directoryGroup, directoryGroups, groupDimensions, invitationUrl } from '../utils/communityDirectory';
import './admin-export.css';

const adminTabs = [
  { id: 'analytics', label: 'Analítica', icon: BarChart2 },
  { id: 'content', label: 'Contenido', icon: BookOpen },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'referrals', label: 'Uno trae uno', icon: Network },
  { id: 'missions', label: 'Misiones', icon: Target },
];

const PIE_COLORS = ['#1A237E', '#D4AF37', '#5C6BC0'];
const roleLabel = { admin: 'Admin', pastor: 'Pastor/Directivo', multiplicador: 'Multiplicador' };
const roleBadge = { admin: 'bg-red-100 text-red-700', pastor: 'bg-purple-100 text-purple-700', multiplicador: 'bg-blue-100 text-[#1A237E]' };

const registrationDateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function normalizeAdminUser(user = {}) {
  const registeredAt = user.registeredAt || user.created_at || user.createdAt || user.joinedAt || null;
  const name = user.name || user.nombre_completo || user.nombre || 'Usuario sin nombre';
  const role = user.role || user.rol || 'multiplicador';
  const rawDate = String(registeredAt || '');
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? new Date(`${rawDate}T12:00:00`)
    : new Date(rawDate);
  const validDate = registeredAt && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  return {
    ...user,
    id: user.id || user.schemaId || user.email,
    name,
    invitation: invitationUrl({ ...user, name }),
    email: user.email || 'Sin correo',
    role,
    avatar: user.avatar || name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(),
    avatarColor: user.avatarColor || user.avatar_color || '#1A237E',
    xp: Number(user.xp || user.puntos_xp || 0),
    level: Number(user.level || 1),
    registeredAt,
    registeredAtLabel: validDate ? registrationDateFormatter.format(validDate) : 'Fecha no disponible',
  };
}

export default function Admin() {
  const [dimension, setDimension] = useState('region');
  const [groupFilter, setGroupFilter] = useState(null);
  const [tab, setTab] = useState('users');
  const [userQuery, setUserQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const [payload, setPayload] = useState({ metrics: null, weeklyActivity: [], regionActivity: [], users: [], content: [], missions: [] });
  const actor = useAppStore(s => s.currentUser?.id);
  const contacts = useFollowup('contacts', tab === 'users');
  const referrals = useFollowup('referrals', tab === 'referrals');
  const directory = useMemo(() => new Map(payload.users.map(u=>[u.id,u])), [payload.users]);
  const contactMap = useMemo(() => new Map((contacts.rows || []).map(r=>[r.member_id,r])), [contacts.rows]);
  const [contactFilter, setContactFilter] = useState('');
  const locks = useRef(new Set());
  const [busyIds, setBusyIds] = useState(new Set());
  const contactReady = Boolean(contacts.rows && !contacts.error);
  async function contactAction(user, action) {
    if (locks.current.has(user.id) || !contactReady) return;
    let popup;
    if (action === 'open' || action === 'resume') {
      if (!user.invitation) return;
      // Reserve the tab during the click (mobile popup policy), but do not send
      // the phone number to WhatsApp until the server grants this admin the chat.
      popup = window.open('about:blank','_blank');
      if (!popup) { toast.error('Permite las ventanas emergentes para abrir WhatsApp.'); return; }
      popup.opener = null;
    }
    locks.current.add(user.id); setBusyIds(new Set(locks.current));
    try {
      const result = await api.admin.whatsapp(user.id,action);
      contacts.applyContact(user.id,result.contact);
      if (popup) {
        if (result.may_open && !popup.closed) popup.location.replace(user.invitation);
        else { popup.close(); toast(result.may_open ? 'Chat reservado. Puedes continuarlo desde la ficha.' : 'El contacto ya se había tomado. Revisa su estado.'); }
      } else toast.success(action === 'sent' ? 'Mensaje marcado como enviado.' : 'Contacto disponible de nuevo.');
    } catch {
      popup?.close();
      toast.error('No se pudo completar la acción. Revisa el estado antes de reintentar.');
      void contacts.refresh();
    } finally { locks.current.delete(user.id); setBusyIds(new Set(locks.current)); }
  }
  function contactControl(user, detail = false) {
    return <OutreachControl user={user} row={contactMap.get(user.id)} directory={directory} actor={actor}
      ready={contactReady} busy={busyIds.has(user.id)} onAction={contactAction} detail={detail} />;
  }

  const exportDatabase = async () => {
    if (exporting) return;
    setExporting(true);
    setExportStatus('Preparando las tres hojas…');
    try {
      if (!api.admin?.exportDatabase) throw new Error('La exportación no está disponible en esta conexión.');
      const [data, { downloadDatabaseWorkbook }] = await Promise.all([
        api.admin.exportDatabase(), import('../utils/databaseExport'),
      ]);
      await downloadDatabaseWorkbook(data);
      setExportStatus(`Excel listo: ${data.usuarios.length} usuarios, ${data.publicaciones.length} publicaciones y ${data.misiones.length} misiones.`);
      toast.success('Excel listo para descargar');
    } catch (error) {
      setExportStatus(error.message || 'No pudimos exportar los datos. Intenta de nuevo.');
      toast.error(error.message || 'No se pudo preparar el Excel');
    } finally { setExporting(false); }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      api.dashboard.get(),
      api.perfiles.list({ sort: 'registered_desc' }),
      api.content.list({}),
      api.missions.list(),
    ]).then(([dashboard, users, content, missions]) => {
      if (!active) return;
      setPayload({
        metrics: dashboard.metrics,
        weeklyActivity: dashboard.weeklyActivity,
        regionActivity: dashboard.regionActivity,
        users: users.map(normalizeAdminUser),
        content,
        missions,
      });
    }).catch((error) => {
      if (active) setLoadError(error.message || 'No se pudo cargar el panel de superadmin');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const groups = useMemo(() => directoryGroups(payload.users, dimension), [payload.users, dimension]);
  const filteredUsers = payload.users.filter((user) => {
    const row = contactMap.get(user.id);
    const status = row?.sent_at ? 'sent' : row ? 'open' : user.invitation ? 'pending' : 'noPhone';
    return (!contactFilter || (contactReady && (contactFilter === 'mine' ? status === 'open' && row?.opened_by === actor : status === contactFilter))) &&
      (!groupFilter || directoryGroup(user, groupFilter.dimension).key === groupFilter.key) &&
      (user.name.toLowerCase().includes(userQuery.toLowerCase()) || user.email.toLowerCase().includes(userQuery.toLowerCase()));
  });
  const roleData = [
    { name: 'Multiplicadores', value: payload.users.filter((user) => user.role === 'multiplicador').length },
    { name: 'Pastores/Directivos', value: payload.users.filter((user) => user.role === 'pastor').length },
    { name: 'Admins', value: payload.users.filter((user) => user.role === 'admin').length },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div><div className="flex items-center gap-2 mb-1"><Shield size={20} className="text-[#1A237E]" /><h2 className="text-2xl font-black text-[#0F172A]">Panel Superadmin</h2></div><p className="text-[#475569] text-sm">Usuarios, contenido y operación nacional.</p></div>
        <button type="button" onClick={exportDatabase} disabled={exporting} className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-3 rounded-xl bg-[#1A237E] text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-wait hover:bg-[#131b62] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A237E]">{exporting ? <Loader2 size={18} className="spin" /> : <Download size={18} />}{exporting ? 'Preparando Excel…' : 'Exportar Excel'}</button>
      </motion.div>

      <div className="admin-export-summary"><p>El Excel incluye usuarios y contactos, publicaciones y misiones. Contiene datos personales: compártelo solo con personas autorizadas.</p><p role="status">{exportStatus}</p></div>

      {loading && <div className="card p-8 text-center text-sm text-[#475569]">Cargando información del sistema...</div>}
      {loadError && !loading && <div className="card p-5 border-red-200 bg-red-50 text-sm text-red-700">{loadError}</div>}

      {!loading && !loadError && <div className="flex gap-2 flex-wrap">
        {adminTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === id ? 'bg-[#1A237E] text-white' : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F5F7FA]'}`}><Icon size={14} />{label}</button>
        ))}
      </div>}

      {!loading && !loadError && tab === 'analytics' && payload.metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total usuarios', value: formatNumber(payload.metrics.totalEmbajadores), color: '#1A237E', Icon: Users },
              { label: 'Activos', value: formatNumber(payload.metrics.embajadoresActivos), color: '#22c55e', Icon: Shield },
              { label: 'Compartidos', value: formatNumber(payload.metrics.contenidosCompartidos), color: '#D4AF37', Icon: TrendingUp },
              { label: 'XP generado', value: formatNumber(payload.metrics.xpGenerado), color: '#5C1800', Icon: Star },
            ].map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="card p-4 text-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${item.color}15` }}><item.Icon size={16} style={{ color: item.color }} /></div>
                <p className="text-2xl font-black" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[#475569] text-xs mt-0.5">{item.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="card p-5 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-[#0F172A]">Dónde está la red</h3>
                <label className="text-sm">Agrupar por <select className="directory-select" value={dimension} onChange={e => setDimension(e.target.value)}>
                  {Object.entries(groupDimensions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select></label>
              </div>
              <p className="text-sm text-[#475569] my-2">Selecciona un grupo para ver sus integrantes.</p>
              <ul className="directory-groups">{groups.map(group => <li key={group.key}><button type="button" onClick={() => {
                setGroupFilter({ ...group, dimension }); setUserQuery(''); setContactFilter(''); setTab('users');
              }}><span>{group.label}</span><strong>{formatNumber(group.count)}</strong></button></li>)}</ul>
              {!groups.length && <p>Aún no hay usuarios registrados.</p>}
            </section>
            <div className="card p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Actividad por región</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={payload.regionActivity} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => formatNumber(value)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Bar dataKey="compartidos" fill="#1A237E" radius={[6, 6, 0, 0]} name="Compartidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Distribución de roles</h3>
              <div className="flex items-center gap-6">
                <PieChart width={140} height={140}><Pie data={roleData} cx={65} cy={65} innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}>{roleData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} />)}</Pie></PieChart>
                <div className="space-y-2.5">{roleData.map((role, index) => <div key={role.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[index] }} /><span className="text-xs text-[#475569]">{role.name}</span><span className="text-xs font-bold text-[#0F172A] ml-auto">{role.value}</span></div>)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !loadError && tab === 'content' && (
        <div className="space-y-4">
          <p className="text-sm text-[#475569]">{payload.content.length} contenidos publicados</p>
          <div className="space-y-2">
            {payload.content.map((content, index) => (
              <motion.div key={content.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A237E] to-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-[#0F172A] truncate">{content.title}</p><div className="flex items-center gap-3 mt-0.5"><span className="text-[10px] text-[#94A3B8]">{content.category}</span><span className="text-[10px] text-[#94A3B8]">{content.shares.toLocaleString()} compartidos</span>{content.featured && <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#D4AF37]"><Star size={9} fill="#D4AF37" /> Destacado</span>}</div></div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && !loadError && tab === 'referrals' && <ReferralReport data={referrals} directory={directory} />}
      {!loading && !loadError && tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap"><p className="text-sm text-[#475569]">{filteredUsers.length} usuarios{groupFilter ? ` · ${groupDimensions[groupFilter.dimension]}: ${groupFilter.label}` : ' registrados'}</p>{groupFilter && <button type="button" className="underline text-sm" onClick={() => setGroupFilter(null)}>Quitar filtro</button>}<span className="text-xs text-[#475569]">Ordenados por fecha de registro</span></div>
          <div className="relative"><Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" /><input className="input-base pl-10" placeholder="Buscar por nombre o correo..." value={userQuery} onChange={(e) => setUserQuery(e.target.value)} /></div>
          <div className="followup-toolbar"><label>WhatsApp <select className="directory-select" value={contactFilter} onChange={e=>setContactFilter(e.target.value)}>
            <option value="">Todos</option><option value="pending">Sin gestionar</option><option value="open">Chat abierto</option><option value="mine">Mis chats abiertos</option><option value="sent">Enviado</option><option value="noPhone">Sin WhatsApp válido</option>
          </select></label><button type="button" className="followup-link" onClick={contacts.refresh}>Actualizar seguimiento</button></div>
          <p className="text-sm text-[#475569]" role="status">{contacts.error || (!contacts.rows ? 'Cargando seguimiento…' : 'Abrir WhatsApp reserva el contacto a tu nombre. Al volver, marca el mensaje como enviado.')}</p>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div key={user.id} className="card p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: user.avatarColor }}>{user.avatar}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-[#0F172A] break-words">{user.name}</p><div className="flex items-center gap-2 mt-0.5 flex-wrap"><span className="text-xs text-[#475569] break-all">{user.email}</span><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge[user.role] || roleBadge.multiplicador}`}>{roleLabel[user.role] || user.role}</span></div></div>
                <div className="flex items-center gap-1.5 text-xs text-[#475569] whitespace-nowrap"><CalendarDays size={14} className="text-[#1A237E]" /><span><span className="hidden sm:inline">Registrado: </span>{user.registeredAtLabel}</span></div>
                <div className="hidden md:flex items-center gap-3 text-xs"><span className="font-bold text-[#D4AF37]">{user.xp.toLocaleString()} XP</span><span className="text-[#94A3B8]">Nv. {user.level} — {getLevelTitle(user.level)}</span></div>
                {contactControl(user)}
              </div>
              <details className="mt-3 border-t border-[#E2E8F0] pt-3">
                <summary className="cursor-pointer text-xs font-semibold text-[#1A237E] py-1">Ver información del usuario</summary>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-3 text-sm">
                  {[
                    ['Distrito', user.districtName || user.district || 'Sin registrar'],
                    ['Iglesia', user.congregation || 'Sin registrar'],
                    ['WhatsApp', user.phone || 'Sin registrar'],
                    ['Región', user.regionName || 'Sin registrar'],
                    ['Cargo', user.position || 'Sin registrar'],
                    ['Redes sociales', user.socialUsername || 'Sin registrar'],
                    ['Estado', user.active ? 'Cuenta activa' : 'Cuenta inactiva'],
                    ['Permiso editorial', user.canPublish ? 'Puede publicar y editar' : 'Solo participación'],
                    ['Puntos y nivel', `${user.xp.toLocaleString('es-CO')} XP · Nivel ${user.level}`],
                  ].map(([label, value]) => <div key={label}><dt className="text-xs text-[#475569]">{label}</dt><dd className="mt-1 text-[#0F172A] break-words">{value}</dd></div>)}
                </dl>
                {contactControl(user,true)}
              </details>
              </div>
            ))}
            {!filteredUsers.length && <div className="card p-8 text-center text-sm text-[#475569]">No hay usuarios que coincidan con la búsqueda.</div>}
          </div>
        </div>
      )}

      {!loading && !loadError && tab === 'missions' && (
        <div className="space-y-4">
          <p className="text-sm text-[#475569]">{payload.missions.length} misiones configuradas</p>
          <div className="space-y-2">
            {payload.missions.map((mission, index) => (
              <motion.div key={mission.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.06 }} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A237E]/10 flex items-center justify-center flex-shrink-0"><Target size={16} className="text-[#1A237E]" /></div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-[#0F172A]">{mission.title}</p><p className="text-[10px] text-[#94A3B8]">{mission.description}</p></div>
                <div className="text-right flex-shrink-0"><p className="text-sm font-bold text-[#D4AF37]">+{mission.xpReward} XP</p><p className="text-[10px] text-[#94A3B8] capitalize">{mission.type}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
