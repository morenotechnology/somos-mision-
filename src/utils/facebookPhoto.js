import { normalizeSocialUrl, previewMatchesSource, socialPostIdentity } from './socialMedia.js';
import { isCroppedSocialImage, isSocialCdnImage } from './socialImages.js';

const decode = value => String(value || '').replace(/&amp;/g, '&').replace(/&#(?:x26|38);/gi, '&');
const attribute = (tag, name) => decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1]);

export function extractFacebookPhoto(html, originalUrl) {
  const original = normalizeSocialUrl(originalUrl);
  const identity = socialPostIdentity(original);
  if (identity?.platform !== 'facebook' || identity.kind !== 'post' || !html || html.length > 4000000) return null;
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)];
  for (const match of tags) {
    const tag = match[0];
    if (!/\b_1p6f\b/.test(attribute(tag, 'class'))) continue;
    const imageUrl = attribute(tag, 'src');
    if (!isSocialCdnImage(imageUrl) || isCroppedSocialImage(imageUrl)) continue;
    // The photo viewer's attachment must link to the same photo ID, not an avatar.
    if (new URL(original).searchParams.has('fbid')) {
      const preceding = html.slice(Math.max(0, match.index - 2000), match.index);
      const anchor = [...preceding.matchAll(/<a\b[^>]*>/gi)].at(-1)?.[0];
      const href = attribute(anchor || '', 'href');
      if (!href || !previewMatchesSource(original, new URL(href, 'https://www.facebook.com').href)) continue;
    }
    return {imageUrl,imageWidth:Number(attribute(tag,'width')) || 0,imageHeight:Number(attribute(tag,'height')) || 0,
      sourceUrl:original,inputUrl:original,mediaVerified:true};
  }
  // Standard post OG previews are bound to this post, never to page-wide discovery.
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(match[0], 'property') !== 'og:image') continue;
    const imageUrl = attribute(match[0], 'content');
    if (isSocialCdnImage(imageUrl) && !isCroppedSocialImage(imageUrl)) {
      return {imageUrl,sourceUrl:original,inputUrl:original,mediaVerified:true};
    }
  }
  return null;
}

export async function resolveFacebookPhoto(originalUrl, fetcher = fetch) {
  const original = normalizeSocialUrl(originalUrl);
  const identity = socialPostIdentity(original);
  if (identity?.platform !== 'facebook' || identity.kind !== 'post' || !(identity.id || identity.shared)) return null;
  const signal = AbortSignal.timeout(6000);
  try {
    let target = original;
    if (identity.shared) {
      // Short links need their real post before the public attachment can be read.
      for (let hop = 0; hop < 3; hop++) {
        const page = await fetcher(target,{signal,redirect:'manual'});
        const location = page.headers?.get('location');
        if (!location) {
          if (page.ok) {
            const photo = extractFacebookPhoto(await page.text(), target);
            if (photo) return {...photo,inputUrl:original};
          }
          break;
        }
        const next = normalizeSocialUrl(new URL(location,target).href);
        if (!next || !previewMatchesSource(original,next) || socialPostIdentity(next)?.kind !== 'post') return null;
        target = next;
      }
    }
    const player = new URL('https://www.facebook.com/plugins/post.php');
    player.searchParams.set('href',target);
    player.searchParams.set('width','750');
    player.searchParams.set('show_text','false');
    const response = await fetcher(player.href,{signal,redirect:'error'});
    if (!response.ok) return null;
    const photo = extractFacebookPhoto(await response.text(),target);
    return photo ? {...photo,inputUrl:original} : null;
  } catch { return null; }
}
