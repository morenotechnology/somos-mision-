export const referralXP = 400;
export function referralCode(value) {
  return /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value || '') ? value.toLowerCase() : null;
}
export function referralLink(origin, code) {
  if (!referralCode(code)) return '';
  const url = new URL('/register', origin);
  url.searchParams.set('ref', code);
  return url.href;
}
