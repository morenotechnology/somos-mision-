// ─── REGIONES ──────────────────────────────────────────────────────────────
export const regions = [
  { id: 'r1', name: 'Costa Atlántica',    color: '#1A237E' },
  { id: 'r2', name: 'Noroccidental',      color: '#283593' },
  { id: 'r3', name: 'Centro',             color: '#3949AB' },
  { id: 'r4', name: 'Suroccidental',      color: '#5C6BC0' },
  { id: 'r5', name: 'Amazonia',           color: '#7986CB' },
  { id: 'r6', name: 'Llanos Orientales',  color: '#9FA8DA' },
];

export const districts = [
  { id: 'd1',  regionId: 'r1', name: 'Barranquilla Norte' },
  { id: 'd2',  regionId: 'r1', name: 'Cartagena' },
  { id: 'd3',  regionId: 'r2', name: 'Medellín Central' },
  { id: 'd4',  regionId: 'r2', name: 'Antioquia Norte' },
  { id: 'd5',  regionId: 'r3', name: 'Bogotá Centro' },
  { id: 'd6',  regionId: 'r3', name: 'Bogotá Sur' },
  { id: 'd7',  regionId: 'r4', name: 'Cali Norte' },
  { id: 'd8',  regionId: 'r4', name: 'Valle del Cauca' },
  { id: 'd9',  regionId: 'r5', name: 'Putumayo' },
  { id: 'd10', regionId: 'r6', name: 'Villavicencio' },
];

// ─── COORDINACIONES ────────────────────────────────────────────────────────
export const coordinations = [
  { id: 'c1', name: 'Evangelismo Estudiantil',  icon: 'GraduationCap', color: '#1A237E', members: 842 },
  { id: 'c2', name: 'Evangelismo Hospitalario', icon: 'HeartPulse',     color: '#5C1800', members: 315 },
  { id: 'c3', name: 'Evangelismo Carcelario',   icon: 'Scale',          color: '#283593', members: 228 },
  { id: 'c4', name: 'Grupos Étnicos',            icon: 'Leaf',           color: '#2E7D32', members: 194 },
  { id: 'c5', name: 'Grupos Especiales',         icon: 'Heart',          color: '#6A1B9A', members: 267 },
  { id: 'c6', name: 'Medios y Comunicación',     icon: 'Radio',          color: '#E65100', members: 531 },
  { id: 'c7', name: 'Ministerio Infantil',       icon: 'Baby',           color: '#00838F', members: 612 },
  { id: 'c8', name: 'Juventud Misionera',        icon: 'Flame',          color: '#AD1457', members: 978 },
];

// ─── BADGES ────────────────────────────────────────────────────────────────
export const badges = [
  { id: 'b1', name: 'Primer Paso',       icon: 'Sprout',    description: 'Compartiste tu primer contenido', xp: 50,   color: '#22c55e' },
  { id: 'b2', name: 'Multiplicador',     icon: 'Zap',       description: 'Compartiste 10 contenidos',       xp: 200,  color: '#D4AF37' },
  { id: 'b3', name: 'Embajador Activo',  icon: 'Medal',     description: 'Mantuviste racha de 7 días',      xp: 500,  color: '#1A237E' },
  { id: 'b4', name: 'Voz Nacional',      icon: 'Megaphone', description: 'Llegaste a 1000 XP',              xp: 1000, color: '#D4AF37' },
  { id: 'b5', name: 'Misionero Digital', icon: 'Globe',     description: 'Completaste 5 misiones',          xp: 750,  color: '#5C1800' },
  { id: 'b6', name: 'Llama de Fuego',    icon: 'Flame',     description: 'Top 10 del ranking nacional',     xp: 2000, color: '#E65100' },
  { id: 'b7', name: 'Columna de Luz',    icon: 'Sparkles',  description: 'Racha de 30 días',                xp: 3000, color: '#7986CB' },
  { id: 'b8', name: 'Pionero IPUC',      icon: 'Crown',     description: 'Nivel 10 alcanzado',              xp: 5000, color: '#D4AF37' },
];

