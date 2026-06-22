import { ApiError } from './httpClient';
import { hasSupabaseEnv, supabase } from './supabaseClient';

const profileSelect = `
  id,
  nombre,
  nombre_completo,
  email,
  rol,
  region_id,
  district_id,
  congregacion_id,
  congregacion,
  cargo,
  celular,
  whatsapp,
  fecha_cumpleanos,
  avatar,
  avatar_color,
  avatar_url,
  foto_perfil_url,
  foto_portada_url,
  cuenta_activa,
  xp,
  level,
  streak,
  created_at,
  regions:regions(id, name, color),
  districts:districts(id, name, region_id),
  congregations:congregations(id, nombre, portada_url)
`;

const PASTOR_ACCESS_KEY = 'MISION2026NACIONAL';

function ensureClient() {
  if (!hasSupabaseEnv || !supabase) {
    throw new ApiError(
      'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Configura Supabase antes de usar la app.',
      500
    );
  }
  return supabase;
}

function unwrap(result, fallbackMessage = 'Error de Supabase') {
  if (result.error) {
    throw new ApiError(result.error.message || fallbackMessage, result.error.status || 500, result.error);
  }
  return result.data;
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SM';
  return `${parts[0][0] || ''}${parts[1]?.[0] || parts[0][1] || ''}`.toUpperCase();
}

function emptyProfileStats() {
  return {
    sharedCount: 0,
    missionsCompleted: 0,
    badgeIds: [],
    sharedContentIds: [],
    completedMissionIds: [],
  };
}

function roleFromMetadata(meta = {}) {
  if (meta.rol === 'pastor' && meta.pastor_access_key === PASTOR_ACCESS_KEY) return 'pastor';
  return 'multiplicador';
}

function cleanOptional(value) {
  const cleaned = String(value || '').trim();
  return cleaned || null;
}

function normalizeSiteUrl(url) {
  const cleaned = String(url || '').trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  return cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
}

function getAuthRedirectUrl(path = '/login') {
  const configuredUrl =
    import.meta.env.VITE_AUTH_REDIRECT_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    import.meta.env.VITE_SITE_URL;
  const runtimeUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const baseUrl = normalizeSiteUrl(configuredUrl || runtimeUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : undefined;
}

function profilePayloadFromAuthUser(authUser = {}) {
  const meta = authUser.user_metadata || authUser.raw_user_meta_data || {};
  const email = authUser.email || meta.email || '';
  const fullName = cleanOptional(meta.nombre_completo || meta.name) || email.split('@')[0] || 'Usuario Somos Misión';
  const firstName = cleanOptional(meta.nombre) || fullName.split(/\s+/)[0] || fullName;

  return {
    id: authUser.id,
    nombre: firstName,
    nombre_completo: fullName,
    email,
    rol: roleFromMetadata(meta),
    region_id: cleanOptional(meta.region_id),
    district_id: cleanOptional(meta.district_id),
    congregacion: cleanOptional(meta.congregacion),
    cargo: cleanOptional(meta.cargo),
    celular: cleanOptional(meta.celular),
    whatsapp: cleanOptional(meta.whatsapp || meta.celular),
    avatar: initials(fullName),
    avatar_color: cleanOptional(meta.avatar_color) || '#1A237E',
    cuenta_activa: true,
  };
}

function profileRowFromAuthUser(authUser) {
  if (!authUser?.id) return null;
  return {
    ...profilePayloadFromAuthUser(authUser),
    xp: 0,
    level: 1,
    streak: 0,
    created_at: authUser.created_at || new Date().toISOString(),
    regions: null,
    districts: null,
    congregations: null,
  };
}

async function ensureProfileForUser(client, authUser) {
  if (!authUser?.id) return null;

  const result = await client
    .from('profiles')
    .upsert(profilePayloadFromAuthUser(authUser), { onConflict: 'id' })
    .select(profileSelect)
    .maybeSingle();

  if (!result.error && result.data) return result.data;

  return profileRowFromAuthUser(authUser);
}

function normalizeProfile(row, stats = {}) {
  if (!row) return null;
  return {
    id: row.id,
    schemaId: row.id,
    name: row.nombre_completo,
    email: row.email,
    role: row.rol,
    region: row.region_id,
    regionName: row.regions?.name || row.region_id || 'Sin región',
    district: row.district_id,
    districtName: row.districts?.name || row.district_id || 'Sin distrito',
    congregation: row.congregacion || row.congregations?.nombre || 'Sin congregación',
    congregationId: row.congregacion_id,
    position: row.cargo || '',
    phone: row.celular || row.whatsapp || '',
    xp: row.xp || 0,
    level: row.level || Math.min(Math.floor((row.xp || 0) / 500) + 1, 10),
    streak: row.streak || 0,
    shared: stats.sharedCount || 0,
    missionsCompleted: stats.missionsCompleted || 0,
    badges: stats.badgeIds || [],
    avatar: row.avatar || initials(row.nombre_completo),
    avatarColor: row.avatar_color || '#1A237E',
    joinedAt: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    active: row.cuenta_activa ?? true,
  };
}

function normalizePublication(row) {
  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    category: row.category,
    coordination: row.coordination_id,
    coordinationName: row.coordinations?.name || '',
    format: row.format,
    featured: row.featured,
    xpReward: row.xp_reward,
    shares: row.shares_count,
    likes: row.likes_count,
    createdAt: row.created_at,
    copyText: row.copy_text,
    imageUrl: row.media_url,
    imageGradient: 'from-[#1A237E] to-[#5C1800]',
  };
}

