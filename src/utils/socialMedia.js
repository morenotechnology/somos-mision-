// Public social links only. Canonicalization also avoids duplicate preview requests.
export function normalizeSocialUrl(value = '') {
  try {
    const url = new URL(String(value).trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port || url.href.length > 2400) return '';
    const host = url.hostname.toLowerCase().replace(/^(www|m|web|mbasic)\./, '');
    if (!['facebook.com', 'fb.com', 'fb.watch', 'instagram.com', 'youtube.com', 'youtu.be', 'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host)) return '';
    url.protocol = 'https:';
    url.hostname = host === 'fb.com' ? 'www.facebook.com' : ['facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com'].includes(host) ? `www.${host}` : host;
    if (host === 'instagram.com') {
      const post = url.pathname.match(/\/(p|reel|reels|tv)\/([\w-]+)\/?$/);
      if (post) url.pathname = `/${post[1] === 'reels' ? 'reel' : post[1]}/${post[2]}/`;
    }
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (!['v', 'id', 'story_fbid', 'fbid', 'set', 'img_index'].includes(key)) url.searchParams.delete(key);
    }
    return url.href;
  } catch { return ''; }
}

export function isDirectVideoUrl(value = '') {
  return /^(?:https?:\/\/|\/[^/])/i.test(String(value || '').trim()) && /\.(?:mp4|webm|ogg|mov|m4v|m3u8)(?:[?#]|$)/i.test(String(value).trim());
}

export function normalizePreview(data = {}, originalUrl = '') {
  const sourceUrl = normalizeSocialUrl(data.url || data.sourceUrl) || normalizeSocialUrl(originalUrl);
  const imageUrl = typeof data.image === 'string' ? data.image : data.image?.url || data.imageUrl || '';
  const videoUrl = typeof data.video === 'string' ? data.video : data.video?.url || data.videoUrl || '';
  const videoType = data.video?.type || data.videoType || '';
  // Some legitimate media URLs have no extension; accept them only with a video MIME/type.
  const playable = isDirectVideoUrl(videoUrl) || (/^https:\/\//i.test(videoUrl) && /^(?:video\/(?:mp4|webm|ogg|quicktime)|mp4|webm|mov|m4v)$/i.test(videoType));
  return {
    title: data.title || '', description: data.description || '',
    imageUrl: /^https:\/\//i.test(imageUrl) ? imageUrl : '',
    videoUrl: playable ? videoUrl : '', videoType: playable ? videoType : '',
    sourceUrl: sourceUrl && !/^\/(?:$|(?:login|accounts|checkpoint|consent|privacy)(?:\/|$))/i.test(new URL(sourceUrl).pathname) ? sourceUrl : normalizeSocialUrl(originalUrl),
  };
}
