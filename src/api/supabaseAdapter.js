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

const PUBLISHER_ACCESS_KEY = 'ADMIN2026MISION';
const PASTOR_ACCESS_KEY = 'IPUC2026MISION';
const DEFAULT_PUBLIC_SITE_URL = 'https://somosmisioncolombia.com';
const DISTRICT_REGION_MAP = {
  1: 'r4',
  2: 'r1',
  3: 'r4',
  4: 'r1',
  5: 'r3',
  6: 'r3',
  7: 'r2',
  8: 'r2',
  9: 'r1',
  10: 'r1',
  11: 'r5',
  12: 'r3',
  13: 'r4',
  14: 'r4',
  15: 'r1',
  16: 'r3',
  17: 'r2',
  18: 'r2',
  19: 'r2',
  20: 'r3',
  21: 'r1',
  22: 'r1',
  23: 'r5',
  24: 'r2',
  25: 'r3',
  26: 'r5',
  27: 'r2',
  28: 'r1',
  29: 'r2',
  30: 'r4',
  31: 'r3',
  32: 'r3',
  33: 'r5',
  34: 'r2',
  35: 'r2',
};

const CONTENT_REGION_ALIASES = {
  r1: ['andina', 'andes', 'montaña', 'montañas', 'd2', 'd4', 'd9', 'd10', 'd15', 'd21', 'd22', 'd28'],
  r2: ['caribe', 'costa', 'costas', 'islas', 'd7', 'd8', 'd17', 'd18', 'd19', 'd24', 'd27', 'd29', 'd34', 'd35'],
  r3: ['pacífica', 'pacifica', 'selva', 'costa pacífica', 'd5', 'd6', 'd12', 'd16', 'd20', 'd25', 'd31', 'd32'],
  r4: ['orinoquía', 'orinoquia', 'llanos', 'd1', 'd3', 'd13', 'd14', 'd30'],
  r5: ['amazónica', 'amazonica', 'amazonía', 'amazonia', 'ribereñas', 'riberena', 'd11', 'd23', 'd26', 'd33'],
};

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

function isPublicationSchemaDrift(error) {
  if (!error) return false;
  const message = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  const publicationLinkColumns = ['source_url', 'facebook_url', 'instagram_url', 'source_platform'];

  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (message.includes('schema cache') && publicationLinkColumns.some((column) => message.includes(column))) ||
    (message.includes('could not find') && publicationLinkColumns.some((column) => message.includes(column)))
  );
}

function isRpcSignatureMissing(error) {
  const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ');
  return error?.code === 'PGRST202' || message.includes('Could not find the function') || message.includes('Could not find');
}

function isProfilePermissionSchemaDrift(error) {
  if (!error) return false;
  const message = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return error.code === '42703' || error.code === 'PGRST204' || message.includes('can_publish');
}

function isProfileCompletionSchemaDrift(error) {
  if (!error) return false;
  const message = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  const profileCompletionColumns = ['tiene_cargo', 'usuario_redes', 'perfil_completo'];
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (message.includes('schema cache') && profileCompletionColumns.some((column) => message.includes(column))) ||
    (message.includes('could not find') && profileCompletionColumns.some((column) => message.includes(column)))
  );
}

function isEmailGateSchemaDrift(error) {
  if (!error) return false;
  const message = [error.message, error.details, error.hint].filter(Boolean).join(' ').toLowerCase();
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (message.includes('schema cache') && message.includes('email_gate_verified_at')) ||
    (message.includes('could not find') && message.includes('email_gate_verified_at'))
  );
}

function shouldConfirmDelayedEmailGate() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('email_gate') === 'verified';
}

function clearDelayedEmailGateFlag() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('email_gate')) return;
  url.searchParams.delete('email_gate');
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'SM';
  return `${parts[0][0] || ''}${parts[1]?.[0] || parts[0][1] || ''}`.toUpperCase();
}

