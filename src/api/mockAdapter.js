import {
  badges,
  comentarios,
  compartidos,
  congregaciones,
  contentItems,
  coordinations,
  districts,
  globalMetrics,
  missions,
  perfiles,
  publicaciones,
  reacciones,
  regions,
  schemaMetrics,
  schemaTables,
  seguidores,
  users,
  weeklyActivity,
} from '../data/mockData';

const delay = Number(import.meta.env.VITE_MOCK_LATENCY_MS || 120);

const clone = (value) => JSON.parse(JSON.stringify(value));
const wait = () => new Promise((resolve) => setTimeout(resolve, delay));

const state = {
  comentarios: clone(comentarios),
  compartidos: clone(compartidos),
  contentItems: clone(contentItems),
  perfiles: clone(perfiles),
  publicaciones: clone(publicaciones),
  reacciones: clone(reacciones),
  seguidores: clone(seguidores),
  users: clone(users),
};

function searchRows(rows, params = {}) {
  let result = [...rows];
  if (params.q) {
    const q = String(params.q).toLowerCase();
    result = result.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }
  if (params.role || params.rol) {
    const role = params.role || params.rol;
    result = result.filter((item) => item.role === role || item.rol === role);
  }
  if (params.format) {
    result = result.filter((item) => item.format === params.format || item.tipo === params.format);
  }
  if (params.coordination) {
    result = result.filter((item) => item.coordination === params.coordination);
  }
  return result;
}

function getUser(payload = {}) {
  const role = payload.role || 'multiplicador';
  const roleMap = { admin: 'admin@ipuc.org', pastor: 'maria@ipuc.org', multiplicador: 'carlos@ipuc.org' };
  return state.users.find((user) => user.email === payload.email) || state.users.find((user) => user.email === roleMap[role]) || state.users[0];
}

async function resolve(data) {
  await wait();
  return clone(data);
}

export function createMockApi() {
  return {
    health: () => resolve({ app: 'Somos Misión local mock', status: 'ok' }),
    bootstrap: () => resolve({ badges, coordinations, districts, globalMetrics, regions, schemaMetrics }),
    schema: () => resolve(schemaTables),

    auth: {
      login: async (payload) => {
        const user = getUser(payload);
        const profile = state.perfiles.find((item) => item.id === user.schemaId || item.email === user.email);
        return resolve({ user, profile, session: { access_token: `local-mock-${user.role}`, token_type: 'Bearer' } });
      },
      register: async (payload) => {
        const user = {
          id: `u${state.users.length + 1}`,
          schemaId: crypto.randomUUID(),
          name: payload.name || payload.nombre_completo || 'Nuevo Embajador',
          email: payload.email,
          role: payload.role || 'multiplicador',
          region: payload.region || 'r3',
          district: payload.district || 'd5',
          congregation: payload.congregation || 'Misiones Nacionales',
          xp: 100,
          level: 1,
          streak: 0,
          shared: 0,
          missionsCompleted: 0,
          badges: ['b1'],
          avatar: 'NE',
          avatarColor: '#1A237E',
          joinedAt: new Date().toISOString().slice(0, 10),
          active: true,
        };
        state.users.push(user);
        return resolve({ user });
      },
    },

    dashboard: {
      get: (params) => {
        const user = getUser(params);
        return resolve({
          user,
          metrics: globalMetrics,
          schemaMetrics,
          weeklyActivity,
          missions: missions.filter((mission) => mission.type === 'daily'),
          topUsers: [...state.users].sort((a, b) => b.xp - a.xp),
          badges: badges.filter((badge) => user.badges?.includes(badge.id)),
        });
      },
    },

    hub: {
      list: (params) => resolve({ items: searchRows(state.contentItems, params), coordinations, schemaMetrics }),
    },

    ranking: {
      list: (params) => resolve(searchRows([...state.users].sort((a, b) => b.xp - a.xp), params)),
    },

    content: {
      list: (params) => resolve(searchRows(state.contentItems, params)),
      get: (id) => resolve(state.contentItems.find((item) => item.id === id)),
      share: (id, payload = {}) => {
        const content = state.contentItems.find((item) => item.id === id);
        if (content) content.shares += 1;
        const compartido = {
          id: crypto.randomUUID(),
          post_id: id,
          usuario_id: payload.usuario_id || payload.userId,
          red_social: payload.red_social || 'whatsapp',
          created_at: new Date().toISOString(),
        };
        state.compartidos.unshift(compartido);
        return resolve({ content, compartido });
      },
    },

    missions: {
      list: (params) => resolve(searchRows(missions, params)),
      complete: (id) => resolve({ mission: missions.find((mission) => mission.id === id), completed: true }),
    },

    perfiles: {
      list: (params) => resolve(searchRows(state.perfiles, params)),
      get: (id) => resolve(state.perfiles.find((profile) => profile.id === id)),
      update: (id, payload) => {
        const index = state.perfiles.findIndex((profile) => profile.id === id);
        if (index >= 0) state.perfiles[index] = { ...state.perfiles[index], ...payload };
        return resolve(state.perfiles[index]);
      },
    },

    congregaciones: {
      list: (params) => resolve(searchRows(congregaciones, params)),
      get: (id) => resolve(congregaciones.find((item) => String(item.id) === String(id))),
    },

    publicaciones: {
      list: (params) => resolve(searchRows(state.publicaciones, params)),
      create: (payload) => {
        const item = { id: state.publicaciones.length + 1, ...payload, created_at: new Date().toISOString() };
        state.publicaciones.unshift(item);
        return resolve(item);
      },
    },

    social: {
      comentarios: (params) => resolve(searchRows(state.comentarios, params)),
      compartidos: (params) => resolve(searchRows(state.compartidos, params)),
      reacciones: (params) => resolve(searchRows(state.reacciones, params)),
      seguidores: (params) => resolve(searchRows(state.seguidores, params)),
    },
  };
}
