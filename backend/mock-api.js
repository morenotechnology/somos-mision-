import http from 'node:http';
import { randomUUID } from 'node:crypto';
import {
  actividad_xp,
  badges,
  codigos_roles,
  comentarios,
  compartidos,
  comunicados_nacionales,
  congregaciones,
  contentItems,
  coordinations,
  districts,
  globalMetrics,
  llaves,
  metas_globales,
  missions,
  perfiles,
  publicaciones,
  reacciones,
  regionActivity,
  regions,
  schemaMetrics,
  schemaTables,
  seguidores,
  users,
  victorias,
  weeklyActivity,
} from '../src/data/mockData.js';

const HOST = process.env.MOCK_API_HOST || '127.0.0.1';
const PORT = Number(process.env.MOCK_API_PORT || 8787);
const LATENCY_MS = Number(process.env.MOCK_API_LATENCY_MS || 120);
const CORS_ORIGIN = process.env.MOCK_API_CORS_ORIGIN || '*';

const clone = (value) => JSON.parse(JSON.stringify(value));

const db = {
  actividad_xp: clone(actividad_xp),
  badges: clone(badges),
  codigos_roles: clone(codigos_roles),
  comentarios: clone(comentarios),
  compartidos: clone(compartidos),
  comunicados_nacionales: clone(comunicados_nacionales),
  congregaciones: clone(congregaciones),
  contentItems: clone(contentItems),
  coordinations: clone(coordinations),
  districts: clone(districts),
  globalMetrics: clone(globalMetrics),
  llaves: clone(llaves),
  metas_globales: clone(metas_globales),
  missions: clone(missions),
  perfiles: clone(perfiles),
  publicaciones: clone(publicaciones),
  reacciones: clone(reacciones),
  regionActivity: clone(regionActivity),
  regions: clone(regions),
  schemaMetrics: clone(schemaMetrics),
  schemaTables: clone(schemaTables),
  seguidores: clone(seguidores),
  users: clone(users),
  victorias: clone(victorias),
  weeklyActivity: clone(weeklyActivity),
};

const tableRoutes = {
  'actividad-xp': { key: 'actividad_xp', id: 'id' },
  badges: { key: 'badges', id: 'id' },
  'codigos-roles': { key: 'codigos_roles', id: 'id' },
  comentarios: { key: 'comentarios', id: 'id' },
  compartidos: { key: 'compartidos', id: 'id' },
  'comunicados-nacionales': { key: 'comunicados_nacionales', id: 'id' },
  congregaciones: { key: 'congregaciones', id: 'id' },
  content: { key: 'contentItems', id: 'id' },
  coordinations: { key: 'coordinations', id: 'id' },
  districts: { key: 'districts', id: 'id' },
  llaves: { key: 'llaves', id: 'id' },
  'metas-globales': { key: 'metas_globales', id: 'id' },
  missions: { key: 'missions', id: 'id' },
  perfiles: { key: 'perfiles', id: 'id' },
  publicaciones: { key: 'publicaciones', id: 'id' },
  reacciones: { key: 'reacciones', id: 'id' },
  regions: { key: 'regions', id: 'id' },
  seguidores: { key: 'seguidores', id: 'id' },
  users: { key: 'users', id: 'id' },
  victorias: { key: 'victorias', id: 'id' },
};

const roleDemoMap = {
  admin: 'admin@ipuc.org',
  pastor: 'maria@ipuc.org',
  multiplicador: 'carlos@ipuc.org',
};

function wait(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function json(res, status, payload) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function noContent(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  });
  res.end();
}

function notFound(res, message = 'Endpoint no encontrado') {
  json(res, 404, { ok: false, error: message });
}

