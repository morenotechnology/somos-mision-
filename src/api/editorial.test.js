import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('local editorial create, update, export and delete; participant is denied', async () => {
  const server = await createServer({ logLevel: 'silent', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { createMockApi } = await server.ssrLoadModule('/src/api/mockAdapter.js');
    const api = createMockApi();
    await api.auth.login({ email: 'admin@misiones.org', password: 'local-test-only' });
    const payload = { title: 'Prueba editorial local', description: 'Fixture aislado; no se publica en producción.', coordination_id: 'c1', source_url: 'https://example.com', media_url: 'https://example.com/test.jpg', format: 'imagen' };
    const created = await api.publicaciones.create(payload);
    assert.equal((await api.hub.list({})).items.length, 1);
    const updated = await api.publicaciones.update(created.id, { ...payload, title: 'Prueba editada' });
    assert.equal(updated.title, 'Prueba editada');
    const exported = await api.admin.exportDatabase();
    assert.deepEqual(Object.keys(exported).sort(), ['misiones', 'publicaciones', 'usuarios']);
    assert.equal(exported.publicaciones[0].title, 'Prueba editada');
    await api.publicaciones.delete(created.id);
    assert.equal((await api.hub.list({})).items.length, 0);
    await api.auth.login({ email: 'carlos@misiones.org', password: 'local-test-only' });
    assert.throws(() => api.publicaciones.create(payload), /editorial/);
    assert.throws(() => api.admin.exportDatabase(), /superadmin/);
  } finally { await server.close(); }
});
