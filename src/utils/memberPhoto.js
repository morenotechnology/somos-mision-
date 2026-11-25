// Decode and re-encode instead of publishing the original file (including EXIF).
export async function prepareMemberPhoto(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024 || !file.size)
    throw new Error('Elige una foto JPG, PNG o WebP de hasta 8 MB.');
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    try { await image.decode(); } catch { throw new Error('No se pudo leer esa imagen. Prueba con otra foto.'); }
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.min(512, side);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .85));
    if (!blob || blob.size > 524288) throw new Error('No se pudo preparar la foto. Prueba con otra imagen.');
    return blob;
  } finally { URL.revokeObjectURL(source); }
}
