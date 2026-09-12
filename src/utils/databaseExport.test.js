import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { createDatabaseWorkbook } from './databaseExport.js';

test('exports the three approved sheets, with private contact fields as text and Colombian dates', async () => {
  const data = {
    usuarios: [{ id: 'u-test', nombre_completo: '=TEST(1)', email: 'test@example.com', whatsapp: '+573001234567', celular: '03001234567', district_name: 'Distrito 12', church_name: 'Iglesia de prueba', rol: 'admin', cuenta_activa: true, can_publish: true, xp: 75, level: 2, created_at: '2026-09-12T15:30:00Z', password: 'excluded-secret', access_token: 'excluded-token' }],
    publicaciones: [{ id: 1, title: 'Una noticia', media_url: 'https://example.com/a.jpg', active: true, description: 'Texto\u0000 válido' }],
    misiones: [{ id: 'm1', title: 'Compartir', goal: 5, unit: 'publicaciones', xp_reward: 50 }],
  };
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await createDatabaseWorkbook(data));
  assert.deepEqual(book.worksheets.map(sheet => sheet.name), ['Usuarios', 'Publicaciones', 'Misiones']);
  const users = book.getWorksheet('Usuarios');
  assert.equal(users.getCell('B2').value, '=TEST(1)');
  assert.equal(users.getCell('B2').type, ExcelJS.ValueType.String);
  assert.equal(users.getCell('D2').value, '+573001234567');
  assert.equal(users.getCell('E2').value, '03001234567');
  assert.equal(users.getCell('F2').value, 'Distrito 12');
  assert.equal(users.getCell('H2').value, 'Iglesia de prueba');
  assert.equal(users.getCell('Q2').value.toISOString(), '2026-09-12T10:30:00.000Z');
  assert.equal(users.views[0].state, 'frozen');
  assert.equal(users.rowCount, 2);
  assert.ok(!JSON.stringify(users.getSheetValues()).includes('excluded-'));
  assert.equal(book.getWorksheet('Publicaciones').getCell('C2').value, 'Texto válido');
  assert.equal(book.getWorksheet('Misiones').getCell('G2').value, 5);
  assert.equal(book.getWorksheet('Misiones').getCell('H2').value, 'publicaciones');
});

test('empty exports still contain named, filterable sheets', async () => {
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(await createDatabaseWorkbook({}));
  for (const sheet of book.worksheets) {
    assert.equal(sheet.rowCount, 1);
    assert.ok(sheet.autoFilter);
  }
});
