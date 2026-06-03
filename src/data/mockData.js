// ─── REGIONES ──────────────────────────────────────────────────────────────
export const regions = [
  { id: 'r1', name: 'Andina',     color: '#1A237E' },
  { id: 'r2', name: 'Caribe',     color: '#283593' },
  { id: 'r3', name: 'Pacífica',   color: '#3949AB' },
  { id: 'r4', name: 'Orinoquía',  color: '#5C6BC0' },
  { id: 'r5', name: 'Amazonía',   color: '#7986CB' },
];

export const districts = [
  ...Array.from({ length: 7 }, (_, index) => ({ id: `d${index + 1}`, regionId: 'r1', region_id: 'r1', name: `Distrito ${index + 1}` })),
  ...Array.from({ length: 7 }, (_, index) => ({ id: `d${index + 8}`, regionId: 'r2', region_id: 'r2', name: `Distrito ${index + 8}` })),
  ...Array.from({ length: 7 }, (_, index) => ({ id: `d${index + 15}`, regionId: 'r3', region_id: 'r3', name: `Distrito ${index + 15}` })),
  ...Array.from({ length: 7 }, (_, index) => ({ id: `d${index + 22}`, regionId: 'r4', region_id: 'r4', name: `Distrito ${index + 22}` })),
  ...Array.from({ length: 7 }, (_, index) => ({ id: `d${index + 29}`, regionId: 'r5', region_id: 'r5', name: `Distrito ${index + 29}` })),
];

const profileIds = {
  u1: '11111111-1111-4111-8111-111111111111',
  u2: '22222222-2222-4222-8222-222222222222',
  u3: '33333333-3333-4333-8333-333333333333',
  u4: '44444444-4444-4444-8444-444444444444',
  u5: '55555555-5555-4555-8555-555555555555',
  u6: '66666666-6666-4666-8666-666666666666',
  u7: '77777777-7777-4777-8777-777777777777',
  u8: '88888888-8888-4888-8888-888888888888',
};

