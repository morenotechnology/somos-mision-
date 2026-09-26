// Off-screen pauses must not be mistaken for pauses made with the controls.
export function observeVideoAutoplay(media, { reducedMotion = false, document: page = document, Observer = globalThis.IntersectionObserver } = {}) {
  let visible = !Observer;
  let manuallyPaused = false;
  let disposed = false;
  let pendingPauses = 0;
  media.muted = true;
  const pause = () => { if (!media.paused) { pendingPauses++; media.pause(); } };
  const sync = () => {
    if (disposed) return;
    if (!visible || page.hidden) { pause(); return; }
    if (manuallyPaused || reducedMotion || !media.paused) return;
    const attempt = media.play();
    attempt?.then(() => { if (disposed || !visible || page.hidden) pause(); }).catch(() => {});
  };
  const onPause = () => {
    if (pendingPauses) { pendingPauses--; return; }
    if (visible && !page.hidden && !disposed && !media.ended) manuallyPaused = true;
  };
  const onPlay = () => { manuallyPaused = false; };
  const observer = Observer ? new Observer(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
    sync();
  }, { threshold: [0, 0.5] }) : null;
  media.addEventListener('pause', onPause);
  media.addEventListener('play', onPlay);
  media.addEventListener('canplay', sync);
  page.addEventListener('visibilitychange', sync);
  observer?.observe(media);
  if (!observer) sync();
  return () => {
    disposed = true;
    observer?.disconnect();
    media.removeEventListener('pause', onPause);
    media.removeEventListener('play', onPlay);
    media.removeEventListener('canplay', sync);
    page.removeEventListener('visibilitychange', sync);
    pause();
  };
}