// ─── MISSIONS ──────────────────────────────────────────────────────────────
export const missions = [
  { id: 'm1', type: 'daily',   title: 'Primera Misión del Día', description: 'Comparte 1 contenido oficial hoy',     xpReward: 50,   goal: 1,  unit: 'contenidos', icon: 'Zap',       status: 'completed' },
  { id: 'm2', type: 'daily',   title: 'Mensajero Activo',       description: 'Comparte 3 contenidos hoy',            xpReward: 120,  goal: 3,  unit: 'contenidos', icon: 'Megaphone', status: 'in_progress', progress: 1 },
  { id: 'm3', type: 'daily',   title: 'Perfil Completo',        description: 'Completa tu información de perfil',    xpReward: 80,   goal: 1,  unit: 'pasos',      icon: 'UserCheck', status: 'pending' },
  { id: 'm4', type: 'weekly',  title: 'Semana de Impacto',      description: 'Comparte 10 contenidos esta semana',   xpReward: 500,  goal: 10, unit: 'contenidos', icon: 'Trophy',    status: 'in_progress', progress: 4 },
  { id: 'm5', type: 'weekly',  title: 'Racha Semanal',          description: 'Mantén racha de 5 días seguidos',      xpReward: 300,  goal: 5,  unit: 'días',       icon: 'Flame',     status: 'in_progress', progress: 3 },
  { id: 'm6', type: 'weekly',  title: 'Campaña Temática',       description: 'Participa en la campaña de la semana', xpReward: 400,  goal: 1,  unit: 'campañas',   icon: 'Megaphone', status: 'pending' },
  { id: 'm7', type: 'special', title: 'Voz del Movimiento',     description: 'Sube al Top 50 del ranking nacional',  xpReward: 1000, goal: 1,  unit: 'logro',      icon: 'Crown',     status: 'locked' },
];

// ─── USERS — internal app schema (works with all components & store) ───────
export const users = [
  { id: 'u1', name: 'Carlos Andrés Pérez',  email: 'carlos@ipuc.org',  role: 'multiplicador', region: 'r3', district: 'd5', congregation: 'Bogotá Centro Vivo',       xp: 4850, level: 9,  streak: 14,  shared: 127, missionsCompleted: 18, badges: ['b1','b2','b3','b4','b5','b6'],            avatar: 'CA', avatarColor: '#1A237E', joinedAt: '2024-01-15', active: true },
  { id: 'u2', name: 'Sandra Milena Ríos',   email: 'sandra@ipuc.org',  role: 'multiplicador', region: 'r2', district: 'd3', congregation: 'Medellín Luz y Vida',      xp: 4210, level: 8,  streak: 21,  shared: 98,  missionsCompleted: 15, badges: ['b1','b2','b3','b4','b5'],                 avatar: 'SM', avatarColor: '#AD1457', joinedAt: '2024-02-10', active: true },
  { id: 'u3', name: 'Jhon Freddy Torres',   email: 'jhon@ipuc.org',    role: 'multiplicador', region: 'r1', district: 'd1', congregation: 'Barranquilla Nueva Esp.', xp: 3980, level: 8,  streak: 7,   shared: 85,  missionsCompleted: 12, badges: ['b1','b2','b3','b4'],                      avatar: 'JT', avatarColor: '#283593', joinedAt: '2024-01-28', active: true },
  { id: 'u4', name: 'María Lucía Vargas',   email: 'maria@ipuc.org',   role: 'pastor',        region: 'r4', district: 'd7', congregation: 'Cali Maranatha',           xp: 3540, level: 7,  streak: 5,   shared: 62,  missionsCompleted: 10, badges: ['b1','b2','b3'],                           avatar: 'ML', avatarColor: '#6A1B9A', joinedAt: '2024-03-05', active: true },
  { id: 'u5', name: 'Diego Hernán Castro',  email: 'diego@ipuc.org',   role: 'multiplicador', region: 'r3', district: 'd6', congregation: 'Bogotá Sur Bendición',     xp: 3210, level: 7,  streak: 3,   shared: 71,  missionsCompleted: 9,  badges: ['b1','b2','b3'],                           avatar: 'DC', avatarColor: '#00838F', joinedAt: '2024-02-20', active: true },
  { id: 'u6', name: 'Adriana Gómez Reyes',  email: 'adriana@ipuc.org', role: 'multiplicador', region: 'r2', district: 'd4', congregation: 'Antioquia Esperanza Viva', xp: 2870, level: 6,  streak: 9,   shared: 55,  missionsCompleted: 8,  badges: ['b1','b2'],                                avatar: 'AG', avatarColor: '#E65100', joinedAt: '2024-03-15', active: true },
  { id: 'u7', name: 'Eduardo Lozano',       email: 'eduardo@ipuc.org', role: 'pastor',        region: 'r1', district: 'd2', congregation: 'Cartagena Misión',         xp: 2650, level: 6,  streak: 12,  shared: 48,  missionsCompleted: 7,  badges: ['b1','b2'],                                avatar: 'EL', avatarColor: '#2E7D32', joinedAt: '2024-01-10', active: true },
  { id: 'u8', name: 'Admin Nacional IPUC',  email: 'admin@ipuc.org',   role: 'admin',         region: 'r3', district: 'd5', congregation: 'Nacional',                 xp: 9999, level: 10, streak: 365, shared: 500, missionsCompleted: 50, badges: ['b1','b2','b3','b4','b5','b6','b7','b8'],  avatar: 'AN', avatarColor: '#D4AF37', joinedAt: '2023-01-01', active: true },
];