// ─── CONGREGACIONES — Supabase DB schema ──────────────────────────────────
export const congregaciones = [
  {
    id: 101,
    nombre: 'Bogotá Centro Vivo',
    direccion: 'Carrera 13 #32-45',
    distrito: 'Bogotá Centro',
    latitud: 4.60971,
    longitud: -74.08175,
    lat: 4.60971,
    lng: -74.08175,
    descripcion: 'Congregación urbana con equipos activos de medios y juventud.',
    redes_sociales: { instagram: '@ipucbogotacentro', facebook: 'IPUC Bogotá Centro' },
    es_punto_blanco: false,
    portada_url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1200&q=75',
  },
  {
    id: 102,
    nombre: 'Medellín Luz y Vida',
    direccion: 'Calle 50 #48-22',
    distrito: 'Medellín Central',
    latitud: 6.2442,
    longitud: -75.5812,
    lat: 6.2442,
    lng: -75.5812,
    descripcion: 'Base regional para equipos de evangelismo estudiantil.',
    redes_sociales: { instagram: '@ipucmedellinlv' },
    es_punto_blanco: false,
    portada_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=75',
  },
  {
    id: 103,
    nombre: 'Barranquilla Nueva Esperanza',
    direccion: 'Calle 72 #43-18',
    distrito: 'Barranquilla Norte',
    latitud: 10.9878,
    longitud: -74.7889,
    lat: 10.9878,
    lng: -74.7889,
    descripcion: 'Equipo de alcance territorial en barrios y universidades.',
    redes_sociales: { facebook: 'IPUC Nueva Esperanza' },
    es_punto_blanco: true,
    portada_url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=75',
  },
  {
    id: 104,
    nombre: 'Cali Maranatha',
    direccion: 'Avenida 6N #23-15',
    distrito: 'Cali Norte',
    latitud: 3.4516,
    longitud: -76.532,
    lat: 3.4516,
    lng: -76.532,
    descripcion: 'Congregación pastoral con multiplicadores en formación.',
    redes_sociales: { instagram: '@ipuccalimaranatha' },
    es_punto_blanco: false,
    portada_url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=1200&q=75',
  },
  {
    id: 105,
    nombre: 'Bogotá Sur Bendición',
    direccion: 'Calle 42 Sur #18-10',
    distrito: 'Bogotá Sur',
    latitud: 4.5709,
    longitud: -74.117,
    lat: 4.5709,
    lng: -74.117,
    descripcion: 'Punto de movilización digital para campañas metropolitanas.',
    redes_sociales: { instagram: '@ipucbogotasur' },
    es_punto_blanco: true,
    portada_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&q=75',
  },
  {
    id: 106,
    nombre: 'Antioquia Esperanza Viva',
    direccion: 'Carrera 45 #77-20',
    distrito: 'Antioquia Norte',
    latitud: 6.2914,
    longitud: -75.5361,
    lat: 6.2914,
    lng: -75.5361,
    descripcion: 'Red de apoyo para campañas rurales y digitales.',
    redes_sociales: { facebook: 'IPUC Antioquia Esperanza Viva' },
    es_punto_blanco: false,
    portada_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=75',
  },
  {
    id: 107,
    nombre: 'Cartagena Misión',
    direccion: 'Calle 30 #17-50',
    distrito: 'Cartagena',
    latitud: 10.391,
    longitud: -75.4794,
    lat: 10.391,
    lng: -75.4794,
    descripcion: 'Congregación conectada a frentes de evangelismo turístico y social.',
    redes_sociales: { instagram: '@ipuccartagenamision' },
    es_punto_blanco: false,
    portada_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=75',
  },
  {
    id: 108,
    nombre: 'Misiones Nacionales',
    direccion: 'Sede nacional IPUC',
    distrito: 'Bogotá Centro',
    latitud: 4.6483,
    longitud: -74.0962,
    lat: 4.6483,
    lng: -74.0962,
    descripcion: 'Equipo nacional de coordinación y contenido oficial.',
    redes_sociales: { instagram: '@misionesipuc', facebook: 'Misiones Nacionales IPUC' },
    es_punto_blanco: false,
    portada_url: '/hero-map.png',
  },
];

const congregationByName = Object.fromEntries(congregaciones.map((c) => [c.nombre, c]));

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

