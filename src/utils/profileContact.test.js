import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanProfileContact, profileContact } from './profileContact.js';

test('prioriza WhatsApp y elimina espacios', () => {
  assert.equal(profileContact({ whatsapp: ' +57 300 000 0000 ', celular: '3100000000' }).phone, '+57 300 000 0000');
});

test('usa celular cuando WhatsApp está vacío, sin inventar datos', () => {
  assert.equal(profileContact({ whatsapp: ' ', celular: '3100000000' }).phone, '3100000000');
  assert.equal(profileContact({}).phone, '');
});

test('los textos de ausencia no se guardan como iglesia', () => {
  for (const label of ['Sin congregación', 'SIN CONGREGACION', ' Sin registrar ']) {
    assert.equal(cleanProfileContact(label), '');
    assert.equal(profileContact({ congregacion: label, congregations: { nombre: 'Vista Hermosa' } }).congregation, 'Vista Hermosa');
  }
});

test('conserva la información real del perfil antes que el catálogo', () => {
  assert.equal(profileContact({ congregacion: ' Mi iglesia ', congregations: { nombre: 'Otra' } }).congregation, 'Mi iglesia');
  assert.equal(profileContact({}).congregation, '');
});
