import { normalizeSocialUrl } from './socialMedia.js';

export function isSocialCdnImage(value = '') {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && /^(?:[a-z0-9-]+\.)*(?:fbcdn\.net|cdninstagram\.com)$/.test(url.hostname);
  } catch { return false; }
}

export function isCroppedSocialImage(value = '') {
  if (!isSocialCdnImage(value)) return false;
  const transform = new URL(value).searchParams.get('stp') || '';
  return /(?:^|_)c\d+(?:\.|_|$)/i.test(transform);
}

export function socialCoverUrl(original = '') {
  const source = normalizeSocialUrl(original);
  return source ? `/api/social-cover?url=${encodeURIComponent(source)}&v=2` : '';
}