// ─── USERS — internal app adapter (derived from perfiles for the UI) ───────
const baseUsers = [
  { id: 'u1', name: 'Carlos Andrés Pérez',  email: 'carlos@ipuc.org',  role: 'multiplicador', region: 'r3', district: 'd5', congregation: 'Bogotá Centro Vivo',       xp: 4850, level: 9,  streak: 14,  shared: 127, missionsCompleted: 18, badges: ['b1','b2','b3','b4','b5','b6'],            avatar: 'CA', avatarColor: '#1A237E', joinedAt: '2024-01-15', active: true },
  { id: 'u2', name: 'Sandra Milena Ríos',   email: 'sandra@ipuc.org',  role: 'multiplicador', region: 'r2', district: 'd3', congregation: 'Medellín Luz y Vida',      xp: 4210, level: 8,  streak: 21,  shared: 98,  missionsCompleted: 15, badges: ['b1','b2','b3','b4','b5'],                 avatar: 'SM', avatarColor: '#AD1457', joinedAt: '2024-02-10', active: true },
  { id: 'u3', name: 'Jhon Freddy Torres',   email: 'jhon@ipuc.org',    role: 'multiplicador', region: 'r1', district: 'd1', congregation: 'Barranquilla Nueva Esp.', xp: 3980, level: 8,  streak: 7,   shared: 85,  missionsCompleted: 12, badges: ['b1','b2','b3','b4'],                      avatar: 'JT', avatarColor: '#283593', joinedAt: '2024-01-28', active: true },
  { id: 'u4', name: 'María Lucía Vargas',   email: 'maria@ipuc.org',   role: 'pastor',        region: 'r4', district: 'd7', congregation: 'Cali Maranatha',           xp: 3540, level: 7,  streak: 5,   shared: 62,  missionsCompleted: 10, badges: ['b1','b2','b3'],                           avatar: 'ML', avatarColor: '#6A1B9A', joinedAt: '2024-03-05', active: true },
  { id: 'u5', name: 'Diego Hernán Castro',  email: 'diego@ipuc.org',   role: 'multiplicador', region: 'r3', district: 'd6', congregation: 'Bogotá Sur Bendición',     xp: 3210, level: 7,  streak: 3,   shared: 71,  missionsCompleted: 9,  badges: ['b1','b2','b3'],                           avatar: 'DC', avatarColor: '#00838F', joinedAt: '2024-02-20', active: true },
  { id: 'u6', name: 'Adriana Gómez Reyes',  email: 'adriana@ipuc.org', role: 'multiplicador', region: 'r2', district: 'd4', congregation: 'Antioquia Esperanza Viva', xp: 2870, level: 6,  streak: 9,   shared: 55,  missionsCompleted: 8,  badges: ['b1','b2'],                                avatar: 'AG', avatarColor: '#E65100', joinedAt: '2024-03-15', active: true },
  { id: 'u7', name: 'Eduardo Lozano',       email: 'eduardo@ipuc.org', role: 'pastor',        region: 'r1', district: 'd2', congregation: 'Cartagena Misión',         xp: 2650, level: 6,  streak: 12,  shared: 48,  missionsCompleted: 7,  badges: ['b1','b2'],                                avatar: 'EL', avatarColor: '#2E7D32', joinedAt: '2024-01-10', active: true },
  { id: 'u8', name: 'Admin Nacional IPUC',  email: 'admin@ipuc.org',   role: 'admin',         region: 'r3', district: 'd5', congregation: 'Nacional',                 xp: 9999, level: 10, streak: 365, shared: 500, missionsCompleted: 50, badges: ['b1','b2','b3','b4','b5','b6','b7','b8'],  avatar: 'AN', avatarColor: '#D4AF37', joinedAt: '2023-01-01', active: true },
];

export const users = baseUsers.map((u) => ({
  ...u,
  schemaId: profileIds[u.id],
  congregationId: congregationByName[u.congregation]?.id ?? 108,
}));