function normalizeMission(row, completedIds = []) {
  const done = completedIds.includes(row.id);
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    xpReward: row.xp_reward,
    goal: row.goal,
    unit: row.unit,
    icon: row.icon,
    status: done ? 'completed' : row.default_status,
    progress: done ? row.goal : row.default_progress,
  };
}

function normalizeGlobalMetrics(row) {
  return {
    totalEmbajadores: Number(row?.total_embajadores || 0),
    embajadoresActivos: Number(row?.embajadores_activos || 0),
    contenidosPublicados: Number(row?.contenidos_publicados || 0),
    contenidosCompartidos: Number(row?.contenidos_compartidos || 0),
    regionesConectadas: Number(row?.regiones_conectadas || 0),
    distritosImpactados: Number(row?.distritos_impactados || 0),
    xpGenerado: Number(row?.xp_generado || 0),
    misionesCompletadas: Number(row?.misiones_completadas || 0),
  };
}

function normalizeSchemaMetrics(row) {
  return {
    perfilesActivos: Number(row?.perfiles_activos || 0),
    publicaciones: Number(row?.publicaciones || 0),
    comunicadosActivos: Number(row?.comunicados_activos || 0),
    congregaciones: Number(row?.congregaciones || 0),
    puntosBlancos: Number(row?.puntos_blancos || 0),
    compartidos: Number(row?.compartidos || 0),
    reacciones: Number(row?.reacciones || 0),
    comentarios: Number(row?.comentarios || 0),
    xpRegistrado: Number(row?.xp_registrado || 0),
  };
}

function formatRelativeTime(value) {
  if (!value) return 'Ahora';

  const diffMs = new Date(value).getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60000);

  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return formatter.format(days, 'day');
  const weeks = Math.round(days / 7);
  return formatter.format(weeks, 'week');
}

function normalizeNotification(activity, publicationMap, missionMap) {
  const createdAt = activity.fecha || new Date().toISOString();
  const publication = activity.reference_type === 'publication'
    ? publicationMap.get(Number(activity.reference_id))
    : null;
  const mission = activity.reference_type === 'mission'
    ? missionMap.get(activity.reference_id)
    : null;

  const base = {
    id: activity.id,
    time: formatRelativeTime(createdAt),
    createdAt,
    points: Number(activity.puntos_ganados || 0),
    read: Date.now() - new Date(createdAt).getTime() > 1000 * 60 * 60 * 24,
    icon: 'bell',
    color: '#1A237E',
    title: 'Nueva actividad',
    desc: 'Tu perfil registró una actividad reciente.',
  };

  if (activity.accion === 'contenido_compartido') {
    return {
      ...base,
      icon: 'share',
      color: '#22c55e',
      title: `Compartiste ${publication?.title ? `"${publication.title}"` : 'contenido oficial'}`,
      desc: `Ganaste ${base.points} XP por amplificar el mensaje desde la app.`,
    };
  }

  if (activity.accion === 'mision_completada') {
    return {
      ...base,
      icon: 'target',
      color: '#D4AF37',
      title: `Completaste ${mission?.title ? `"${mission.title}"` : 'una misión'}`,
      desc: `Recibiste ${base.points} XP y tu progreso ya quedó guardado.`,
    };
  }

  return {
    ...base,
    icon: 'zap',
    color: '#5C1800',
    title: 'XP acreditado en tu perfil',
    desc: `Se sumaron ${base.points} XP a tu avance dentro de Somos Misión.`,
  };
}

