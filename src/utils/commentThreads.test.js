import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommentThreads, commentDescendants, completeCommentAncestry } from './commentThreads.js';

const comments = [
  { id: 'child2', parentCommentId: 'child', createdAt: '2026-09-09T03:00:00Z' },
  { id: 'root', createdAt: '2026-09-09T01:00:00Z' },
  { id: 'other', createdAt: '2026-09-09T04:00:00Z' },
  { id: 'child', parent_comment_id: 'root', createdAt: '2026-09-09T02:00:00Z' },
];
test('reúne respuestas y respuestas a respuestas bajo su comentario original', () => {
  const threads = buildCommentThreads(comments);
  assert.deepEqual(threads.map((t) => t.root.id), ['other', 'root']);
  assert.deepEqual(threads[1].replies.map((c) => c.id), ['child', 'child2']);
});
test('elimina todos los descendientes, aunque lleguen desordenados', () => {
  assert.deepEqual([...commentDescendants(comments, 'root')].sort(), ['child', 'child2', 'root']);
  assert.deepEqual([...commentDescendants(comments, 'child2')], ['child2']);
});
test('conserva comentarios cuyo padre todavía no fue cargado', () => {
  assert.equal(buildCommentThreads([{ id: 'orphan', parentCommentId: 'missing' }])[0].root.id, 'orphan');
});
test('tolera lista vacía y datos cíclicos sin quedarse en un bucle', () => {
  assert.deepEqual(buildCommentThreads([]), []);
  assert.ok(buildCommentThreads([{ id: 'a', parentCommentId: 'b' }, { id: 'b', parentCommentId: 'a' }]).length > 0);
});

test('completa un hilo de varias generaciones fuera de una página de 50 comentarios', async () => {
  const page = Array.from({length:49}, (_, index) => ({id:`recent-${index}`, createdAt:'2026-09-09'}));
  page.unshift({id:'new-reply',parent_comment_id:'old-reply',createdAt:'2026-09-09'});
  const old = [{id:'old-reply',parent_comment_id:'old-root',createdAt:'2026-09-01'}, {id:'old-root',createdAt:'2026-08-01'}];
  const calls = [];
  const full = await completeCommentAncestry(page, async (ids) => { calls.push(ids); return old.filter(row=>ids.includes(row.id)); });
  assert.equal(page.length,50);
  assert.equal(full.length,52);
  assert.equal(full.filter(row=>row.contextOnly).length,2);
  assert.deepEqual(calls,[['old-reply'],['old-root']]);
  const thread = buildCommentThreads(full).find(t=>t.root.id==='old-root');
  assert.deepEqual(thread.replies.map(c=>c.id),['old-reply','new-reply']);
});

test('no repite búsquedas de padres eliminados', async () => {
  let calls=0;
  const full=await completeCommentAncestry([{id:'a',parentCommentId:'gone'}],async()=>{calls++; return [];});
  assert.equal(calls,1); assert.equal(full.length,1);
});
