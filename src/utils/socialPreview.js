const previewCache = new Map();

export function getSocialPlatform(value = '') {
  const clean = String(value || '').toLowerCase();
  if (clean.includes('instagram.com') || clean === 'instagram') {
    return { id: 'instagram', label: 'Instagram' };
  }
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com') || clean === 'facebook') {
    return { id: 'facebook', label: 'Facebook' };
  }
  return { id: 'social', label: 'Red social' };
}

export async function fetchSocialPreview(sourceUrl = '') {
  const cleanUrl = String(sourceUrl || '').trim();
  if (!/^https?:\/\//i.test(cleanUrl)) return null;
  if (previewCache.has(cleanUrl)) return previewCache.get(cleanUrl);

  const request = fetch(`https://api.microlink.io/?url=${encodeURIComponent(cleanUrl)}&screenshot=false&video=false&audio=false`)
    .then(async (response) => {
      if (!response.ok) throw new Error('No se pudo obtener la vista previa del enlace');
      const payload = await response.json();
      const data = payload?.data || {};
      return {
        title: data.title || '',
        description: data.description || '',
        imageUrl: data.image?.url || data.logo?.url || '',
      };
    })
    .catch(() => null);

  previewCache.set(cleanUrl, request);
  return request;
}
