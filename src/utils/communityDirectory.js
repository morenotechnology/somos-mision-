import { cleanProfileContact } from './profileContact.js';

export const defaultCommunityUrl = 'https://chat.whatsapp.com/G2Al7tjnAao6k1I4swB5mv?s=hd&p=i&mlu=4';
export const communityUrl = import.meta.env?.VITE_VIP_WHATSAPP_URL?.trim() || defaultCommunityUrl;

export function invitationUrl(user, community = communityUrl) {
  const raw = String(user.phone || '').trim();
  if (!/^\+?[\d\s().-]+$/.test(raw)) return null;
  let number = raw.replace(/\D/g, '');
  if (number.startsWith('00')) number = number.slice(2);
  else if (!raw.startsWith('+') && /^3\d{9}$/.test(number)) number = '57' + number;
  else if (!raw.startsWith('+') && number.length <= 10) return null;
  if (!/^[1-9]\d{7,14}$/.test(number) || !/^https:\/\/(chat\.whatsapp\.com\/|whatsapp\.com\/channel\/)/i.test(community)) return null;
  const greeting = user.name?.trim().split(/\s+/)[0];
  const message = `¡Hola${greeting ? ', ' + greeting : ''}! Desde Misiones Nacionales te invitamos a la comunidad de WhatsApp de la Red de los 5000 Amigos. Únete aquí: ${community}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const groupDimensions = { region: 'Región', district: 'Distrito', congregation: 'Iglesia' };
const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();

export function directoryGroup(user, dimension) {
  const district = cleanProfileContact(user.districtName) || cleanProfileContact(user.district);
  const label = dimension === 'congregation' ? cleanProfileContact(user.congregation)
    : dimension === 'district' ? district : cleanProfileContact(user.regionName) || cleanProfileContact(user.region);
  if (!label) return { key: 'missing', label: 'Sin registrar' };
  if (dimension === 'congregation') return {
    key: JSON.stringify([fold(label), fold(user.district || district)]),
    label: district ? `${label} · ${district}` : label,
  };
  return { key: fold(user[dimension] || label), label };
}

export function directoryGroups(users, dimension) {
  const groups = new Map();
  for (const user of users) {
    const { key, label } = directoryGroup(user, dimension);
    const group = groups.get(key) || { key, label, count: 0 };
    group.count++;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es', { numeric: true }));
}
