// Exact originals recovered during the editorial audit, not generated placeholders.
// Keep these as a fallback for posts whose public metadata endpoint requires login.
import recovered from './publicationCoverManifest.js';
import {normalizeSocialUrl} from './socialMedia.js';

function originalKey(value) {
  const normalized = normalizeSocialUrl(value);
  if (!normalized) return '';
  const url = new URL(normalized);
  const photoId = url.hostname === 'www.facebook.com' && /^\/photo(?:\.php)?\/?$/.test(url.pathname) && url.searchParams.get('fbid');
  return photoId ? `facebook-photo:${photoId}` : normalized;
}
const recoveredCovers = new Map(recovered.flatMap(entry=>entry.originals.map(original=>[originalKey(original),`/media/publication-covers/${entry.file}`])));
const archive = [
  ['red-5000-octubre.jpg', ['/share/p/18S89KZcun/', '/ipucmisionesnacionales/posts/pfbid0228Pk4UPH5EVJZpkURJhWXwC2M5CkwVxbQRZvHoxhbdfpYyb6k9vikSTxp8PrQkHHl']],
  ['la-mision-nos-une.jpg', ['/share/p/19VvPvJSSk/', '/ipucmisionesnacionales/posts/pfbid02pU3d3tu38rCUN5k1h9EjcaQTKKg63AbPt3MqXVqtWr7e7f2orqb7RzaYUU9gcvDql']],
  ['cali.jpg', ['/share/p/18J2vPntVD/', '/ipucmisionesnacionales/posts/pfbid0i217rDUCjwozyqJjb6FbRJEjWSBz5PCMCpncaW2BRSW2mtMVWLXtzn1mrH933z8Tl']],
  ['orinoquia.jpg', ['/share/p/184moewxWH/', '/ipucmisionesnacionales/posts/pfbid025TuUZNG72puhn5WPc6XuyshmtknJUk8sZ5zxPwKE2p4hpUakmt8SbdN3kZydyv6wl']],
];
export function archivedPublicationCover(value = '') {
  const recovered = recoveredCovers.get(originalKey(value));
  if (recovered) return recovered;
  try {
    const url = new URL(value);
    if (!['facebook.com','www.facebook.com','web.facebook.com','m.facebook.com'].includes(url.hostname)) return '';
    const postId = url.pathname.match(/\/posts\/[^/]+\/(\d+)\/?$/)?.[1];
    if (postId === '1562744235879237') return '/media/publication-covers/red-5000-octubre.jpg';
    const match = archive.find(([,paths]) => paths.some(path => path.replace(/\/$/,'') === url.pathname.replace(/\/$/,'')));
    return match ? `/media/publication-covers/${match[0]}` : '';
  } catch { return ''; }
}