// ─── PERFILES — Supabase DB schema (swap users → perfiles when connecting) ─
// Table: perfiles — campo a campo según el schema de la imagen
export const perfiles = users.map((u) => ({
  id:                  u.id,
  nombre_completo:     u.name,
  email:               u.email,
  rol:                 u.role,                      // enum: 'admin' | 'pastor' | 'multiplicador'
  distrito:            u.district,
  congregacion_nombre: u.congregation,
  puntos_xp:           u.xp,
  rango:               `Nivel ${u.level}`,
  foto_perfil_url:     null,
  avatar:              u.avatar,
  avatarColor:         u.avatarColor,
  created_at:          `${u.joinedAt}T10:00:00Z`,
  cuenta_activa:       u.active,
  ranking_posicion:    [...users].sort((a, b) => b.xp - a.xp).findIndex((x) => x.id === u.id) + 1,
}));

// ─── CONTENT — internal app schema ────────────────────────────────────────
export const contentItems = [
  { id: 'cnt1', title: '¡Colombia se está transformando!',         description: 'Las misiones nacionales de la IPUC están llegando a los rincones más alejados de Colombia.',     category: 'Testimonio', coordination: 'c8', format: 'texto',    featured: true,  xpReward: 50,  shares: 1247, likes: 3892, createdAt: '2024-05-01', copyText: 'Las misiones nacionales de la IPUC están llevando esperanza a cada rincón de nuestra nación. #SomosMisiónColombia #IPUC',              imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75' },
  { id: 'cnt2', title: 'Campaña: Estudiantes con Misión 2024',     description: 'El evangelismo estudiantil llega a 200 universidades colombianas. Comparte y suma al movimiento.', category: 'Campaña',   coordination: 'c1', format: 'imagen',   featured: true,  xpReward: 75,  shares: 892,  likes: 2341, createdAt: '2024-05-03', copyText: 'El evangelismo estudiantil de la IPUC llega a 200 universidades colombianas. #EstudiantesConMisión',                               imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=75' },
  { id: 'cnt3', title: 'Ministerio en Hospitales: Fe que Sana',    description: 'Nuestros equipos hospitalarios visitaron 45 hospitales en Colombia este mes.',                     category: 'Impacto',   coordination: 'c2', format: 'video',    featured: false, xpReward: 60,  shares: 534,  likes: 1876, createdAt: '2024-05-05', copyText: 'Los equipos hospitalarios de la IPUC visitaron 45 hospitales este mes. #FeMisiónIPUC',                                               imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=75' },
  { id: 'cnt4', title: 'Grupos Étnicos: El Evangelio en Amazonía', description: 'Por primera vez, equipos misioneros llegaron a comunidades indígenas del Vaupés.',                 category: 'Hito',      coordination: 'c4', format: 'texto',    featured: true,  xpReward: 100, shares: 2103, likes: 5421, createdAt: '2024-05-07', copyText: 'Por primera vez el evangelio llega a comunidades indígenas del Vaupés. La IPUC avanza hasta los confines. #GruposÉtnicos',              imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=75' },
  { id: 'cnt5', title: 'Juventud Misionera: 10.000 Jóvenes',       description: 'El movimiento de juventud misionera superó los 10.000 jóvenes activos en Colombia.',               category: 'Campaña',   coordination: 'c8', format: 'carrusel', featured: true,  xpReward: 80,  shares: 3412, likes: 8934, createdAt: '2024-05-08', copyText: '10.000 jóvenes en acción. La Juventud Misionera de la IPUC rompe récords. #JuventudMisionera',                                       imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=75' },
  { id: 'cnt6', title: 'Ministerio Carcelario en 2024',            description: 'Más de 80 centros penitenciarios están siendo alcanzados por el evangelio cada domingo.',           category: 'Impacto',   coordination: 'c3', format: 'imagen',   featured: false, xpReward: 55,  shares: 321,  likes: 987,  createdAt: '2024-05-09', copyText: '80 centros penitenciarios alcanzados. La libertad espiritual no tiene muros. #MisiónCarcelaria',                                        imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=75' },
];

// ─── COMUNICADOS NACIONALES — Supabase DB schema ───────────────────────────
// Table: comunicados_nacionales — swap contentItems → comunicados when connecting
export const comunicados_nacionales = contentItems.map((c) => ({
  id:            c.id,
  titulo:        c.title,
  contenido:     c.copyText,
  autor_id:      'u8',
  activo:        true,
  created_at:    `${c.createdAt}T10:00:00Z`,
  media_url:     c.imageUrl,
  xp_recompensa: c.xpReward,
  categoria:     c.category,
}));

// ─── GLOBAL METRICS ────────────────────────────────────────────────────────
export const globalMetrics = {
  totalEmbajadores:      4287,
  embajadoresActivos:    3142,
  contenidosPublicados:  284,
  contenidosCompartidos: 124509,
  regionesConectadas:    6,
  distritosImpactados:   48,
  xpGenerado:            1842300,
  misionesCompletadas:   18947,
};

export const weeklyActivity = [
  { day: 'Lun', shares: 1240, xp: 62000  },
  { day: 'Mar', shares: 1890, xp: 94500  },
  { day: 'Mié', shares: 1560, xp: 78000  },
  { day: 'Jue', shares: 2100, xp: 105000 },
  { day: 'Vie', shares: 2450, xp: 122500 },
  { day: 'Sáb', shares: 1980, xp: 99000  },
  { day: 'Dom', shares: 2870, xp: 143500 },
];

export const regionActivity = [
  { name: 'Costa Atlántica',   embajadores: 842,  compartidos: 28400 },
  { name: 'Noroccidental',     embajadores: 978,  compartidos: 35100 },
  { name: 'Centro',            embajadores: 1120, compartidos: 41800 },
  { name: 'Suroccidental',     embajadores: 634,  compartidos: 21200 },
  { name: 'Amazonia',          embajadores: 289,  compartidos: 9800  },
  { name: 'Llanos Orientales', embajadores: 424,  compartidos: 14200 },
];