function inferSocialPlatform(url = '') {
  const value = String(url || '').toLowerCase();
  if (value.includes('instagram.com')) return 'instagram';
  if (value.includes('facebook.com') || value.includes('fb.watch') || value.includes('fb.com')) return 'facebook';
  if (value.includes('whatsapp.com') || value.includes('wa.me')) return 'whatsapp';
  return '';
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

function emptyMetrics() {
  return {
    totalEmbajadores: 0,
    embajadoresActivos: 0,
    contenidosPublicados: 0,
    contenidosCompartidos: 0,
    regionesConectadas: 0,
    distritosImpactados: 0,
    xpGenerado: 0,
    misionesCompletadas: 0,
  };
}

function emptySchemaMetrics() {
  return {
    perfilesActivos: 0,
    publicaciones: 0,
    comunicadosActivos: 0,
    congregaciones: 0,
    puntosBlancos: 0,
    compartidos: 0,
    reacciones: 0,
    comentarios: 0,
    xpRegistrado: 0,
  };
}

function roleFromMetadata(meta = {}) {
  if (
    meta.rol === 'pastor' &&
    (meta.pastor_access_key === PASTOR_ACCESS_KEY || meta.publisher_access_key === PUBLISHER_ACCESS_KEY)
  ) return 'pastor';
  return 'multiplicador';
}

function canPublishFromMetadata(meta = {}) {
  return meta.rol === 'admin' || meta.publisher_access_key === PUBLISHER_ACCESS_KEY;
}

function cleanOptional(value) {
  const cleaned = String(value || '').trim();
  return cleaned || null;
}

function regionFromDistrict(districtId = '') {
  const districtNumber = Number(String(districtId).replace(/\D/g, ''));
  return DISTRICT_REGION_MAP[districtNumber] || '';
}

function normalizeSocialUsername(value = '') {
  const cleaned = String(value || '').trim().replace(/^@+/, '');
  return cleaned ? `@${cleaned}` : '';
}

function computeProfileComplete(row = {}) {
  const hasChurchRole =
    typeof row.tiene_cargo === 'boolean'
      ? row.tiene_cargo
      : row.cargo
        ? true
        : null;
  const hasPosition = hasChurchRole === false || Boolean(String(row.cargo || '').trim());
  const hasSocial = Boolean(String(row.usuario_redes || '').trim());
  return Boolean(row.perfil_completo || (hasPosition && hasSocial));
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
  const baseUrl = normalizeSiteUrl(configuredUrl || DEFAULT_PUBLIC_SITE_URL || runtimeUrl);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : undefined;
}

function authUserHasVerifiedEmail(authUser = {}) {
  const meta = authUser.user_metadata || authUser.raw_user_meta_data || {};
  return Boolean(
    authUser.email_confirmed_at ||
    authUser.confirmed_at ||
    meta.email_verified === true ||
    meta.email_verified === 'true'
  );
}

async function markDelayedEmailGateVerified(client) {
  let rpcResult = await client.rpc('mark_email_gate_verified');
  if (!rpcResult.error) return true;
  if (!isRpcSignatureMissing(rpcResult.error) && !isEmailGateSchemaDrift(rpcResult.error)) {
    throw new ApiError(rpcResult.error.message || 'No se pudo confirmar el correo', rpcResult.error.status || 500, rpcResult.error);
  }

  const sessionData = unwrap(await client.auth.getSession(), 'No se pudo recuperar la sesión');
  const userId = sessionData?.session?.user?.id;
  if (!userId) throw new ApiError('Sesión no encontrada para confirmar el correo', 401);

  const updateResult = await client
    .from('profiles')
    .update({ email_gate_verified_at: new Date().toISOString() })
    .eq('id', userId);
  if (isEmailGateSchemaDrift(updateResult.error)) return false;
  unwrap(updateResult, 'No se pudo confirmar el correo');
  return true;
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
    region_id: cleanOptional(meta.region_id) || cleanOptional(regionFromDistrict(meta.district_id)),
    district_id: cleanOptional(meta.district_id),
    congregacion_id: meta.congregacion_id ? Number(meta.congregacion_id) : null,
    congregacion: cleanOptional(meta.congregacion),
    cargo: cleanOptional(meta.cargo),
    celular: cleanOptional(meta.celular),
    whatsapp: cleanOptional(meta.whatsapp || meta.celular),
    avatar: initials(fullName),
    avatar_color: cleanOptional(meta.avatar_color) || '#1A237E',
    can_publish: canPublishFromMetadata(meta),
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
    tiene_cargo: null,
    usuario_redes: '',
    perfil_completo: false,
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
  const profileComplete = computeProfileComplete(row);
  const emailVerified = Boolean(row.email_gate_verified_at || row.email_verified);
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
    hasChurchRole: typeof row.tiene_cargo === 'boolean' ? row.tiene_cargo : row.cargo ? true : null,
    socialUsername: row.usuario_redes || '',
    profileComplete,
    xpGateLocked: false,
    emailVerified,
    emailGateLocked: false,
    phone: row.celular || row.whatsapp || '',
    xp: row.xp || 0,
    level: row.level || Math.min(Math.floor((row.xp || 0) / 500) + 1, 10),
    streak: row.streak || 0,
    canPublish: row.can_publish === true || row.rol === 'admin',
    shared: stats.sharedCount || 0,
    missionsCompleted: stats.missionsCompleted || 0,
    badges: stats.badgeIds || [],
    avatar: row.avatar || initials(row.nombre_completo),
    avatarColor: row.avatar_color || '#1A237E',
    joinedAt: row.created_at?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    active: row.cuenta_activa ?? true,
  };
}

function normalizePublicRankingRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    schemaId: row.id,
    name: row.nombre_completo,
    email: '',
    role: row.rol,
    region: row.region_id,
    regionName: row.region_name || row.region_id || 'Sin región',
    district: row.district_id,
    districtName: row.district_name || row.district_id || 'Sin distrito',
    congregation: '',
    congregationId: null,
    position: '',
    phone: '',
    xp: Number(row.xp || 0),
    level: Number(row.level || 1),
    streak: 0,
    shared: 0,
    missionsCompleted: 0,
    badges: [],
    avatar: row.avatar || initials(row.nombre_completo),
    avatarColor: row.avatar_color || '#1A237E',
    joinedAt: new Date().toISOString().slice(0, 10),
    active: true,
  };
}

function normalizePublication(row) {
  const sourceUrl = row.source_url || row.facebook_url || row.instagram_url || '';
  const sourcePlatform = row.source_platform || inferSocialPlatform(sourceUrl);
  const facebookUrl = row.facebook_url || (sourcePlatform === 'facebook' ? sourceUrl : '');
  const instagramUrl = row.instagram_url || (sourcePlatform === 'instagram' ? sourceUrl : '');

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
    sourceUrl,
    facebookUrl,
    instagramUrl,
    sourcePlatform,
    imageGradient: 'from-[#1A237E] to-[#5C1800]',
  };
}

function filterPublicationsByRegion(items, regionId) {
  if (!regionId) return items;
  const aliases = CONTENT_REGION_ALIASES[regionId] || [];
  if (!aliases.length) return items;

  return items.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    return aliases.some((alias) => haystack.includes(String(alias).toLowerCase()));
  });
}

function normalizeMission(row, completedIds = [], progressMap = new Map()) {
  const autoProgress = progressMap.get(row.id);
  const done = completedIds.includes(row.id) || autoProgress?.status === 'completed';
  const defaultStatus = row.default_status === 'locked' ? 'locked' : 'pending';
  const progress = autoProgress?.progress ?? (done ? row.goal : 0);
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    xpReward: row.xp_reward,
    goal: row.goal,
    unit: row.unit,
    icon: row.icon,
    status: done ? 'completed' : (autoProgress?.status || defaultStatus),
    progress,
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
      sharedContentIds: [...new Set(sharedRows.map((row) => String(row.publication_id)))],
      completedMissionIds: completedRows.map((row) => row.mission_id),
    };
  } catch {
    return emptyProfileStats();
  }
}

