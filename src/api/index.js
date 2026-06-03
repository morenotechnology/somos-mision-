import { createHttpApi } from './httpAdapter';
import { createMockApi } from './mockAdapter';
import { createSupabaseApi } from './supabaseAdapter';

export const apiMode = import.meta.env.VITE_API_MODE || 'supabase';

export const api = (() => {
  if (apiMode === 'http') return createHttpApi();
  if (apiMode === 'mock') return createMockApi();
  return createSupabaseApi();
})();

export { ApiError } from './httpClient';