async function getNotifications(client, limit = 12) {
  const sessionBundle = await fetchCurrentSessionBundle(client);
  if (!sessionBundle?.user?.id) return [];

  const activities = unwrap(
    await client
      .from('xp_activities')
      .select('*')
      .eq('profile_id', sessionBundle.user.id)
      .order('fecha', { ascending: false })
      .limit(limit),
    'No se pudo cargar la actividad del usuario'
  );

  const publicationIds = [...new Set(
    activities
      .filter((activity) => activity.reference_type === 'publication' && activity.reference_id)
      .map((activity) => Number(activity.reference_id))
      .filter(Boolean)
  )];

  const missionIds = [...new Set(
    activities
      .filter((activity) => activity.reference_type === 'mission' && activity.reference_id)
      .map((activity) => activity.reference_id)
      .filter(Boolean)
  )];

  const [publicationRows, missionRows] = await Promise.all([
    publicationIds.length
      ? unwrap(
          await client.from('publications').select('id, title').in('id', publicationIds),
          'No se pudieron cargar las publicaciones relacionadas'
        )
      : [],
    missionIds.length
      ? unwrap(
          await client.from('missions').select('id, title').in('id', missionIds),
          'No se pudieron cargar las misiones relacionadas'
        )
      : [],
  ]);

  const publicationMap = new Map(publicationRows.map((row) => [row.id, row]));
  const missionMap = new Map(missionRows.map((row) => [row.id, row]));

  return activities.map((activity) => normalizeNotification(activity, publicationMap, missionMap));
}

async function getProfileStats(client, profileId) {
  try {
    const [sharedRows, completedRows, badgeRows] = await Promise.all([
      unwrap(await client.from('shares').select('publication_id').eq('user_id', profileId), 'No se pudo consultar los compartidos'),
      unwrap(await client.from('mission_completions').select('mission_id').eq('profile_id', profileId), 'No se pudo consultar las misiones'),
      unwrap(await client.from('profile_badges').select('badge_id').eq('profile_id', profileId), 'No se pudo consultar las insignias'),
    ]);

    return {
      sharedCount: sharedRows.length,
      missionsCompleted: completedRows.length,
      badgeIds: badgeRows.map((row) => row.badge_id),
      sharedContentIds: sharedRows.map((row) => String(row.publication_id)),
      completedMissionIds: completedRows.map((row) => row.mission_id),
    };
  } catch {
    return emptyProfileStats();
  }
}

async function getProfileBundle(client, profileId, authUser = null) {
  const result = await client
    .from('profiles')
    .select(profileSelect)
    .eq('id', profileId)
    .maybeSingle();

  if (result.error) {
    throw new ApiError(result.error.message || 'No se pudo cargar el perfil', result.error.status || 500, result.error);
  }

  let row = result.data;
  if (!row && authUser?.id === profileId) {
    row = await ensureProfileForUser(client, authUser);
  }
  if (!row) throw new ApiError('Perfil no encontrado para esta cuenta', 404);

  const stats = await getProfileStats(client, profileId);
  return {
    user: normalizeProfile(row, stats),
    profile: row,
    sharedContentIds: stats.sharedContentIds,
    completedMissionIds: stats.completedMissionIds,
  };
}

async function getReferenceData(client) {
  const [regions, districts, coordinations, badges] = await Promise.all([
    unwrap(await client.from('regions').select('*').order('name'), 'No se pudieron cargar las regiones'),
    unwrap(await client.from('districts').select('*').order('name'), 'No se pudieron cargar los distritos'),
    unwrap(await client.from('coordinations').select('*').eq('active', true).order('name'), 'No se pudieron cargar las coordinaciones'),
    unwrap(await client.from('badges').select('*').order('xp'), 'No se pudieron cargar las insignias'),
  ]);

  return { regions, districts, coordinations, badges };
}

async function getMetrics(client) {
  const [globalMetricsRows, schemaMetricsRows, weeklyActivity, regionActivity] = await Promise.all([
    unwrap(await client.rpc('get_global_metrics'), 'No se pudieron cargar las métricas globales'),
    unwrap(await client.rpc('get_schema_metrics'), 'No se pudieron cargar las métricas del schema'),
    unwrap(await client.rpc('get_weekly_activity'), 'No se pudo cargar la actividad semanal'),
    unwrap(await client.rpc('get_region_activity'), 'No se pudo cargar la actividad regional'),
  ]);

  return {
    globalMetrics: normalizeGlobalMetrics(globalMetricsRows?.[0]),
    schemaMetrics: normalizeSchemaMetrics(schemaMetricsRows?.[0]),
    weeklyActivity: (weeklyActivity || []).map((row) => ({
      day: row.day,
      shares: Number(row.shares || 0),
      xp: Number(row.xp || 0),
    })),
    regionActivity: (regionActivity || []).map((row) => ({
      name: row.name,
      embajadores: Number(row.embajadores || 0),
      compartidos: Number(row.compartidos || 0),
    })),
  };
}