async function getProfileBundle(client, profileId, authUser = null) {
  let resolvedAuthUser = authUser;
  if (!resolvedAuthUser || resolvedAuthUser.id !== profileId || resolvedAuthUser.email_confirmed_at === undefined) {
    const authResult = await client.auth.getUser();
    if (!authResult.error && authResult.data?.user?.id === profileId) {
      resolvedAuthUser = authResult.data.user;
    }
  }

  const result = await client
    .from('profiles')
    .select(profileSelect)
    .eq('id', profileId)
    .maybeSingle();

  if (result.error) {
    throw new ApiError(result.error.message || 'No se pudo cargar el perfil', result.error.status || 500, result.error);
  }

  let row = result.data;
  if (!row && resolvedAuthUser?.id === profileId) {
    row = await ensureProfileForUser(client, resolvedAuthUser);
  }
  if (!row) throw new ApiError('Perfil no encontrado para esta cuenta', 404);

  const permissionResult = await client
    .from('profiles')
    .select('can_publish')
    .eq('id', profileId)
    .maybeSingle();
  if (!permissionResult.error) {
    row.can_publish = permissionResult.data?.can_publish === true;
  } else if (!isProfilePermissionSchemaDrift(permissionResult.error)) {
    row.can_publish = false;
  }
  if (resolvedAuthUser) {
    row.can_publish = row.can_publish || canPublishFromMetadata(resolvedAuthUser.user_metadata || resolvedAuthUser.raw_user_meta_data || {});
    row.email_verified = authUserHasVerifiedEmail(resolvedAuthUser);
  }

  const completionResult = await client
    .from('profiles')
    .select('tiene_cargo, usuario_redes, perfil_completo')
    .eq('id', profileId)
    .maybeSingle();
  if (!completionResult.error) {
    row.tiene_cargo = completionResult.data?.tiene_cargo ?? null;
    row.usuario_redes = completionResult.data?.usuario_redes || '';
    row.perfil_completo = completionResult.data?.perfil_completo === true;
  } else if (isProfileCompletionSchemaDrift(completionResult.error)) {
    row.tiene_cargo = null;
    row.usuario_redes = '';
    row.perfil_completo = false;
  }

  const emailGateResult = await client
    .from('profiles')
    .select('email_gate_verified_at')
    .eq('id', profileId)
    .maybeSingle();
  if (!emailGateResult.error) {
    row.email_gate_verified_at = emailGateResult.data?.email_gate_verified_at || null;
    row.email_verified = Boolean(row.email_gate_verified_at);
  } else if (isEmailGateSchemaDrift(emailGateResult.error)) {
    row.email_gate_verified_at = null;
    row.email_verified = authUserHasVerifiedEmail(resolvedAuthUser || {});
  }

  const stats = await getProfileStats(client, profileId);
  return {
    user: normalizeProfile(row, stats),
    profile: row,
    sharedContentIds: stats.sharedContentIds,
    completedMissionIds: stats.completedMissionIds,
  };
}

async function getAutoMissionProgressMap(client) {
  const result = await client.rpc('sync_my_mission_progress');
  if (result.error) return new Map();

  return new Map((result.data || []).map((row) => [
    row.mission_id,
    {
      progress: Number(row.progress || 0),
      status: row.computed_status || row.status || 'pending',
    },
  ]));
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
  const [globalMetricsResult, schemaMetricsResult, weeklyActivityResult, regionActivityResult] = await Promise.all([
    client.rpc('get_global_metrics'),
    client.rpc('get_schema_metrics'),
    client.rpc('get_weekly_activity'),
    client.rpc('get_region_activity'),
  ]);

  const globalMetricsRows = globalMetricsResult.error ? [] : globalMetricsResult.data;
  const schemaMetricsRows = schemaMetricsResult.error ? [] : schemaMetricsResult.data;
  const weeklyActivity = weeklyActivityResult.error ? [] : weeklyActivityResult.data;
  const regionActivity = regionActivityResult.error ? [] : regionActivityResult.data;

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
  if (!params.region && !params.q) {
    const publicRanking = await client.rpc('get_public_ranking', { limit_count: params.limit || 10 });
    if (!publicRanking.error) {
      return (publicRanking.data || []).map(normalizePublicRankingRow).filter(Boolean);
    }
  }

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
  const publicationSelectWithSource = `
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
      source_url,
      facebook_url,
      instagram_url,
      source_platform,
      created_at,
      coordination_id,
      active,
      is_official,
      coordinations:coordinations(id, name, icon, color)
    `;
  const publicationSelectBase = `
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
      source_url,
      source_platform,
      created_at,
      coordination_id,
      active,
      is_official,
      coordinations:coordinations(id, name, icon, color)
    `;
  const publicationSelectLegacy = `
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
    `;

  const buildQuery = (selectFields) => {
    let query = client
      .from('publications')
      .select(selectFields)
      .eq('active', true);

    if (params.format && params.format !== 'Todos') query = query.eq('format', params.format);
    if (params.coordination) query = query.eq('coordination_id', params.coordination);
    if (params.q) query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);

    const sort = params.sort || 'Recientes';
    if (sort === 'Populares') query = query.order('shares_count', { ascending: false });
    else if (sort === 'Destacados') query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    if (params.limit) query = query.limit(params.limit);
    return query;
  };

  const result = await buildQuery(publicationSelectWithSource);
  if (isPublicationSchemaDrift(result.error)) {
    const fallbackResult = await buildQuery(publicationSelectBase);
    if (isPublicationSchemaDrift(fallbackResult.error)) {
      const legacyRows = unwrap(await buildQuery(publicationSelectLegacy), 'No se pudo cargar el contenido');
      return filterPublicationsByRegion(legacyRows.map(normalizePublication), params.region);
    }
    const fallbackRows = unwrap(fallbackResult, 'No se pudo cargar el contenido');
    return filterPublicationsByRegion(fallbackRows.map(normalizePublication), params.region);
  }

  const rows = unwrap(result, 'No se pudo cargar el contenido');
  return filterPublicationsByRegion(rows.map(normalizePublication), params.region);
}