function badRequest(res, message = 'Solicitud inválida') {
  json(res, 400, { ok: false, error: message });
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function queryObject(url) {
  return Object.fromEntries(url.searchParams.entries());
}

function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

function matchesId(row, id, idField = 'id') {
  return String(row[idField]) === String(id) || String(row.id) === String(id);
}

function applyGenericFilters(rows, query) {
  let result = [...rows];

  if (query.q) {
    const q = normalize(query.q);
    result = result.filter((row) => normalize(JSON.stringify(row)).includes(q));
  }

  if (query.role || query.rol) {
    const role = query.role || query.rol;
    result = result.filter((row) => row.role === role || row.rol === role);
  }

  if (query.region) {
    result = result.filter((row) => row.region === query.region || row.regionId === query.region);
  }

  if (query.district || query.distrito) {
    const district = query.district || query.distrito;
    result = result.filter((row) => row.district === district || row.distrito === district || row.distrito_id === district);
  }

  if (query.tipo || query.format) {
    const type = query.tipo || query.format;
    result = result.filter((row) => row.tipo === type || row.format === type);
  }

  if (query.coordination) {
    result = result.filter((row) => row.coordination === query.coordination);
  }

  if (query.active != null || query.activo != null) {
    const active = (query.active ?? query.activo) === 'true';
    result = result.filter((row) => row.active === active || row.activo === active || row.cuenta_activa === active);
  }

  return result;
}

function sortContent(items, sort = 'recientes') {
  if (sort === 'populares') return [...items].sort((a, b) => b.shares - a.shares);
  if (sort === 'destacados') return [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
  return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getUserByAnyId(id) {
  return db.users.find((user) => [user.id, user.schemaId, user.email].map(String).includes(String(id)));
}

function getProfileByUser(user) {
  if (!user) return null;
  return db.perfiles.find((profile) => profile.id === user.schemaId || profile.email === user.email) || null;
}

function createActivity({ perfil_id, accion, puntos_ganados }) {
  const activity = {
    id: randomUUID(),
    perfil_id,
    accion,
    puntos_ganados,
    fecha: new Date().toISOString(),
  };
  db.actividad_xp.unshift(activity);
  return activity;
}

function buildDashboard(query) {
  const requestedRole = query.role || 'multiplicador';
  const user = getUserByAnyId(query.userId) || db.users.find((item) => item.role === requestedRole) || db.users[0];
  const userBadges = db.badges.filter((badge) => user.badges?.includes(badge.id));
  const dailyMissions = db.missions.filter((mission) => mission.type === 'daily');
  const topUsers = [...db.users].sort((a, b) => b.xp - a.xp).slice(0, 10);
  const regionUsers = db.users.filter((item) => item.region === user.region && item.role === 'multiplicador');

  return {
    user,
    profile: getProfileByUser(user),
    metrics: db.globalMetrics,
    schemaMetrics: db.schemaMetrics,
    weeklyActivity: db.weeklyActivity,
    regionActivity: db.regionActivity,
    missions: dailyMissions,
    topUsers,
    regionUsers,
    badges: userBadges,
  };
}

function buildHub(query) {
  const q = normalize(query.q);
  let items = db.contentItems.filter((item) => {
    const matchesSearch = !q || normalize(`${item.title} ${item.description} ${item.copyText}`).includes(q);
    const matchesFormat = !query.format || query.format === 'Todos' || item.format === query.format;
    const matchesCoord = !query.coordination || item.coordination === query.coordination;
    return matchesSearch && matchesFormat && matchesCoord;
  });

  items = sortContent(items, normalize(query.sort || 'recientes'));

  return {
    items,
    count: items.length,
    coordinations: db.coordinations,
    schemaMetrics: db.schemaMetrics,
  };
}

async function handleAuth(req, res, segments) {
  const body = await readBody(req);

  if (req.method === 'POST' && segments[1] === 'login') {
    const role = body.role || 'multiplicador';
    const email = body.email || roleDemoMap[role];
    const user = db.users.find((item) => item.email === email) || db.users.find((item) => item.role === role);
    if (!user) return badRequest(res, 'No existe usuario demo para ese rol');

    return json(res, 200, {
      ok: true,
      data: {
        user,
        profile: getProfileByUser(user),
        session: {
          access_token: `mock-token-${role}-${Date.now()}`,
          token_type: 'Bearer',
          expires_in: 3600,
        },
      },
    });
  }

  if (req.method === 'POST' && segments[1] === 'register') {
    const requestedRole = body.role || body.rol || 'multiplicador';
    const role = requestedRole === 'pastor' && body.accessKey === 'IPUC2026MISION'
      ? 'pastor'
      : 'multiplicador';
    const id = `u${db.users.length + 1}`;
    const schemaId = randomUUID();
    const name = body.name || body.nombre_completo || 'Nuevo Embajador';
    const email = body.email || `usuario-${Date.now()}@ipuc.org`;
    const congregationName = body.congregation || body.congregacion_nombre || body.congregacion || 'Misiones Nacionales';

    const user = {
      id,
      schemaId,
      name,
      email,
      role,
      region: body.region || 'r3',
      district: body.district || body.distrito_id || 'd5',
      congregation: congregationName,
      congregationId: Number(body.congregacion_id || 108),
      xp: 100,
      level: 1,
      streak: 0,
      shared: 0,
      missionsCompleted: 0,
      badges: ['b1'],
      avatar: name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'NE',
      avatarColor: '#1A237E',
      joinedAt: new Date().toISOString().slice(0, 10),
      active: true,
    };

    const profile = {
      id: schemaId,
      nombre: name.split(' ')[0],
      nombre_completo: name,
      email,
      rol: role,
      distrito: body.distrito || '',
      distrito_id: user.district,
      congregacion: congregationName,
      congregacion_id: user.congregationId,
      congregacion_nombre: congregationName,
      xp: 100,
      puntos_xp: 100,
      rango: 'Nivel 1',
      avatar_url: null,
      foto_perfil_url: null,
      foto_portada_url: null,
      avatar: user.avatar,
      avatarColor: user.avatarColor,
      created_at: new Date().toISOString(),
      celular: body.phone || body.celular || '',
      whatsapp: body.whatsapp || body.phone || '',
      fecha_cumpleanos: body.fecha_cumpleanos || null,
      deletion_requested_at: null,
      cuenta_activa: true,
      ranking_posicion: db.users.length + 1,
      mostrar_celular: false,
      mostrar_cumpleanos: false,
      mostrar_congregacion: true,
      mostrar_email: false,
      mostrar_distrito: true,
    };

    db.users.push(user);
    db.perfiles.push(profile);
    createActivity({ perfil_id: schemaId, accion: 'registro', puntos_ganados: 100 });

    return json(res, 201, { ok: true, data: { user, profile } });
  }

  return notFound(res);
}

async function handleContentMutation(req, res, segments) {
  const contentId = segments[1];
  const action = segments[2];

  if (req.method === 'POST' && action === 'share') {
    const body = await readBody(req);
    const content = db.contentItems.find((item) => String(item.id) === String(contentId));
    if (!content) return notFound(res, 'Contenido no encontrado');

    const user = getUserByAnyId(body.usuario_id || body.userId || body.perfil_id) || db.users[0];
    const shared = {
      id: randomUUID(),
      post_id: content.id,
      usuario_id: user.schemaId,
      red_social: body.red_social || 'whatsapp',
      created_at: new Date().toISOString(),
    };

    content.shares += 1;
    db.compartidos.unshift(shared);
    const activity = createActivity({
      perfil_id: user.schemaId,
      accion: 'contenido_compartido',
      puntos_ganados: content.xpReward,
    });

    return json(res, 201, { ok: true, data: { content, compartido: shared, actividad: activity } });
  }

  return notFound(res);
}

async function handleMissionMutation(req, res, segments) {
  const missionId = segments[1];
  const action = segments[2];

  if (req.method === 'POST' && action === 'complete') {
    const body = await readBody(req);
    const mission = db.missions.find((item) => String(item.id) === String(missionId));
    if (!mission) return notFound(res, 'Misión no encontrada');

    const user = getUserByAnyId(body.usuario_id || body.userId || body.perfil_id) || db.users[0];
    const activity = createActivity({
      perfil_id: user.schemaId,
      accion: 'mision_completada',
      puntos_ganados: mission.xpReward,
    });

    return json(res, 201, { ok: true, data: { mission, actividad: activity } });
  }

  return notFound(res);
}

async function handleTable(req, res, route, id, query) {
  const config = tableRoutes[route];
  if (!config) return notFound(res);

  const rows = db[config.key];
  if (!Array.isArray(rows)) return notFound(res);

  if (req.method === 'GET' && !id) {
    return json(res, 200, { ok: true, data: applyGenericFilters(rows, query), meta: { count: rows.length } });
  }

  const index = rows.findIndex((row) => matchesId(row, id, config.id));

  if (req.method === 'GET' && id) {
    if (index < 0) return notFound(res, 'Registro no encontrado');
    return json(res, 200, { ok: true, data: rows[index] });
  }

  if (req.method === 'POST' && !id) {
    const body = await readBody(req);
    const item = {
      id: body.id || randomUUID(),
      ...body,
      created_at: body.created_at || new Date().toISOString(),
    };
    rows.unshift(item);
    return json(res, 201, { ok: true, data: item });
  }

  if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
    if (index < 0) return notFound(res, 'Registro no encontrado');
    const body = await readBody(req);
    rows[index] = { ...rows[index], ...body };
    return json(res, 200, { ok: true, data: rows[index] });
  }

  if (req.method === 'DELETE' && id) {
    if (index < 0) return notFound(res, 'Registro no encontrado');
    const [deleted] = rows.splice(index, 1);
    return json(res, 200, { ok: true, data: deleted });
  }

  return notFound(res);
}

async function router(req, res) {
  if (req.method === 'OPTIONS') return noContent(res);

  await wait();

  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments[0] !== 'api') return notFound(res);

  const route = segments[1];
  const id = segments[2];
  const query = queryObject(url);

  if (req.method === 'GET' && route === 'health') {
    return json(res, 200, {
      ok: true,
      data: {
        app: 'Somos Misión Mock API',
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    });
  }

  if (req.method === 'GET' && route === 'schema') {
    return json(res, 200, { ok: true, data: db.schemaTables });
  }

  if (req.method === 'GET' && route === 'bootstrap') {
    return json(res, 200, {
      ok: true,
      data: {
        badges: db.badges,
        codigos_roles: db.codigos_roles,
        coordinations: db.coordinations,
        districts: db.districts,
        globalMetrics: db.globalMetrics,
        regions: db.regions,
        schemaMetrics: db.schemaMetrics,
      },
    });
  }

  if (route === 'auth') return handleAuth(req, res, segments.slice(1));

  if (req.method === 'GET' && route === 'dashboard') {
    return json(res, 200, { ok: true, data: buildDashboard(query) });
  }

  if (req.method === 'GET' && route === 'hub') {
    return json(res, 200, { ok: true, data: buildHub(query) });
  }

  if (req.method === 'GET' && route === 'ranking') {
    const ranked = [...db.users].sort((a, b) => b.xp - a.xp).map((user, index) => ({ ...user, position: index + 1 }));
    return json(res, 200, { ok: true, data: applyGenericFilters(ranked, query) });
  }

  if (route === 'content' && id && segments[4] == null && segments[3] === 'share') {
    return handleContentMutation(req, res, segments.slice(1));
  }

  if (route === 'missions' && id && segments[4] == null && segments[3] === 'complete') {
    return handleMissionMutation(req, res, segments.slice(1));
  }

  return handleTable(req, res, route, id, query);
}

const server = http.createServer((req, res) => {
  router(req, res).catch((error) => {
    console.error(error);
    json(res, 500, { ok: false, error: 'Error interno del mock API' });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Mock API listo en http://${HOST}:${PORT}/api`);
});
