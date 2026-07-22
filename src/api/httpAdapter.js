import { apiRequest, toQuery } from './httpClient';

const jsonBody = (payload) => JSON.stringify(payload);

export function createHttpApi() {
  return {
    health: () => apiRequest('/health'),
    bootstrap: () => apiRequest('/bootstrap'),
    schema: () => apiRequest('/schema'),

    auth: {
      login: (payload) => apiRequest('/auth/login', { method: 'POST', body: jsonBody(payload) }),
      register: (payload) => apiRequest('/auth/register', { method: 'POST', body: jsonBody(payload) }),
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
    },
  };
}
