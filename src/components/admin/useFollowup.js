import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api';

export function useFollowup(kind, enabled) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const version = useRef(0);
  const invalidate = useCallback(() => ++version.current, []);
  const refresh = useCallback(async () => {
    const v = invalidate();
    try {
      const result = await api.admin.followup(kind);
      if (v === version.current) { setRows(result); setError(''); }
    } catch {
      if (v === version.current) setError('No se pudo sincronizar el seguimiento.');
    }
  }, [kind, invalidate]);
  useEffect(() => {
    if (!enabled) return;
    const visibleRefresh = () => { if (!document.hidden) void refresh(); };
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(visibleRefresh, 60000);
    document.addEventListener('visibilitychange', visibleRefresh);
    window.addEventListener('focus', visibleRefresh);
    return () => {
      invalidate();
      clearTimeout(initial);
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visibleRefresh);
      window.removeEventListener('focus', visibleRefresh);
    };
  }, [enabled, refresh, invalidate]);
  function applyContact(id, contact) {
    invalidate();
    setRows(current => [...(current || []).filter(r => r.member_id !== id), ...(contact ? [contact] : [])]);
  }
  return { rows, error, refresh, applyContact };
}
