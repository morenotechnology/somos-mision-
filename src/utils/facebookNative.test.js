import test from 'node:test';
import assert from 'node:assert/strict';
import { extractFacebookNative, resolveFacebookNative } from './facebookNative.js';
import { normalizePreview } from './socialMedia.js';

const config = (id, extra = {}) => ({video_id:id,sd_src:`https://video.xx.fbcdn.net/${id}.mp4?efg=assetIdIsNotPostId`,original_width:576,original_height:1024,...extra});
const html = videos => `<script>requireLazy([],function(){handler({"videoData":${JSON.stringify(videos)}})});</script>`;
test('native Facebook extraction is bound to the exact video ID and original dimensions', () => {
  const original = 'https://www.facebook.com/reel/123456/';
  const native = extractFacebookNative(html([config('999999'),config('123456')])+'<img class="_1p6f img" src="https://scontent.xx.fbcdn.net/cover.jpg?x=1&amp;y=2" />', original);
  assert.equal(native.videoWidth,576);
  assert.equal(native.videoHeight,1024);
  assert.match(native.videoUrl,/123456\.mp4/);
  assert.equal(native.imageUrl,'');
  const single = extractFacebookNative(html([config('123456')])+'<img class="_1p6f img" src="https://scontent.xx.fbcdn.net/cover.jpg?x=1&amp;y=2" />',original);
  assert.equal(single.imageUrl,'https://scontent.xx.fbcdn.net/cover.jpg?x=1&y=2');
  assert.equal(normalizePreview(native,original).videoUrl,native.videoUrl);
  assert.equal(extractFacebookNative(html([config('999999')]),original),null);
});
test('shared players reject ambiguous media, private URLs, photo posts and script execution', () => {
  const original = 'https://www.facebook.com/share/v/example/';
  assert.equal(extractFacebookNative(html([config('1'),config('2')]),original),null);
  assert.equal(extractFacebookNative(html([config('1',{sd_src:'https://evil.example/video.mp4'})]),original),null);
  assert.equal(extractFacebookNative(html([config('1')]),'https://www.facebook.com/share/p/photo/'),null);
  assert.equal(extractFacebookNative('<script>throw new Error("do not execute")</script>',original),null);
  assert.ok(extractFacebookNative(html([config('1')]),original)?.mediaVerified);
});
test('shared redirects stay on Facebook and resolve the exact native video without generic media discovery', async () => {
  const seen = [];
  const fetcher = async url => {
    seen.push(url);
    if (seen.length === 1) return {ok:false,headers:{get:()=> 'https://www.facebook.com/reel/123456/?tracking=1'}};
    return {ok:true,text:async()=>html([config('123456')])};
  };
  const result = await resolveFacebookNative('https://www.facebook.com/share/v/example/',fetcher);
  assert.equal(result.sourceUrl,'https://www.facebook.com/watch/?v=123456');
  assert.equal(result.inputUrl,'https://www.facebook.com/share/v/example/');
  assert.equal(new URL(seen[1]).searchParams.get('href'),'https://www.facebook.com/reel/123456/');
  const blocked = [];
  await resolveFacebookNative('https://www.facebook.com/share/v/bad/',async url=>{
    blocked.push(url);
    return {ok:false,headers:{get:()=> 'http://127.0.0.1/private'}};
  });
  assert.ok(blocked.every(url=>new URL(url).hostname==='www.facebook.com'));
});