async function fetchCurrentSessionBundle(client) {
  const sessionData = unwrap(await client.auth.getSession(), 'No se pudo recuperar la sesión');
  const session = sessionData?.session || null;
  if (!session?.user) return null;
  if (shouldConfirmDelayedEmailGate()) {
    await markDelayedEmailGateVerified(client).catch(() => false);
    clearDelayedEmailGateFlag();
  }
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
        getReferenceData(client).catch(() => ({ regions: [], districts: [], coordinations: [], badges: [] })),
        getMetrics(client).catch(() => ({
          globalMetrics: emptyMetrics(),
          schemaMetrics: emptySchemaMetrics(),
          weeklyActivity: [],
          regionActivity: [],
        })),
        getRankingRows(client, { limit: 3 }).catch(() => []),
        getPublications(client, { limit: 6 }).catch(() => []),
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
                publisher_access_key: payload.canPublish ? payload.accessKey : null,
                region_id: payload.region || regionFromDistrict(payload.district),
                district_id: payload.district,
                congregacion_id: payload.congregationId || null,
                congregacion: payload.congregation?.trim(),
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

      async resendVerification(email) {
        const sessionData = await client.auth.getSession();
        const sessionEmail = sessionData.data?.session?.user?.email;
        const targetEmail = email || sessionEmail;
        if (!targetEmail) throw new ApiError('No encontramos el correo de la sesión actual.', 400);

        unwrap(
          await client.auth.signInWithOtp({
            email: targetEmail,
            options: {
              shouldCreateUser: false,
              emailRedirectTo: getAuthRedirectUrl('/dashboard?email_gate=verified'),
            },
          }),
          'No se pudo enviar el correo de verificación'
        );
        return true;
      },

      async confirmDelayedEmailGate() {
        return markDelayedEmailGateVerified(client);
      },
    },

    dashboard: {
      async get() {
        let sessionBundle = await fetchCurrentSessionBundle(client);
        if (!sessionBundle?.user) throw new ApiError('Sesión no encontrada', 401);

        const isPastor = sessionBundle.user.role === 'pastor';
        const regionId = sessionBundle.user.region;

        const [metrics, ranking, regionalRanking, missions, badges, missionProgress] = await Promise.all([
          getMetrics(client).catch(() => ({
            globalMetrics: emptyMetrics(),
            schemaMetrics: emptySchemaMetrics(),
            weeklyActivity: [],
            regionActivity: [],
          })),
          getRankingRows(client, { limit: 6 }).catch(() => []),
          isPastor && regionId ? getRankingRows(client, { region: regionId, limit: 30 }).catch(() => []) : Promise.resolve([]),
          client.from('missions').select('*').eq('active', true).order('order_index').then((result) => (result.error ? [] : result.data || [])),
          client.from('badges').select('*').order('xp').then((result) => (result.error ? [] : result.data || [])),
          getAutoMissionProgressMap(client).catch(() => new Map()),
        ]);

        if (missionProgress.size) {
          sessionBundle = await fetchCurrentSessionBundle(client).catch(() => sessionBundle);
        }

        return {
          user: sessionBundle.user,
          metrics: metrics.globalMetrics,
          schemaMetrics: metrics.schemaMetrics,
          weeklyActivity: metrics.weeklyActivity,
          regionActivity: metrics.regionActivity,
          missions: missions.map((mission) => normalizeMission(mission, sessionBundle.completedMissionIds, missionProgress)),
          topUsers: ranking,
          regionalUsers: regionalRanking,
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
        const selectWithSocial = `
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
              source_url,
              facebook_url,
              instagram_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const selectWithSource = `
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
              source_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const selectLegacy = `
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
            `;
        let result = await client
            .from('publications')
            .select(selectWithSocial)
            .eq('id', id)
            .single();

        if (isPublicationSchemaDrift(result.error)) {
          result = await client.from('publications').select(selectWithSource).eq('id', id).single();
        }
        if (isPublicationSchemaDrift(result.error)) {
          result = await client.from('publications').select(selectLegacy).eq('id', id).single();
        }

        const row = unwrap(result, 'No se pudo cargar la publicación');
        return normalizePublication(row);
      },

      async share(id, payload = {}) {
        let shareResult = await client.rpc('share_publication', {
          p_publication_id: Number(id),
          p_red_social: payload.red_social || 'whatsapp',
          p_share_url: payload.share_url || null,
          p_verification_status: payload.verification_status || 'opened',
          p_share_latency_ms: payload.share_latency_ms != null && Number.isFinite(Number(payload.share_latency_ms)) ? Number(payload.share_latency_ms) : null,
        });

        if (isRpcSignatureMissing(shareResult.error)) {
          shareResult = await client.rpc('share_publication', {
            p_publication_id: Number(id),
            p_red_social: payload.red_social || 'whatsapp',
            p_share_url: payload.share_url || null,
            p_verification_status: payload.verification_status || 'opened',
          });
        }

        if (isRpcSignatureMissing(shareResult.error)) {
          shareResult = await client.rpc('share_publication', {
            p_publication_id: Number(id),
            p_red_social: payload.red_social || 'whatsapp',
          });
        }

        const share = unwrap(shareResult, 'No se pudo registrar el compartido');
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
        let sessionBundle = await fetchCurrentSessionBundle(client);
        const rows = unwrap(
          await client.from('missions').select('*').eq('active', true).order('order_index'),
          'No se pudieron cargar las misiones'
        );
        const missionProgress = await getAutoMissionProgressMap(client).catch(() => new Map());
        if (missionProgress.size) {
          sessionBundle = await fetchCurrentSessionBundle(client).catch(() => sessionBundle);
        }
        const items = rows.map((row) => normalizeMission(row, sessionBundle?.completedMissionIds || [], missionProgress));
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
        const hasCompletionPayload =
          Object.prototype.hasOwnProperty.call(payload, 'hasChurchRole') ||
          Object.prototype.hasOwnProperty.call(payload, 'socialUsername') ||
          Object.prototype.hasOwnProperty.call(payload, 'usuario_redes') ||
          Object.prototype.hasOwnProperty.call(payload, 'profileComplete');

        const socialUsername = normalizeSocialUsername(payload.socialUsername || payload.usuario_redes || '');
        const hasChurchRole = payload.hasChurchRole === true
          ? true
          : payload.hasChurchRole === false
            ? false
            : null;
        const position = hasChurchRole === false ? '' : String(payload.position || payload.cargo || '').trim();
        const profileComplete = hasCompletionPayload
          ? Boolean((hasChurchRole === false || (hasChurchRole === true && position)) && socialUsername)
          : undefined;

        const update = {
          nombre_completo: payload.name,
          nombre: payload.name?.split(' ')?.[0],
          cargo: hasCompletionPayload ? position : payload.position,
          celular: payload.phone,
          whatsapp: payload.phone,
          congregacion: payload.congregation,
          region_id: payload.region,
          district_id: payload.district,
        };

        if (hasCompletionPayload) {
          update.tiene_cargo = hasChurchRole;
          update.usuario_redes = socialUsername;
          update.perfil_completo = profileComplete;
        }

        const cleanUpdate = Object.fromEntries(Object.entries(update).filter(([, value]) => value !== undefined));
        const result = await client.from('profiles').update(cleanUpdate).eq('id', id);
        if (isProfileCompletionSchemaDrift(result.error) && hasCompletionPayload) {
          throw new ApiError('Falta ejecutar el parche SQL de completar perfil en Supabase.', 400, result.error);
        }
        unwrap(result, 'No se pudo actualizar el perfil');
        const bundle = await getProfileBundle(client, id);
        return bundle.user;
      },
    },

    congregaciones: {
      async list(params = {}) {
        let query = client
          .from('congregations')
          .select('*, regions:regions(id, name), districts:districts(id, name, region_id)')
          .order('nombre');
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
        if (!(sessionBundle?.user?.canPublish || sessionBundle?.user?.role === 'admin')) {
          throw new ApiError('Solo los Pastor/Directivo con llave editorial pueden crear publicaciones oficiales.', 403);
        }

        const publicationSelectWithSource = `
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
              source_url,
              facebook_url,
              instagram_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const publicationSelectBase = `
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
              source_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const publicationSelectLegacy = `
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
            `;
        const basePayload = {
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
        };
        const socialPayload = {
          ...basePayload,
          source_url: payload.source_url || null,
          facebook_url: payload.facebook_url || null,
          instagram_url: payload.instagram_url || null,
          source_platform: payload.source_platform || 'manual',
        };
        const sourcePayload = {
          ...basePayload,
          source_url: payload.source_url || null,
          source_platform: payload.source_platform || 'manual',
        };

        let insertResult = await client
          .from('publications')
          .insert(socialPayload)
          .select(publicationSelectWithSource)
          .single();

        if (isPublicationSchemaDrift(insertResult.error)) {
          insertResult = await client
            .from('publications')
            .insert(sourcePayload)
            .select(publicationSelectBase)
            .single();
        }

        if (isPublicationSchemaDrift(insertResult.error)) {
          insertResult = await client
            .from('publications')
            .insert(basePayload)
            .select(publicationSelectLegacy)
            .single();
        }

        const row = unwrap(insertResult, 'No se pudo crear la publicación');
        const normalized = normalizePublication(row);
        return {
          ...normalized,
          sourceUrl: normalized.sourceUrl || payload.source_url || payload.facebook_url || payload.instagram_url || '',
          facebookUrl: normalized.facebookUrl || payload.facebook_url || '',
          instagramUrl: normalized.instagramUrl || payload.instagram_url || '',
          sourcePlatform: normalized.sourcePlatform || payload.source_platform || 'manual',
        };
      },

      async update(id, payload) {
        const sessionBundle = await fetchCurrentSessionBundle(client);
        if (!(sessionBundle?.user?.canPublish || sessionBundle?.user?.role === 'admin')) {
          throw new ApiError('Solo los administradores o Pastor/Directivo editorial pueden editar publicaciones oficiales.', 403);
        }

        const publicationSelectWithSource = `
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
              source_url,
              facebook_url,
              instagram_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const publicationSelectBase = `
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
              source_url,
              source_platform,
              created_at,
              coordination_id,
              active,
              is_official,
              coordinations:coordinations(id, name, icon, color)
            `;
        const publicationSelectLegacy = `
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
            `;
        const basePayload = {
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
        };
        const socialPayload = {
          ...basePayload,
          source_url: payload.source_url || null,
          facebook_url: payload.facebook_url || null,
          instagram_url: payload.instagram_url || null,
          source_platform: payload.source_platform || 'manual',
        };
        const sourcePayload = {
          ...basePayload,
          source_url: payload.source_url || null,
          source_platform: payload.source_platform || 'manual',
        };

        let updateResult = await client
          .from('publications')
          .update(socialPayload)
          .eq('id', id)
          .select(publicationSelectWithSource)
          .single();

        if (isPublicationSchemaDrift(updateResult.error)) {
          updateResult = await client
            .from('publications')
            .update(sourcePayload)
            .eq('id', id)
            .select(publicationSelectBase)
            .single();
        }

        if (isPublicationSchemaDrift(updateResult.error)) {
          updateResult = await client
            .from('publications')
            .update(basePayload)
            .eq('id', id)
            .select(publicationSelectLegacy)
            .single();
        }

        const row = unwrap(updateResult, 'No se pudo actualizar la publicación');
        const normalized = normalizePublication(row);
        return {
          ...normalized,
          sourceUrl: normalized.sourceUrl || payload.source_url || payload.facebook_url || payload.instagram_url || '',
          facebookUrl: normalized.facebookUrl || payload.facebook_url || '',
          instagramUrl: normalized.instagramUrl || payload.instagram_url || '',
          sourcePlatform: normalized.sourcePlatform || payload.source_platform || 'manual',
        };
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