// ─── PERFILES — Supabase DB schema (swap users → perfiles when connecting) ─
// Table: perfiles — campo a campo según el schema de la imagen
export const perfiles = users.map((u) => ({
  id:                  u.schemaId,
  nombre:              u.name.split(' ')[0],
  nombre_completo:     u.name,
  email:               u.email,
  rol:                 u.role,                      // enum: 'admin' | 'pastor' | 'multiplicador'
  distrito:            districts.find((d) => d.id === u.district)?.name ?? u.district,
  distrito_id:         u.district,
  congregacion:        u.congregation,
  congregacion_id:     u.congregationId,
  congregacion_nombre: u.congregation,
  xp:                  u.xp,
  puntos_xp:           u.xp,
  rango:               `Nivel ${u.level}`,
  avatar_url:          null,
  foto_perfil_url:     null,
  foto_portada_url:    congregationByName[u.congregation]?.portada_url ?? null,
  avatar:              u.avatar,
  avatarColor:         u.avatarColor,
  created_at:          `${u.joinedAt}T10:00:00Z`,
  celular:             '+57 300 000 0000',
  whatsapp:            '+57 300 000 0000',
  fecha_cumpleanos:    '1990-05-08',
  deletion_requested_at: null,
  cuenta_activa:       u.active,
  ranking_posicion:    [...users].sort((a, b) => b.xp - a.xp).findIndex((x) => x.id === u.id) + 1,
  mostrar_celular:     false,
  mostrar_cumpleanos:  false,
  mostrar_congregacion:true,
  mostrar_email:       false,
  mostrar_distrito:    true,
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

// ─── PUBLICACIONES — Supabase DB schema ────────────────────────────────────
export const publicaciones = contentItems.map((c, index) => ({
  id: index + 1,
  perfil_id: profileIds.u8,
  contenido: c.copyText,
  tipo: c.format,
  media_url: c.imageUrl,
  created_at: `${c.createdAt}T10:00:00Z`,
}));

// ─── COMUNICADOS NACIONALES — Supabase DB schema ───────────────────────────
export const comunicados_nacionales = contentItems.filter((c) => c.featured).map((c, index) => ({
  id: `70000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  contenido: c.copyText,
  autor_id: profileIds.u8,
  activo: true,
  created_at: `${c.createdAt}T10:00:00Z`,
}));

// ─── VICTORIAS — Supabase DB schema ────────────────────────────────────────
export const victorias = contentItems.filter((c) => c.category !== 'Campaña').map((c, index) => ({
  id: `71000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  created_at: `${c.createdAt}T12:00:00Z`,
  autor_id: profileIds[`u${(index % 6) + 1}`],
  contenido: c.description,
  media_url: c.imageUrl,
  es_video: c.format === 'video',
  vistas: c.likes,
  es_oficial: c.featured,
}));

const shareNetwork = ['whatsapp', 'facebook', 'instagram'];
const engagementUsers = users.filter((u) => u.role !== 'admin');

export const compartidos = publicaciones.flatMap((post, postIndex) =>
  engagementUsers.slice(0, Math.min(3 + (postIndex % 3), engagementUsers.length)).map((u, userIndex) => ({
    id: `72000000-0000-4000-8000-${String(postIndex + 1).padStart(2, '0')}${String(userIndex + 1).padStart(10, '0')}`,
    post_id: post.id,
    usuario_id: u.schemaId,
    red_social: shareNetwork[(postIndex + userIndex) % shareNetwork.length],
    created_at: post.created_at,
  }))
);

export const reacciones = publicaciones.flatMap((post, postIndex) =>
  engagementUsers.slice(0, Math.min(4 + (postIndex % 2), engagementUsers.length)).map((u, userIndex) => ({
    id: `73000000-0000-4000-8000-${String(postIndex + 1).padStart(2, '0')}${String(userIndex + 1).padStart(10, '0')}`,
    post_id: post.id,
    usuario_id: u.schemaId,
    created_at: post.created_at,
    tipo: userIndex % 2 === 0 ? 'like' : 'amen',
  }))
);

export const comentarios = publicaciones.slice(0, 4).map((post, index) => ({
  id: `74000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  post_id: post.id,
  usuario_id: engagementUsers[index]?.schemaId,
  contenido: [
    'Listo para compartir con el grupo de jóvenes.',
    'Este material queda perfecto para la campaña del fin de semana.',
    'Lo llevamos al equipo del distrito esta noche.',
    'Excelente enfoque para redes y estados.',
  ][index],
  created_at: post.created_at,
}));

export const actividad_xp = users.map((u, index) => ({
  id: `75000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  perfil_id: u.schemaId,
  accion: index % 2 === 0 ? 'contenido_compartido' : 'mision_completada',
  puntos_ganados: index % 2 === 0 ? 50 : 120,
  fecha: `${u.joinedAt}T18:30:00Z`,
}));

export const metas_globales = [
  {
    id: '76000000-0000-4000-8000-000000000001',
    titulo: 'Compartidos nacionales del mes',
    progreso: 72,
    created_at: '2024-05-01T08:00:00Z',
  },
  {
    id: '76000000-0000-4000-8000-000000000002',
    titulo: 'Congregaciones con punto blanco',
    progreso: 41,
    created_at: '2024-05-01T08:00:00Z',
  },
];

export const seguidores = [
  { id: '77000000-0000-4000-8000-000000000001', seguidor_id: profileIds.u1, seguido_id: profileIds.u2, created_at: '2024-05-01T10:00:00Z' },
  { id: '77000000-0000-4000-8000-000000000002', seguidor_id: profileIds.u2, seguido_id: profileIds.u3, created_at: '2024-05-02T10:00:00Z' },
  { id: '77000000-0000-4000-8000-000000000003', seguidor_id: profileIds.u5, seguido_id: profileIds.u1, created_at: '2024-05-03T10:00:00Z' },
];

export const codigos_roles = [
  { id: 1, codigo: 'IPUC-ADMIN-2024', rol_asignado: 'admin', descripcion: 'Acceso equipo nacional', activo: true },
  { id: 2, codigo: 'IPUC-PASTOR-2024', rol_asignado: 'pastor', descripcion: 'Acceso pastoral por distrito', activo: true },
  { id: 3, codigo: 'IPUC-MULT-2024', rol_asignado: 'multiplicador', descripcion: 'Registro de embajadores digitales', activo: true },
];

export const llaves = [
  { id: '78000000-0000-4000-8000-000000000001', codigo: 'BGTA-CENTRO', tipo: 'distrito', distrito: 5, estado: true },
  { id: '78000000-0000-4000-8000-000000000002', codigo: 'CALI-NORTE', tipo: 'distrito', distrito: 7, estado: true },
  { id: '78000000-0000-4000-8000-000000000003', codigo: 'CARTAGENA', tipo: 'distrito', distrito: 2, estado: true },
];

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

export const schemaMetrics = {
  perfilesActivos: perfiles.filter((p) => p.cuenta_activa).length,
  publicaciones: publicaciones.length,
  comunicadosActivos: comunicados_nacionales.filter((c) => c.activo).length,
  congregaciones: congregaciones.length,
  puntosBlancos: congregaciones.filter((c) => c.es_punto_blanco).length,
  compartidos: compartidos.length,
  reacciones: reacciones.length,
  comentarios: comentarios.length,
  xpRegistrado: actividad_xp.reduce((total, item) => total + item.puntos_ganados, 0),
};

export const schemaTables = [
  { name: 'perfiles', fields: ['id', 'nombre', 'distrito', 'rango', 'xp', 'avatar_url', 'created_at', 'celular', 'nombre_completo', 'whatsapp', 'congregacion', 'email', 'rol', 'congregacion_id', 'distrito_id', 'fecha_cumpleanos', 'congregacion_nombre', 'cuenta_activa', 'puntos_xp', 'ranking_posicion', 'foto_perfil_url', 'foto_portada_url'] },
  { name: 'congregaciones', fields: ['id', 'nombre', 'direccion', 'distrito', 'latitud', 'longitud', 'lat', 'lng', 'descripcion', 'redes_sociales', 'es_punto_blanco', 'portada_url'] },
  { name: 'publicaciones', fields: ['id', 'perfil_id', 'contenido', 'tipo', 'media_url', 'created_at'] },
  { name: 'comunicados_nacionales', fields: ['id', 'contenido', 'autor_id', 'activo', 'created_at'] },
  { name: 'victorias', fields: ['id', 'created_at', 'autor_id', 'contenido', 'media_url', 'es_video', 'vistas', 'es_oficial'] },
  { name: 'actividad_xp', fields: ['id', 'perfil_id', 'accion', 'puntos_ganados', 'fecha'] },
  { name: 'compartidos', fields: ['id', 'post_id', 'usuario_id', 'red_social', 'created_at'] },
  { name: 'reacciones', fields: ['id', 'post_id', 'usuario_id', 'created_at', 'tipo'] },
  { name: 'comentarios', fields: ['id', 'post_id', 'usuario_id', 'contenido', 'created_at'] },
  { name: 'seguidores', fields: ['id', 'seguidor_id', 'seguido_id', 'created_at'] },
  { name: 'metas_globales', fields: ['id', 'titulo', 'progreso', 'created_at'] },
  { name: 'codigos_roles', fields: ['id', 'codigo', 'rol_asignado', 'descripcion', 'activo'] },
  { name: 'llaves', fields: ['id', 'codigo', 'tipo', 'distrito', 'estado'] },
];

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
  { name: 'Andina',    embajadores: 1120, compartidos: 41800 },
  { name: 'Caribe',    embajadores: 842,  compartidos: 28400 },
  { name: 'Pacífica',  embajadores: 634,  compartidos: 21200 },
  { name: 'Orinoquía', embajadores: 424,  compartidos: 14200 },
  { name: 'Amazonía',  embajadores: 289,  compartidos: 9800  },
];
