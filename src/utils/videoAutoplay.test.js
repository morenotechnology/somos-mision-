import test from 'node:test';
import assert from 'node:assert/strict';
import { observeVideoAutoplay } from './videoAutoplay.js';

function setup(reducedMotion = false, rejectPlay = false) {
  class Media extends EventTarget {
    paused = true; muted = false; ended = false; plays = 0;
    play() { this.plays++; if (rejectPlay) return Promise.reject(new Error('Blocked')); this.paused = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
    pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
  }
  const media = new Media();
  const page = Object.assign(new EventTarget(), {hidden:false});
  let callback;
  let disconnected = false;
  class Observer {
    constructor(cb) { callback = cb; }
    observe() {}
    disconnect() { disconnected = true; }
  }
  const cleanup = observeVideoAutoplay(media, {reducedMotion, document:page, Observer});
  return {media, page, cleanup, disconnected:()=>disconnected, enter:()=>callback([{isIntersecting:true,intersectionRatio:.8}]), leave:()=>callback([{isIntersecting:false,intersectionRatio:0}])};
}

test('starts muted when visible and resumes after an off-screen pause', () => {
  const t = setup();
  assert.equal(t.media.muted,true);
  assert.equal(t.media.plays,0);
  t.enter(); assert.equal(t.media.paused,false);
  t.leave(); assert.equal(t.media.paused,true);
  t.enter(); assert.equal(t.media.paused,false);
  t.cleanup(); assert.equal(t.disconnected(),true); assert.equal(t.media.paused,true);
});

test('manual pauses survive visibility changes and canplay events', () => {
  const t = setup();
  t.enter(); t.media.pause();
  t.media.dispatchEvent(new Event('canplay'));
  t.leave(); t.enter();
  assert.equal(t.media.plays,1);
  assert.equal(t.media.paused,true);
  t.cleanup();
});

test('hiding the tab pauses and returning resumes playback', () => {
  const t = setup(); t.enter();
  t.page.hidden = true; t.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(t.media.paused,true);
  t.page.hidden = false; t.page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(t.media.paused,false);
  t.cleanup();
});

test('reduced motion leaves playback to the user', () => {
  const t = setup(true); t.enter();
  assert.equal(t.media.plays,0);
  t.media.play(); t.leave();
  assert.equal(t.media.paused,true);
  t.cleanup();
});

test('an autoplay denial does not cause an unhandled rejection', async () => {
  const t = setup(false,true); t.enter();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(t.media.paused,true);
  t.cleanup();
});
