// Missing-value labels are presentation only, never profile data.
const missingValues = new Set(['sin congregación', 'sin congregacion', 'sin registrar', 'sin distrito', 'sin región', 'sin region']);

export function cleanProfileContact(value) {
  const text = String(value ?? '').trim();
  return missingValues.has(text.toLocaleLowerCase('es')) ? '' : text;
}

export function profileContact(row = {}) {
  return {
    phone: cleanProfileContact(row.whatsapp) || cleanProfileContact(row.celular),
    congregation: cleanProfileContact(row.congregacion) || cleanProfileContact(row.congregations?.nombre),
  };
}
