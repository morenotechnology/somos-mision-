import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSocialPreview, getSocialVideoEmbed, isDirectVideoUrl } from './socialPreview.js';

test('Facebook reels and shared videos get a player even when classified as images', () => {
  assert.match(getSocialVideoEmbed('https://www.facebook.com/reel/854838847716923').url, /plugins\/video\.php/);
  assert.match(decodeURIComponent(getSocialVideoEmbed('https://www.facebook.com/reel/854838847716923').url), /watch\/\?v=854838847716923/);
  assert.ok(getSocialVideoEmbed('https://www.facebook.com/share/v/19HbxYcSkp/'));
  assert.equal(getSocialVideoEmbed('https://www.facebook.com/share/p/example/'), null);
  assert.ok(getSocialVideoEmbed('https://www.facebook.com/share/p/example/', true));
  assert.match(getSocialVideoEmbed('https://www.instagram.com/reel/Example_01/').url, /\/embed\/$/);
  assert.equal(getSocialVideoEmbed('https://www.instagram.com/p/Example_01/'), null);
  assert.ok(getSocialVideoEmbed('https://youtu.be/dQw4w9WgXcQ'));
  assert.equal(getSocialVideoEmbed('https://facebook.com.evil.example/reel/123', true), null);
  assert.equal(getSocialVideoEmbed('javascript:alert(1)', true), null);
  assert.equal(isDirectVideoUrl('/media/somos-mision-bienvenida.mp4'), true);
  assert.equal(isDirectVideoUrl('https://cdn.example/video.mp4?signature=abc'), true);
  assert.equal(isDirectVideoUrl('https://www.facebook.com/reel/123'), false);
});

test('preview failures are retryable and canonical video links are preserved', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return { ok: false };
    return { ok: true, json: async () => ({ data: { url: 'https://www.facebook.com/watch/?v=123', image: { url: 'https://cdn.example/cover.jpg' }, video: null } }) };
  };
  try {
    assert.equal(await fetchSocialPreview('https://www.facebook.com/share/v/testRetry'), null);
    const preview = await fetchSocialPreview('https://www.facebook.com/share/v/testRetry');
    assert.equal(preview.sourceUrl, 'https://www.facebook.com/watch/?v=123');
    assert.equal(preview.videoUrl, '');
    assert.ok(getSocialVideoEmbed(preview.sourceUrl));
    await fetchSocialPreview('https://www.facebook.com/share/v/testRetry');
    assert.equal(calls, 2);
    await fetchSocialPreview('https://www.facebook.com/share/v/testRetry', { refresh: true });
    assert.equal(calls, 3);
  } finally { globalThis.fetch = original; }
});
