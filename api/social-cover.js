import { normalizeSocialUrl, socialPostIdentity } from '../src/utils/socialMedia.js';
import { isSocialCdnImage, isCroppedSocialImage } from '../src/utils/socialImages.js';
import { resolvePreview } from './social-preview.js';

const MAX_BYTES = 6 * 1024 * 1024;
const types = new Set(['image/jpeg','image/png','image/webp','image/avif','image/gif']);

export async function loadSocialCover(original, {previewResolver=resolvePreview,fetcher=fetch,refresh=false} = {}) {
  const preview = await previewResolver(original,{refresh});
  if (!isSocialCdnImage(preview?.imageUrl) || isCroppedSocialImage(preview.imageUrl)) throw new Error('Portada completa no disponible');
  const response = await fetcher(preview.imageUrl,{signal:AbortSignal.timeout(7000),redirect:'error'});
  const type = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (!response.ok || !types.has(type) || Number(response.headers.get('content-length')) > MAX_BYTES) {
    await response.body?.cancel();
    throw new Error('Imagen no disponible');
  }
  const reader = response.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) throw new Error('Imagen demasiado grande');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel(); throw error; }
  if (!length) throw new Error('Imagen vacía');
  return {type,bytes:Buffer.concat(chunks,length),preview};
}

export default async function handler(req,res) {
  if (req.method !== 'GET') return res.status(405).json({error:'Método no permitido'});
  const input = new URL(req.url,'https://www.somosmisioncolombia.com');
  const original = normalizeSocialUrl(input.searchParams.get('url'));
  const identity = socialPostIdentity(original);
  if (!original || !['facebook','instagram'].includes(identity?.platform) || !(identity.id || identity.shared)) return res.status(400).json({error:'Enlace original no válido'});
  try {
    const image = await loadSocialCover(original,{refresh:input.searchParams.get('refresh')==='1'});
    res.setHeader('Content-Type',image.type);
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
    return res.status(200).send(image.bytes);
  } catch {
    res.setHeader('Cache-Control','no-store');
    return res.status(502).json({error:'No pudimos recuperar la imagen original'});
  }
}
