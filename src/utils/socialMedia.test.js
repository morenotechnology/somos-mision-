import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSocialUrl, normalizePreview } from './socialMedia.js';
import { getSocialVideoEmbed, fetchPublicationPreview } from './socialPreview.js';
import handler, { resolvePreview } from '../../api/social-preview.js';
import { archivedPublicationCover } from './publicationCoverArchive.js';

test('only audited original links receive archived covers', () => {
  assert.equal(archivedPublicationCover('https://web.facebook.com/share/p/19VvPvJSSk/?tracking=1'), '/media/publication-covers/la-mision-nos-une.jpg');
  assert.equal(archivedPublicationCover('https://www.facebook.com/share/p/18J2vPntVD/'), '/media/publication-covers/cali.jpg');
  assert.equal(archivedPublicationCover('https://www.facebook.com/share/p/184moewxWH/'), '/media/publication-covers/orinoquia.jpg');
  assert.equal(archivedPublicationCover('https://evil.example/share/p/19VvPvJSSk/'), '');
  assert.equal(archivedPublicationCover('https://www.facebook.com/share/p/unrelated/'), '');
});

test('canonical URLs handle web Facebook, account-prefixed Instagram and reject unsafe input', () => {
  assert.equal(normalizeSocialUrl('https://web.facebook.com/reel/123/?mibextid=abc'), 'https://www.facebook.com/reel/123/');
  assert.equal(normalizeSocialUrl('https://instagram.com/ipuc/reel/ABC_123/?igsh=tracking'), 'https://www.instagram.com/reel/ABC_123/');
  for (const url of ['file:///etc/passwd', 'http://127.0.0.1/', 'https://facebook.com.evil.test/reel/123', 'https://user:password@facebook.com/reel/123', 'https://facebook.com:8443/']) assert.equal(normalizeSocialUrl(url), '');
  assert.ok(getSocialVideoEmbed('https://web.facebook.com/reel/123/'));
  assert.ok(getSocialVideoEmbed('https://www.instagram.com/ipuc/reel/ABC_123/'));
});

test('extensionless verified video sources play; login redirects never replace original posts', () => {
  const original = 'https://www.facebook.com/share/v/example/';
  const preview = normalizePreview({ url: 'https://www.facebook.com/login', video: { url: 'https://cdn.example/playback?token=sample', type: 'mp4' }, image: { url: 'https://cdn.example/cover.jpg' } }, original);
  assert.equal(preview.videoUrl, 'https://cdn.example/playback?token=sample');
  assert.equal(preview.sourceUrl, original);
  assert.equal(normalizePreview({ video: { url: 'https://example.com/post', type: 'html' } }, original).videoUrl, '');
  assert.equal(normalizePreview({ video: { url: 'javascript:alert(1)', type: 'mp4' } }, original).videoUrl, '');
});

test('server shares cached previews, bounds refreshes, and expires signed media', async () => {
  let calls = 0;
  const fetcher = async () => { calls++; return { ok: true, json: async () => ({ status: 'success', data: { image: { url: `https://cdn.example/cover-${calls}.jpg` } } }) }; };
  const url = 'https://www.facebook.com/reel/cacheRegression/';
  const [a, b] = await Promise.all([resolvePreview(url, {fetcher, now: 1000}), resolvePreview(url, {fetcher, now: 1000})]);
  assert.equal(calls, 1); assert.deepEqual(a, b);
  await resolvePreview(url, {fetcher, refresh: true, now: 2000}); assert.equal(calls, 1);
  await resolvePreview(url, {fetcher, now: 1000000}); assert.equal(calls, 2);
});

test('missing Facebook cover falls back to linked Instagram without losing the video', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => ({ ok: true, json: async () => ({data: input.includes('facebook') ? {sourceUrl:'https://www.facebook.com/reel/987654/'} : {sourceUrl:'https://www.instagram.com/reel/backupPreview/',imageUrl:'https://cdn.example/backup.jpg',videoUrl:'https://cdn.example/movie.mp4'}}) });
  try {
    const result = await fetchPublicationPreview(['https://www.facebook.com/reel/987654/', 'https://www.instagram.com/reel/backupPreview/']);
    assert.equal(result.imageUrl, 'https://cdn.example/backup.jpg');
    assert.equal(result.videoUrl, 'https://cdn.example/movie.mp4');
  } finally { globalThis.fetch = originalFetch; }
});

test('preview endpoint rejects unsupported methods and non-social URLs', async () => {
  const res = { code: 0, status(code) {this.code=code;return this;}, json(value) {return value;} };
  await handler({method:'POST',url:'/api/social-preview'},res); assert.equal(res.code,405);
  await handler({method:'GET',url:'/api/social-preview?url=http://localhost'},res); assert.equal(res.code,400);
});
