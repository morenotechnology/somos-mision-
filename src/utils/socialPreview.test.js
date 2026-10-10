import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchSocialPreview, fetchPublicationPreview, getSocialVideoEmbed, isDirectVideoUrl, selectPublicationMedia } from './socialPreview.js';
import {archivedPublicationCover} from './publicationCoverArchive.js';

test('Facebook reels and shared videos get a player even when classified as images', () => {
  assert.match(getSocialVideoEmbed('https://www.facebook.com/reel/854838847716923').url, /plugins\/video\.php/);
  assert.match(decodeURIComponent(getSocialVideoEmbed('https://www.facebook.com/reel/854838847716923').url), /watch\/\?v=854838847716923/);
  assert.ok(getSocialVideoEmbed('https://www.facebook.com/share/v/19HbxYcSkp/'));
  assert.equal(getSocialVideoEmbed('https://www.facebook.com/share/p/example/'), null);
  assert.equal(getSocialVideoEmbed('https://www.facebook.com/share/p/example/', true), null);
  assert.match(getSocialVideoEmbed('https://www.instagram.com/reel/Example_01/').url, /\/embed\/$/);
  assert.equal(getSocialVideoEmbed('https://www.instagram.com/p/Example_01/'), null);
  assert.ok(getSocialVideoEmbed('https://youtu.be/dQw4w9WgXcQ'));
  assert.equal(getSocialVideoEmbed('https://facebook.com.evil.example/reel/123', true), null);
  assert.equal(getSocialVideoEmbed('javascript:alert(1)', true), null);
  assert.equal(isDirectVideoUrl('/media/somos-mision-bienvenida.mp4'), true);
  assert.equal(isDirectVideoUrl('https://cdn.example/video.mp4?signature=abc'), true);
  assert.equal(isDirectVideoUrl('https://www.facebook.com/reel/123'), false);
});

test('a photo wrongly saved as video never previews a suggested video or stale derived source', () => {
  const item = { format: 'video', facebookUrl: 'https://www.facebook.com/share/p/correctPost/',
    sourceUrl: 'https://www.facebook.com/reel/99999/', imageUrl: 'https://cdn.example/correct-photo.jpg' };
  const result = selectPublicationMedia(item, { inputUrl: item.facebookUrl, sourceUrl: item.facebookUrl,
    videoUrl: 'https://cdn.example/suggested-video.mp4', imageUrl: 'https://cdn.example/another-photo.jpg' });
  assert.equal(result.kind, 'image');
  assert.equal(result.video, '');
  assert.equal(result.embed, null);
  assert.equal(result.image, item.imageUrl);
  assert.deepEqual(result.links, [item.facebookUrl]);
});

test('expired or cropped Facebook CDN thumbnails are replaced by a same-origin original cover',()=>{
  const source='https://www.facebook.com/share/p/CropRegression/';
  const cropped='https://scontent.cdninstagram.com/post.jpg?stp=c230.0.691.691a_dst-jpg_e35_s640x640';
  const item={facebookUrl:source,format:'imagen',imageUrl:cropped};
  const result=selectPublicationMedia(item);
  assert.match(result.image,/^\/api\/social-cover/);
  assert.equal(new URL(result.image,'https://www.somosmisioncolombia.com').searchParams.get('url'),source);
  assert.equal(selectPublicationMedia(item,null,[result.image]).image,'');
  const manual=selectPublicationMedia({...item,imageUrl:'https://uploads.example/original.jpg'});
  assert.equal(manual.image,'https://uploads.example/original.jpg');
});

test('audited full covers win over old cropped links, including photo URL aliases',()=>{
  const cover=archivedPublicationCover('https://www.facebook.com/photo.php?fbid=1556432629843731&tracking=1');
  assert.equal(cover,'/media/publication-covers/facebook-post-27.jpg');
  assert.equal(archivedPublicationCover('https://www.facebook.com/photo/?fbid=999'),'');
  assert.equal(archivedPublicationCover('https://evil.example/photo/?fbid=1556432629843731'),'');
  const image=selectPublicationMedia({facebookUrl:'https://www.facebook.com/share/p/1BR1PYfNBu/',imageUrl:'https://scontent.cdninstagram.com/bad.jpg?stp=c230.0.691.691a'}).image;
  assert.equal(image,'/media/publication-covers/facebook-post-25.jpg');
});

test('publication fallbacks never mix a primary photo with a video from another link', async () => {
  const originalFetch = globalThis.fetch;
  const facebook = 'https://www.facebook.com/posts/551234/';
  const instagram = 'https://www.instagram.com/reel/OtherVideo/';
  let calls = 0;
  globalThis.fetch = async () => { calls++; return {ok:true,json:async()=>({data:{sourceUrl:facebook,imageUrl:'https://cdn.example/primary.jpg'}})}; };
  try {
    const preview = await fetchPublicationPreview([facebook, instagram]);
    assert.equal(calls, 1);
    assert.equal(preview.videoUrl, '');
    assert.equal(selectPublicationMedia({facebookUrl:facebook,instagramUrl:instagram,format:'imagen'},preview).embed, null);
  } finally { globalThis.fetch = originalFetch; }
});

test('a linked Instagram video can replace an unavailable Facebook video as one complete source', async () => {
  const originalFetch = globalThis.fetch;
  const facebook = 'https://www.facebook.com/reel/774433/';
  const instagram = 'https://www.instagram.com/reel/SameEditorialVideo/';
  globalThis.fetch = async input => ({ok:true,json:async()=>({data:String(input).includes('facebook')
    ? {sourceUrl:facebook,imageUrl:'https://cdn.example/fb-cover.jpg'}
    : {sourceUrl:instagram,imageUrl:'https://cdn.example/ig-cover.jpg',videoUrl:'https://cdn.example/ig.mp4'}})});
  try {
    const preview = await fetchPublicationPreview([facebook,instagram]);
    assert.equal(preview.sourceUrl,instagram);
    assert.equal(preview.imageUrl,'https://cdn.example/ig-cover.jpg');
    assert.equal(preview.videoUrl,'https://cdn.example/ig.mp4');
  } finally { globalThis.fetch = originalFetch; }
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
