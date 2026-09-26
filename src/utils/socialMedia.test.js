import test from 'node:test';
import assert from 'node:assert/strict';
import { facebookVideoPermalink, normalizeSocialUrl, normalizePreview } from './socialMedia.js';
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

test('Facebook video permalinks accept real IDs and reject unrelated/unsafe URLs', () => {
  assert.equal(facebookVideoPermalink('https://www.facebook.com/watch/?v=1210710887884576'), 'https://www.facebook.com/reel/1210710887884576/');
  assert.equal(facebookVideoPermalink('https://www.facebook.com/page/videos/choco/1210710887884576/'), 'https://www.facebook.com/reel/1210710887884576/');
  assert.equal(facebookVideoPermalink('https://web.facebook.com/reel/123/'), 'https://www.facebook.com/reel/123/');
  for (const url of ['https://evil.example/watch/?v=123','https://www.facebook.com/posts/123','https://www.facebook.com/watch/?v=not-a-video','https://www.instagram.com/reel/123/']) assert.equal(facebookVideoPermalink(url),'');
});

test('shared Facebook videos resolve their canonical playable file, not just the cover', async () => {
  const requested = [];
  const fetcher = async input => {
    requested.push(new URL(input).searchParams.get('url'));
    return {ok:true,json:async()=>({status:'success',data:requested.length === 1
      ? {url:'https://www.facebook.com/watch/?v=7654321',image:{url:'https://cdn.example/cover.jpg'}}
      : {url:'https://www.facebook.com/reel/7654321/',video:{url:'https://cdn.example/choco.mp4',type:'mp4'}}})};
  };
  const result = await resolvePreview('https://www.facebook.com/share/v/autoplayRegression/',{fetcher});
  assert.deepEqual(requested,['https://www.facebook.com/share/v/autoplayRegression/','https://www.facebook.com/reel/7654321/']);
  assert.equal(result.videoUrl,'https://cdn.example/choco.mp4');
  assert.equal(result.imageUrl,'https://cdn.example/cover.jpg');
});

test('canonical video lookup failure preserves the original cover and embed', async () => {
  let calls = 0;
  const fetcher = async()=> {
    if (++calls === 2) throw new Error('Unavailable');
    return {ok:true,json:async()=>({status:'success',data:{url:'https://www.facebook.com/watch/?v=654321',image:{url:'https://cdn.example/cover.jpg'}}})};
  };
  const result = await resolvePreview('https://www.facebook.com/share/v/autoplayFailure/',{fetcher});
  assert.equal(result.imageUrl,'https://cdn.example/cover.jpg');
  assert.equal(result.sourceUrl,'https://www.facebook.com/watch/?v=654321');
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