async function getRankingRows(client, params = {}) {
  let query = client
    .from('profiles')
    .select(profileSelect)
    .eq('cuenta_activa', true)
    .neq('rol', 'admin')
    .order('xp', { ascending: false });

  if (params.region) query = query.eq('region_id', params.region);
  if (params.q) query = query.ilike('nombre_completo', `%${params.q}%`);
  if (params.limit) query = query.limit(params.limit);

  const rows = unwrap(await query, 'No se pudo cargar el ranking');
  return Promise.all(
    rows.map(async (row) => normalizeProfile(row, await getProfileStats(client, row.id)))
  );
}

async function getPublications(client, params = {}) {
  let query = client
    .from('publications')
    .select(`
      id,
      title,
      description,
      category,
      format,
      featured,
      xp_reward,
      shares_count,
      likes_count,
      copy_text,
      media_url,
      created_at,
      coordination_id,
      active,
      is_official,
      coordinations:coordinations(id, name, icon, color)
    `)
    .eq('active', true);

  if (params.format && params.format !== 'Todos') query = query.eq('format', params.format);
  if (params.coordination) query = query.eq('coordination_id', params.coordination);
  if (params.q) query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);

  const sort = params.sort || 'Recientes';
  if (sort === 'Populares') query = query.order('shares_count', { ascending: false });
  else if (sort === 'Destacados') query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  if (params.limit) query = query.limit(params.limit);
  const rows = unwrap(await query, 'No se pudo cargar el contenido');
  return rows.map(normalizePublication);
}

async function fetchCurrentSessionBundle(client) {
  const sessionData = unwrap(await client.auth.getSession(), 'No se pudo recuperar la sesión');
  const session = sessionData?.session || null;
  if (!session?.user) return null;
  const bundle = await getProfileBundle(client, session.user.id, session.user);
  return { ...bundle, session };
}

async function getBetaPosition(client) {
  const profileCountResult = await client.from('profiles').select('id', { count: 'exact', head: true });
  if (!profileCountResult.error) return Number(profileCountResult.count || 1);

  const metricsResult = await client.rpc('get_global_metrics');
  if (!metricsResult.error) return Number(metricsResult.data?.[0]?.total_embajadores || 1);

  return 1;
}

