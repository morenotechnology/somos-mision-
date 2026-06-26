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
  currentUser: null,
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
  const roleMap = { admin: 'admin@misiones.org', pastor: 'maria@misiones.org', multiplicador: 'carlos@misiones.org' };
  return state.users.find((user) => user.email === payload.email) || state.users.find((user) => user.email === roleMap[role]) || state.users[0];
}

function resolveRegisterRole(payload = {}) {
  if (payload.role === 'pastor' && payload.accessKey === 'IPUC2026MISION') return 'pastor';
  return 'multiplicador';
}

function updateMockStreak(user) {
  if (!user) return;
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = user.lastStreakDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (lastDate === today) return;
  user.streak = lastDate === yesterday ? Number(user.streak || 0) + 1 : 1;
  user.lastStreakDate = today;
}

function calculateMockShareXp(content, payload = {}) {
  const base = Number(content?.xpReward || 50);
  const featuredBonus = content?.featured ? Math.ceil(base * 0.35) : 0;
  const latency = Number(payload.share_latency_ms || 0);
  const speedBonus = latency > 0 && latency <= 5000
    ? 25
    : latency > 0 && latency <= 15000
      ? 15
      : latency > 0 && latency <= 30000
        ? 8
        : 0;
  const verifiedBonus = payload.verification_status === 'verified' ? 10 : 0;
  return Math.max(base + featuredBonus + speedBonus + verifiedBonus, 0);
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
        state.currentUser = user;
        const profile = state.perfiles.find((item) => item.id === user.schemaId || item.email === user.email);
        return resolve({ user, profile, session: { access_token: `local-mock-${user.role}`, token_type: 'Bearer' } });
      },
      register: async (payload) => {
        const role = resolveRegisterRole(payload);
        const user = {
          id: `u${state.users.length + 1}`,
          schemaId: crypto.randomUUID(),
          name: payload.name || payload.nombre_completo || 'Nuevo Multiplicador',
          email: payload.email,
          role,
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
        state.currentUser = user;
        return resolve({ user, session: { access_token: `local-mock-${user.role}`, token_type: 'Bearer' }, needsEmailConfirmation: false, betaPosition: state.users.length, betaTotal: 500 });
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
          regionActivity,
          missions: missions.filter((mission) => mission.type === 'daily'),
          topUsers: [...state.users].sort((a, b) => b.xp - a.xp),
          regionalUsers: [...state.users].filter((item) => item.region === user.region).sort((a, b) => b.xp - a.xp),
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
        const user = state.currentUser || getUser(payload);
        const network = payload.red_social || 'whatsapp';
        const existingShare = state.compartidos.find((item) => (
          String(item.post_id) === String(id)
          && String(item.usuario_id || item.user_id || '') === String(user?.schemaId || user?.id || '')
          && item.red_social === network
        ));
        const xp = existingShare ? 0 : calculateMockShareXp(content, payload);
        if (content && !existingShare) content.shares += 1;
        if (user && xp > 0) {
          user.xp = Number(user.xp || 0) + xp;
          user.level = Math.min(Math.floor(Number(user.xp || 0) / 500) + 1, 10);
          user.shared = Number(user.shared || 0) + 1;
          updateMockStreak(user);
        }
        const compartido = {
          id: existingShare?.id || crypto.randomUUID(),
          post_id: id,
          usuario_id: user?.schemaId || user?.id || payload.usuario_id || payload.userId,
          red_social: network,
          share_url: payload.share_url || content?.sourceUrl || '',
          verification_status: payload.verification_status || 'opened',
          verification_method: 'client_open_return',
          opened_at: new Date().toISOString(),
          verified_at: payload.verification_status === 'verified' ? new Date().toISOString() : null,
          share_latency_ms: payload.share_latency_ms || null,
          xp_awarded: xp,
          created_at: new Date().toISOString(),
        };
        if (existingShare) {
          Object.assign(existingShare, compartido);
        } else {
          state.compartidos.unshift(compartido);
        }
        return resolve({
          content,
          compartido,
          user,
          share: { shared_id: compartido.id, xp_ganado: xp, verification_status: compartido.verification_status, streak_dias: user?.streak || 0 },
          sharedContentIds: state.compartidos.map((item) => String(item.post_id)),
          completedMissionIds: [],
        });
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
        const createdAt = new Date().toISOString();
        const id = `cnt${state.contentItems.length + 1}`;
        const coordination = coordinations.find((item) => item.id === payload.coordination_id);
        const contentItem = {
          id,
          title: payload.title,
          description: payload.description,
          category: payload.category || 'Link social',
          coordination: payload.coordination_id || '',
          coordinationName: coordination?.name || '',
          format: payload.format || 'imagen',
          featured: Boolean(payload.featured),
          xpReward: payload.xp_reward || 50,
          shares: 0,
          likes: 0,
          createdAt,
          copyText: payload.copy_text || `${payload.title}\n\n${payload.source_url || ''}`.trim(),
          imageUrl: payload.media_url || '/hero-map.png',
          sourceUrl: payload.source_url || '',
          facebookUrl: payload.facebook_url || '',
          instagramUrl: payload.instagram_url || '',
          sourcePlatform: payload.source_platform || 'manual',
          imageGradient: 'from-[#1A237E] to-[#5C1800]',
        };
        const publication = {
          id: state.publicaciones.length + 1,
          author_profile_id: null,
          coordination_id: payload.coordination_id || null,
          title: contentItem.title,
          description: contentItem.description,
          category: contentItem.category,
          format: contentItem.format,
          featured: contentItem.featured,
          xp_reward: contentItem.xpReward,
          shares_count: 0,
          likes_count: 0,
          copy_text: contentItem.copyText,
          media_url: contentItem.imageUrl,
          source_url: contentItem.sourceUrl,
          facebook_url: contentItem.facebookUrl,
          instagram_url: contentItem.instagramUrl,
          source_platform: contentItem.sourcePlatform,
          active: true,
          is_official: true,
          created_at: createdAt,
          published_at: createdAt,
        };
        state.contentItems.unshift(contentItem);
        state.publicaciones.unshift(publication);
        return resolve(contentItem);
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
