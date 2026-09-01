import { apiRequest, toQuery } from './httpClient';

const jsonBody = (payload) => JSON.stringify(payload);

export function createHttpApi() {
  return {
    health: () => apiRequest('/health'),
    bootstrap: () => apiRequest('/bootstrap'),
    schema: () => apiRequest('/schema'),

    auth: {
      getSession: () => Promise.resolve(null),
      onAuthStateChange: () => ({ unsubscribe() {} }),
      logout: () => Promise.resolve(true),
      login: (payload) => apiRequest('/auth/login', { method: 'POST', body: jsonBody(payload) }),
      register: (payload) => apiRequest('/auth/register', { method: 'POST', body: jsonBody(payload) }),
      resetPassword: (email) => apiRequest('/auth/reset-password', { method: 'POST', body: jsonBody({ email }) }),
      updatePassword: (password) => apiRequest('/auth/update-password', { method: 'POST', body: jsonBody({ password }) }),
    },

    dashboard: {
      get: (params) => apiRequest(`/dashboard${toQuery(params)}`),
    },

    hub: {
      list: (params) => apiRequest(`/hub${toQuery(params)}`),
    },

    ranking: {
      list: (params) => apiRequest(`/ranking${toQuery(params)}`),
    },

    content: {
      list: (params) => apiRequest(`/content${toQuery(params)}`),
      get: (id) => apiRequest(`/content/${id}`),
      share: (id, payload) => apiRequest(`/content/${id}/share`, { method: 'POST', body: jsonBody(payload) }),
    },

    missions: {
      list: (params) => apiRequest(`/missions${toQuery(params)}`),
      complete: (id, payload) => apiRequest(`/missions/${id}/complete`, { method: 'POST', body: jsonBody(payload) }),
    },

    perfiles: {
      list: (params) => apiRequest(`/perfiles${toQuery(params)}`),
      get: (id) => apiRequest(`/perfiles/${id}`),
      update: (id, payload) => apiRequest(`/perfiles/${id}`, { method: 'PATCH', body: jsonBody(payload) }),
    },

    congregaciones: {
      list: (params) => apiRequest(`/congregaciones${toQuery(params)}`),
      get: (id) => apiRequest(`/congregaciones/${id}`),
    },

    publicaciones: {
      list: (params) => apiRequest(`/publicaciones${toQuery(params)}`),
      create: (payload) => apiRequest('/publicaciones', { method: 'POST', body: jsonBody(payload) }),
      update: (id, payload) => apiRequest(`/publicaciones/${id}`, { method: 'PATCH', body: jsonBody(payload) }),
      delete: (id) => apiRequest(`/publicaciones/${id}`, { method: 'DELETE' }),
    },

    social: {
      comentarios: (params) => apiRequest(`/comentarios${toQuery(params)}`),
      compartidos: (params) => apiRequest(`/compartidos${toQuery(params)}`),
      reacciones: (params) => apiRequest(`/reacciones${toQuery(params)}`),
      seguidores: (params) => apiRequest(`/seguidores${toQuery(params)}`),
      resumen: async ({ publicationIds = [] } = {}) => {
        const summaries = await Promise.all(publicationIds.map(async (publicationId) => {
          const [reactionRows, commentRows] = await Promise.all([
            apiRequest(`/reacciones${toQuery({ publication_id: publicationId })}`),
            apiRequest(`/comentarios${toQuery({ publication_id: publicationId })}`),
          ]);
          return [String(publicationId), {
            likesCount: reactionRows.filter((row) => (row.type || row.tipo || 'like') === 'like').length,
            commentsCount: commentRows.length,
            likedByMe: false,
          }];
        }));
        return Object.fromEntries(summaries);
      },
      toggleReaction: (publicationId, type = 'like') => apiRequest('/reacciones', { method: 'POST', body: jsonBody({ publication_id: publicationId, type }) }),
      agregarComentario: (publicationId, content) => apiRequest('/comentarios', { method: 'POST', body: jsonBody({ publication_id: publicationId, contenido: content }) }),
      eliminarComentario: (commentId) => apiRequest(`/comentarios/${commentId}`, { method: 'DELETE' }),
    },
  };
}