export function createSupabaseApi() {
  const client = ensureClient();

  return {
    health: async () => ({ app: 'Somos Misión · Supabase', status: 'ok' }),

    bootstrap: async () => {
      const [references, metrics, topUsers, featuredContent] = await Promise.all([
        getReferenceData(client),
        getMetrics(client),
        getRankingRows(client, { limit: 3 }),
        getPublications(client, { limit: 6 }),
      ]);

      return {
        ...references,
        ...metrics,
        topUsers,
        featuredContent,
      };
    },

    schema: async () => [
      { name: 'profiles' },
      { name: 'regions' },
      { name: 'districts' },
      { name: 'congregations' },
      { name: 'coordinations' },
      { name: 'publications' },
      { name: 'shares' },
      { name: 'missions' },
      { name: 'mission_completions' },
      { name: 'badges' },
      { name: 'profile_badges' },
      { name: 'xp_activities' },
    ],

    auth: {
      async login(payload) {
        const result = unwrap(
          await client.auth.signInWithPassword({ email: payload.email, password: payload.password }),
          'No se pudo iniciar sesión'
        );
        const bundle = await getProfileBundle(client, result.user.id, result.user);
        return { ...bundle, session: result.session };
      },

      async register(payload) {
        const result = unwrap(
          await client.auth.signUp({
            email: payload.email,
            password: payload.password,
            options: {
              emailRedirectTo: getAuthRedirectUrl('/login'),
              data: {
                nombre_completo: payload.name,
                nombre: payload.name?.split(' ')?.[0] || payload.name,
                rol: payload.role,
                pastor_access_key: payload.role === 'pastor' ? payload.accessKey : null,
                region_id: payload.region,
                district_id: payload.district,
                congregacion: payload.congregation,
                celular: payload.phone,
                whatsapp: payload.phone,
              },
            },
          }),
          'No se pudo registrar la cuenta'
        );

        if (!result.user) throw new ApiError('Supabase no devolvió el usuario registrado', 500);
        const bundle = result.session
          ? await getProfileBundle(client, result.user.id, result.user)
          : {
              user: normalizeProfile(profileRowFromAuthUser(result.user), emptyProfileStats()),
              profile: profileRowFromAuthUser(result.user),
              sharedContentIds: [],
              completedMissionIds: [],
            };
        const betaPosition = await getBetaPosition(client);

        return {
          ...bundle,
          session: result.session || null,
          needsEmailConfirmation: !result.session,
          betaPosition,
          betaTotal: 500,
        };
      },

      async getSession() {
        return fetchCurrentSessionBundle(client);
      },

      onAuthStateChange(callback) {
        const subscription = client.auth.onAuthStateChange((event, session) => {
          callback(event, session);
        });
        return subscription.data.subscription;
      },

      async logout() {
        unwrap(await client.auth.signOut(), 'No se pudo cerrar sesión');
        return true;
      },

      async resetPassword(email) {
        unwrap(
          await client.auth.resetPasswordForEmail(email, {
            redirectTo: getAuthRedirectUrl('/login'),
          }),
          'No se pudo enviar el correo de recuperación'
        );
        return true;
      },
    },

    dashboard: {
      async get() {
        const sessionBundle = await fetchCurrentSessionBundle(client);
        if (!sessionBundle?.user) throw new ApiError('Sesión no encontrada', 401);

        const [metrics, ranking, missions, badges] = await Promise.all([
          getMetrics(client),
          getRankingRows(client, { limit: 6 }),
          unwrap(await client.from('missions').select('*').eq('active', true).order('order_index'), 'No se pudieron cargar las misiones'),
          unwrap(await client.from('badges').select('*').order('xp'), 'No se pudieron cargar las insignias'),
        ]);

        return {
          user: sessionBundle.user,
          metrics: metrics.globalMetrics,
          schemaMetrics: metrics.schemaMetrics,
          weeklyActivity: metrics.weeklyActivity,
          regionActivity: metrics.regionActivity,
          missions: missions.map((mission) => normalizeMission(mission, sessionBundle.completedMissionIds)),
          topUsers: ranking,
          badges: badges.filter((badge) => sessionBundle.user.badges.includes(badge.id)),
          sharedContentIds: sessionBundle.sharedContentIds,
          completedMissionIds: sessionBundle.completedMissionIds,
        };
      },
    },

    hub: {
      async list(params = {}) {
        const [items, references, metrics] = await Promise.all([
          getPublications(client, params),
          getReferenceData(client),
          getMetrics(client),
        ]);

        return {
          items,
          coordinations: references.coordinations,
          schemaMetrics: metrics.schemaMetrics,
        };
      },
    },

    ranking: {
      async list(params = {}) {
        return getRankingRows(client, params);
      },
    },

    content: {
      async list(params = {}) {
        return getPublications(client, params);
      },

      async get(id) {
        const row = unwrap(
          await client
            .from('publications')
            .select(`
              id,
              title,
              description,
              category,
              format,
              featured,
              xp_reward,
              shares_count,
              likes_count,
              copy_text,
              media_url,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `)
            .eq('id', id)
            .single(),
          'No se pudo cargar la publicación'
        );
        return normalizePublication(row);
      },

      async share(id, payload = {}) {
        const share = unwrap(
          await client.rpc('share_publication', {
            p_publication_id: Number(id),
            p_red_social: payload.red_social || 'whatsapp',
          }),
          'No se pudo registrar el compartido'
        );
        const updatedContent = await this.get(id);
        const sessionBundle = await fetchCurrentSessionBundle(client);
        return {
          content: updatedContent,
          share: share?.[0] || null,
          user: sessionBundle?.user || null,
          sharedContentIds: sessionBundle?.sharedContentIds || [],
          completedMissionIds: sessionBundle?.completedMissionIds || [],
        };
      },
    },

    missions: {
      async list(params = {}) {
        const sessionBundle = await fetchCurrentSessionBundle(client);
        const rows = unwrap(
          await client.from('missions').select('*').eq('active', true).order('order_index'),
          'No se pudieron cargar las misiones'
        );
        const items = rows.map((row) => normalizeMission(row, sessionBundle?.completedMissionIds || []));
        if (!params.type) return items;
        return items.filter((item) => item.type === params.type);
      },

      async complete(id) {
        const completion = unwrap(
          await client.rpc('complete_mission_action', { p_mission_id: id }),
          'No se pudo completar la misión'
        );
        const sessionBundle = await fetchCurrentSessionBundle(client);
        return {
          completion: completion?.[0] || null,
          user: sessionBundle?.user || null,
          completedMissionIds: sessionBundle?.completedMissionIds || [],
        };
      },
    },

    perfiles: {
      async list(params = {}) {
        let query = client.from('profiles').select(profileSelect).order('xp', { ascending: false });
        if (params.q) query = query.ilike('nombre_completo', `%${params.q}%`);
        if (params.role || params.rol) query = query.eq('rol', params.role || params.rol);
        const rows = unwrap(await query, 'No se pudieron cargar los perfiles');
        return Promise.all(rows.map(async (row) => normalizeProfile(row, await getProfileStats(client, row.id))));
      },

      async get(id) {
        const targetId = id || (await fetchCurrentSessionBundle(client))?.user?.id;
        if (!targetId) throw new ApiError('Perfil no encontrado', 404);
        const bundle = await getProfileBundle(client, targetId);
        return bundle.user;
      },

      async update(id, payload) {
        const update = {
          nombre_completo: payload.name,
          nombre: payload.name?.split(' ')?.[0],
          cargo: payload.position,
          celular: payload.phone,
          whatsapp: payload.phone,
          congregacion: payload.congregation,
          region_id: payload.region,
          district_id: payload.district,
        };
        unwrap(await client.from('profiles').update(update).eq('id', id), 'No se pudo actualizar el perfil');
        const bundle = await getProfileBundle(client, id);
        return bundle.user;
      },
    },

    congregaciones: {
      async list(params = {}) {
        let query = client.from('congregations').select('*').order('nombre');
        if (params.q) query = query.ilike('nombre', `%${params.q}%`);
        if (params.district_id) query = query.eq('district_id', params.district_id);
        return unwrap(await query, 'No se pudieron cargar las congregaciones');
      },

      async get(id) {
        return unwrap(await client.from('congregations').select('*').eq('id', id).single(), 'No se pudo cargar la congregación');
      },
    },

    publicaciones: {
      async list(params = {}) {
        return getPublications(client, params);
      },

      async create(payload) {
        const sessionBundle = await fetchCurrentSessionBundle(client);
        if (!['admin', 'pastor'].includes(sessionBundle?.user?.role)) {
          throw new ApiError('Solo los perfiles Pastor/Directivo pueden crear publicaciones oficiales.', 403);
        }

        const row = unwrap(
          await client
            .from('publications')
            .insert({
              author_profile_id: sessionBundle?.user?.id || null,
              coordination_id: payload.coordination_id,
              title: payload.title,
              description: payload.description,
              category: payload.category,
              format: payload.format || 'texto',
              featured: Boolean(payload.featured),
              xp_reward: payload.xp_reward || 50,
              copy_text: payload.copy_text || payload.description,
              media_url: payload.media_url || null,
              active: true,
              is_official: true,
            })
            .select(`
              id,
              title,
              description,
              category,
              format,
              featured,
              xp_reward,
              shares_count,
              likes_count,
              copy_text,
              media_url,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `)
            .single(),
          'No se pudo crear la publicación'
        );
        return normalizePublication(row);
      },
    },

    notifications: {
      async list(params = {}) {
        return getNotifications(client, params.limit || 12);
      },
    },

    social: {
      async comentarios(params = {}) {
        let query = client.from('comments').select('*').order('created_at', { ascending: false });
        if (params.publication_id) query = query.eq('publication_id', params.publication_id);
        return unwrap(await query, 'No se pudieron cargar los comentarios');
      },

      async compartidos(params = {}) {
        let query = client.from('shares').select('*').order('created_at', { ascending: false });
        if (params.user_id) query = query.eq('user_id', params.user_id);
        return unwrap(await query, 'No se pudieron cargar los compartidos');
      },

      async reacciones(params = {}) {
        let query = client.from('reactions').select('*').order('created_at', { ascending: false });
        if (params.publication_id) query = query.eq('publication_id', params.publication_id);
        return unwrap(await query, 'No se pudieron cargar las reacciones');
      },

      async seguidores(params = {}) {
        let query = client.from('followers').select('*').order('created_at', { ascending: false });
        if (params.followed_id) query = query.eq('followed_id', params.followed_id);
        return unwrap(await query, 'No se pudieron cargar los seguidores');
      },
    },
  };
}
