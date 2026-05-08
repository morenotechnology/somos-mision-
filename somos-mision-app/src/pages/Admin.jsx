import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, Target, BarChart2, Plus, Search,
  CheckCircle, XCircle, Edit, Trash2, Eye, Shield,
  TrendingUp, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { users, contentItems, globalMetrics, regionActivity, missions } from '../data/mockData';
import { formatNumber, getLevelTitle } from '../utils/helpers';
import toast from 'react-hot-toast';

const adminTabs = [
  { id: 'analytics', label: 'Analítica',  icon: BarChart2 },
  { id: 'content',   label: 'Contenido',  icon: BookOpen  },
  { id: 'users',     label: 'Usuarios',   icon: Users     },
  { id: 'missions',  label: 'Misiones',   icon: Target    },
];

const PIE_COLORS = ['#1A237E', '#D4AF37', '#5C6BC0'];

const roleLabel = { admin: 'Admin', pastor: 'Pastor', multiplicador: 'Multiplicador' };
const roleBadge = {
  admin:         'bg-red-100 text-red-700',
  pastor:        'bg-purple-100 text-purple-700',
  multiplicador: 'bg-blue-100 text-[#1A237E]',
};

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [userQuery, setUserQuery] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  const roleData = [
    { name: 'Multiplicadores', value: users.filter((u) => u.role === 'multiplicador').length },
    { name: 'Pastores',        value: users.filter((u) => u.role === 'pastor').length },
    { name: 'Admins',          value: users.filter((u) => u.role === 'admin').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-[#1A237E]" />
            <h2 className="text-2xl font-black text-[#0F172A]">Panel Admin</h2>
          </div>
          <p className="text-[#475569] text-sm">Control total del sistema.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-red-700">Acceso Administrador</span>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {adminTabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              tab === id
                ? 'bg-[#1A237E] text-white'
                : 'bg-white text-[#475569] border border-[#E2E8F0] hover:bg-[#F5F7FA]'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS ────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total usuarios',  value: formatNumber(globalMetrics.totalEmbajadores),      color: '#1A237E', Icon: Users     },
              { label: 'Activos',         value: formatNumber(globalMetrics.embajadoresActivos),     color: '#22c55e', Icon: CheckCircle },
              { label: 'Compartidos',     value: formatNumber(globalMetrics.contenidosCompartidos),  color: '#D4AF37', Icon: TrendingUp },
              { label: 'XP generado',     value: formatNumber(globalMetrics.xpGenerado),             color: '#5C1800', Icon: Star       },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} className="card p-4 text-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: `${k.color}15` }}>
                  <k.Icon size={16} style={{ color: k.color }} />
                </div>
                <p className="text-2xl font-black" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[#475569] text-xs mt-0.5">{k.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Actividad por región</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={regionActivity} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(v) => formatNumber(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Bar dataKey="compartidos" fill="#1A237E" radius={[6, 6, 0, 0]} name="Compartidos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-[#0F172A] mb-4">Distribución de roles</h3>
              <div className="flex items-center gap-6">
                <PieChart width={140} height={140}>
                  <Pie data={roleData} cx={65} cy={65} innerRadius={38} outerRadius={62}
                    dataKey="value" paddingAngle={3}>
                    {roleData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-2.5">
                  {roleData.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-[#475569]">{r.name}</span>
                      <span className="text-xs font-bold text-[#0F172A] ml-auto">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT ──────────────────────────────────────── */}
      {tab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#475569]">{contentItems.length} contenidos publicados</p>
            <button onClick={() => toast.success('Formulario de nuevo contenido — próximamente')}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5">
              <Plus size={13} /> Nuevo contenido
            </button>
          </div>
          <div className="space-y-2">
            {contentItems.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="card p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.imageGradient} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A] truncate">{c.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-[#94A3B8]">{c.category}</span>
                    <span className="text-[10px] text-[#94A3B8]">{c.shares.toLocaleString()} compartidos</span>
                    {c.featured && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#D4AF37]">
                        <Star size={9} fill="#D4AF37" /> Destacado
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => toast.success('Vista previa')}
                    className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#94A3B8] hover:text-[#1A237E] transition">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => toast.success('Editar contenido')}
                    className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#94A3B8] hover:text-[#1A237E] transition">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => toast.error('Contenido eliminado')}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS ────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input className="input-base pl-10"
              placeholder="Buscar por nombre o correo..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filteredUsers.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: u.avatarColor }}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A] truncate">{u.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#94A3B8]">{u.email}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs">
                  <span className="font-bold text-[#D4AF37]">{u.xp.toLocaleString()} XP</span>
                  <span className="text-[#94A3B8]">Nv. {u.level} — {getLevelTitle(u.level)}</span>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => toast.success(`${u.name} activado`)}
                    className="p-1.5 rounded-lg hover:bg-green-50 text-[#94A3B8] hover:text-green-600 transition"
                    title="Activar">
                    <CheckCircle size={15} />
                  </button>
                  <button onClick={() => toast.error(`${u.name} desactivado`)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition"
                    title="Desactivar">
                    <XCircle size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── MISSIONS ─────────────────────────────────────── */}
      {tab === 'missions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#475569]">{missions.length} misiones configuradas</p>
            <button onClick={() => toast.success('Nueva misión — próximamente')}
              className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5">
              <Plus size={13} /> Nueva misión
            </button>
          </div>
          <div className="space-y-2">
            {missions.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#1A237E]/10 flex items-center justify-center flex-shrink-0">
                  <Target size={16} className="text-[#1A237E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A]">{m.title}</p>
                  <p className="text-[10px] text-[#94A3B8]">{m.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#D4AF37]">+{m.xpReward} XP</p>
                  <p className="text-[10px] text-[#94A3B8] capitalize">{m.type}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => toast.success('Editar misión')}
                    className="p-1.5 rounded-lg hover:bg-[#F5F7FA] text-[#94A3B8] hover:text-[#1A237E] transition">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => toast.error('Misión eliminada')}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-red-500 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
