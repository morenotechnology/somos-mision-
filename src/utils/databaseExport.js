import ExcelJS from 'exceljs';

const roles = { admin: 'Superadmin', pastor: 'Pastor/Directivo', multiplicador: 'Multiplicador' };
const yesNo = value => value === true ? 'Sí' : value === false ? 'No' : '';
// XML 1.0 cannot represent these control characters, even inside a text cell.
// eslint-disable-next-line no-control-regex
const text = value => value == null ? '' : String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, 32767);
const localDate = value => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  // Excel dates have no timezone. Store the Colombian wall-clock time (UTC−5).
  return new Date(parsed.getTime() - 5 * 60 * 60 * 1000);
};
const numeric = value => Number.isFinite(Number(value)) ? Number(value) : 0;

export async function createDatabaseWorkbook(data, exportedAt = new Date()) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Somos Misión Colombia';
  workbook.created = exportedAt;
  workbook.subject = 'Usuarios, publicaciones y misiones. Contiene datos personales: uso autorizado.';

  const addSheet = (name, columns, rows) => {
    const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
    sheet.columns = columns.map(([header, width, type]) => ({ header, key: header, width, style: type === 'date' ? { numFmt: 'dd/mm/yyyy hh:mm' } : type === 'text' ? { numFmt: '@' } : {} }));
    rows.forEach(row => sheet.addRow(row.map(value => typeof value === 'string' ? text(value) : value)));
    sheet.getRow(1).font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    sheet.getRow(1).height = 28;
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A237E' } };
    sheet.getRow(1).alignment = { vertical: 'middle', wrapText: true };
    sheet.eachRow((row, index) => {
      if (index === 1) return;
      row.font = { name: 'Calibri', size: 11, color: { argb: 'FF182438' } };
      row.alignment = { vertical: 'top', wrapText: true };
      if (index % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F5FA' } };
    });
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, sheet.rowCount), column: columns.length } };
    sheet.headerFooter.oddFooter = 'Somos Misión Colombia · Uso autorizado · Página &P de &N';
    return sheet;
  };

  addSheet('Usuarios', [
    ['ID', 38, 'text'], ['Nombre completo', 32], ['Correo', 36, 'text'], ['WhatsApp', 22, 'text'], ['Celular', 22, 'text'],
    ['Distrito', 20], ['Región', 20], ['Iglesia', 36], ['Cargo', 26], ['Redes sociales', 28, 'text'],
    ['Rol', 22], ['Cuenta activa', 16], ['Puede publicar', 18], ['Puntos XP', 14], ['Nivel', 10], ['Insignias', 36],
    ['Fecha de registro (Colombia)', 26, 'date'], ['Última actualización (Colombia)', 28, 'date'],
  ], (data.usuarios || []).map(p => [
    text(p.id), text(p.nombre_completo || p.name), text(p.email), text(p.whatsapp || p.celular || p.phone), text(p.celular || p.phone),
    text(p.district_name || p.districtName || p.district_id), text(p.region_name || p.regionName || p.region_id),
    text(p.church_name || p.congregacion || p.congregation), text(p.cargo || p.position), text(p.usuario_redes || p.socialUsername),
    roles[p.rol || p.role] || text(p.rol || p.role), yesNo(p.cuenta_activa ?? p.active), yesNo(p.can_publish ?? p.canPublish),
    numeric(p.xp), numeric(p.level), text(p.badge_names || p.badges?.join(', ')),
    localDate(p.created_at || p.registeredAt || p.joinedAt), localDate(p.updated_at),
  ]));

  addSheet('Publicaciones', [
    ['ID', 20, 'text'], ['Título', 45], ['Descripción', 65], ['Coordinación', 32], ['Autor', 32], ['Formato', 15],
    ['Categoría', 24], ['Fecha (Colombia)', 24, 'date'], ['Activa', 12], ['Destacada', 14], ['Oficial', 12],
    ['Me gusta', 14], ['Comentarios', 15], ['Compartidos', 16], ['Recompensa XP', 18],
    ['Enlace original', 50, 'text'], ['Facebook', 50, 'text'], ['Instagram', 50, 'text'], ['Archivo o portada', 50, 'text'], ['Texto para compartir', 65],
  ], (data.publicaciones || []).map(p => [
    text(p.id), text(p.title), text(p.description), text(p.coordination_name || p.coordinationName), text(p.author_name),
    text(p.format), text(p.category), localDate(p.created_at || p.createdAt), yesNo(p.active), yesNo(p.featured), yesNo(p.is_official),
    numeric(p.likes_count ?? p.likes), numeric(p.comments_count ?? p.commentsCount), numeric(p.shares_count ?? p.shares), numeric(p.xp_reward ?? p.xpReward),
    text(p.source_url || p.sourceUrl), text(p.facebook_url || p.facebookUrl), text(p.instagram_url || p.instagramUrl),
    text(p.media_url || p.imageUrl), text(p.copy_text || p.copyText),
  ]));

  addSheet('Misiones', [
    ['ID', 25, 'text'], ['Título', 40], ['Descripción', 65], ['Tipo', 20], ['Recompensa XP', 18], ['Activa', 12],
    ['Objetivo', 18], ['Unidad', 24], ['Orden', 12], ['Fecha (Colombia)', 24, 'date'],
  ], (data.misiones || []).map(m => [
    text(m.id), text(m.title), text(m.description), text(m.type), numeric(m.xp_reward ?? m.xpReward), yesNo(m.active),
    numeric(m.goal ?? m.target_count ?? m.target), text(m.unit), numeric(m.order_index), localDate(m.created_at),
  ]));

  return workbook.xlsx.writeBuffer();
}

export async function downloadDatabaseWorkbook(data) {
  const bytes = await createDatabaseWorkbook(data);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Somos-Mision-BDD-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
